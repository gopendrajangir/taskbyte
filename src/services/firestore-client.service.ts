import {
  __log,
  convertToRoutineDTO,
  convertToTaskDTO,
  resetApp,
} from '@/utils';
import { deleteUser, getAuth } from '@react-native-firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
  writeBatch,
} from '@react-native-firebase/firestore';
import { Q } from '@nozbe/watermelondb';
import moment from 'moment';

import { getDatabase, getUnSyncedTasks } from '@/db';
import { Routine, Task } from '@/db/models';
import { AuthUser } from '@/store';
import { MMKVStorage, MMKVStorageKeys } from './mmkv-storage.service';
import { appleSignIn, googleSignIn } from './auth.service';

const db = getFirestore();

export async function getFirestoreUser(userId: string) {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as AuthUser;
    }

    __log('Document does not exist');
    return null;
  } catch (error) {
    console.error(error);
  }
}

export async function setFirestoreUser() {
  try {
    const user = getAuth().currentUser;

    if (!user) {
      return false;
    }

    const extraData: {
      name?: string;
      photoURL?: string;
    } = {};

    if (user.displayName) {
      extraData.name = user.displayName;
    }

    if (user.photoURL) {
      extraData.photoURL = user.photoURL;
    }

    await setDoc(
      doc(db, 'users', user.uid),
      {
        email: user.email,
        provider: user.providerData?.[0]?.providerId,
        updatedAt: serverTimestamp(),
        ...extraData,
      },
      { merge: true },
    );
    return true;
  } catch (err) {
    __log('Error while update user to firestore', err);
    return false;
  }
}

export async function uploadTasksToFirestore() {
  const user = getAuth().currentUser;

  if (!user) return;

  const { tasks, routines } = await getUnSyncedTasks();

  const writes = [
    ...tasks.map(task => ({
      collection: 'tasks',
      id: task.id,
      data: convertToTaskDTO(task),
    })),
    ...routines.map(routine => ({
      collection: 'routine_tasks',
      id: routine.id,
      data: convertToRoutineDTO(routine),
    })),
  ];

  const batches = [];

  for (let i = 0; i < writes.length; i += 500) {
    const batch = writeBatch(db);

    writes.slice(i, i + 500).forEach(write => {
      batch.set(
        doc(db, 'users', user.uid, write.collection, write.id),
        write.data,
        {
          merge: true,
        },
      );
    });

    batches.push(batch);
  }

  await Promise.all(batches.map(batch => batch.commit()));

  await getDatabase().write(async () => {
    for (const task of tasks) {
      await task.update(t => {
        t.synced = true;
      });
    }

    for (const routine of routines) {
      await routine.update(r => {
        r.synced = true;
      });
    }
  });
}

export const purgeDeletedData = async () => {
  const user = getAuth().currentUser;

  if (!user) return;

  const cutoff = moment().subtract(30, 'days').valueOf();
  const CHUNK_SIZE = 500;

  await getDatabase().write(async () => {
    // 1. Fetch deleted + synced tasks
    const tasks = await getDatabase()
      .get<Task>('tasks')
      .query(
        Q.where('deleted', true),
        Q.where('synced', true),
        Q.where('updated_at', Q.lte(cutoff)),
      )
      .fetch();

    // 2. Fetch deleted + synced routines
    const routines = await getDatabase()
      .get<Routine>('routine_tasks')
      .query(
        Q.where('deleted', true),
        Q.where('synced', true),
        Q.where('updated_at', Q.lte(cutoff)),
      )
      .fetch();

    const processBatch = async (items: any[], collection: string) => {
      for (let i = 0; i < items.length; i += CHUNK_SIZE) {
        const chunk = items.slice(i, i + CHUNK_SIZE);

        const batch = writeBatch(db);

        // 3. Prepare Firestore deletions
        for (const item of chunk) {
          batch.delete(doc(db, 'users', user.uid, collection, item.id));
        }

        try {
          // 4. Commit Firestore batch first
          await batch.commit();

          // 5. Only after success → delete locally
          await getDatabase().write(async () => {
            for (const item of chunk) {
              await item.destroyPermanently();
            }
          });
        } catch (err) {
          console.error(`Failed to purge ${collection} batch`, err);
          // keep tombstones so it can retry later
        }
      }
    };

    // 6. Run both in parallel
    await Promise.all([
      processBatch(tasks, 'tasks'),
      processBatch(routines, 'routine_tasks'),
    ]);
  });
};

const toDate = (value: any) => {
  if (!value) return new Date();

  // Firestore Timestamp
  if (value?.toDate) return value.toDate();

  // number (legacy)
  if (typeof value === 'number') return new Date(value);

  return new Date(value);
};

export const downloadFirestoreDataToLocalDB = async (uid: string) => {
  try {
    const [tasksSnap, routinesSnap] = await Promise.all([
      getDocs(collection(db, 'users', uid, 'tasks')),
      getDocs(collection(db, 'users', uid, 'routine_tasks')),
    ]);

    const tasks = tasksSnap.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Task),
    );

    const routines = routinesSnap.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Routine),
    );

    await getDatabase().write(async () => {
      /**
       * =========================
       * TASKS UPSERT
       * =========================
       */
      for (const t of tasks) {
        const createdAt = toDate(t.createdAt);
        const updatedAt = toDate(t.updatedAt);

        try {
          const task = await getDatabase().get<Task>('tasks').find(t.id);

          await task.update(record => {
            record.title = t.title;
            record.notes = t.notes ?? null;
            record.category = t.category;

            record.dueAt = t.dueAt ?? null;
            record.hasTime = t.hasTime ?? false;

            record.done = t.done ?? false;
            record.isRoutine = t.isRoutine ?? false;
            record.routineId = t.routineId ?? null;

            record.deleted = t.deleted ?? false;
            record.synced = true;

            // WatermelonDB dates
            record.createdAt = createdAt;
            record.updatedAt = updatedAt;
          });
        } catch {
          await getDatabase()
            .get<Task>('tasks')
            .create(record => {
              record._raw.id = t.id;

              record.title = t.title;
              record.notes = t.notes ?? null;
              record.category = t.category;

              record.dueAt = t.dueAt ?? null;
              record.hasTime = t.hasTime ?? false;

              record.done = t.done ?? false;
              record.isRoutine = t.isRoutine ?? false;
              record.routineId = t.routineId ?? null;

              record.deleted = t.deleted ?? false;
              record.synced = true;

              record.createdAt = createdAt;
              record.updatedAt = updatedAt;
            });
        }
      }

      /**
       * =========================
       * ROUTINES UPSERT
       * =========================
       */
      for (const r of routines) {
        const createdAt = toDate(r.createdAt);
        const updatedAt = toDate(r.updatedAt);

        try {
          const routine = await getDatabase()
            .get<Routine>('routine_tasks')
            .find(r.id);

          await routine.update(record => {
            record.title = r.title;
            record.notes = r.notes ?? null;
            record.category = r.category;

            record.dueAt = r.dueAt ?? null;
            record.hasTime = r.hasTime ?? false;

            record.weeks = r.weeks ?? '[]';
            record.lastGeneratedAt = r.lastGeneratedAt ?? null;

            record.deleted = r.deleted ?? false;
            record.synced = true;

            record.createdAt = createdAt;
            record.updatedAt = updatedAt;
          });
        } catch {
          await getDatabase()
            .get<Routine>('routine_tasks')
            .create(record => {
              record._raw.id = r.id;

              record.title = r.title;
              record.notes = r.notes ?? null;
              record.category = r.category;

              record.dueAt = r.dueAt ?? null;
              record.hasTime = r.hasTime ?? false;

              record.weeks = r.weeks ?? '[]';
              record.lastGeneratedAt = r.lastGeneratedAt ?? null;

              record.deleted = r.deleted ?? false;
              record.synced = true;

              record.createdAt = createdAt;
              record.updatedAt = updatedAt;
            });
        }
      }
    });
  } catch (error) {
    __log('Download sync failed:', error);
    return false;
  }

  return true;
};

export const updateLastSyncedAt = async (timestamp: number) => {
  const uid = getAuth().currentUser?.uid;

  if (!uid) {
    throw new Error('User not authenticated');
  }

  await setDoc(
    doc(db, 'users', uid),
    {
      lastSyncedAt: timestamp,
    },
    {
      merge: true,
    },
  );

  return timestamp;
};

const reauthenticateUser = async () => {
  const provider = MMKVStorage.get(MMKVStorageKeys.loginProvider);

  if (provider === 'google') {
    await googleSignIn();
    return true;
  } else if (provider === 'apple') {
    await appleSignIn();
    return true;
  }
  throw new Error("Couldn't find authentication provider");
};

export const deleteAccount = async () => {
  await reauthenticateUser();

  const user = getAuth().currentUser;

  if (!user) {
    throw new Error('User not authenticated');
  }

  const uid = user.uid;

  // -------------------------
  // Delete tasks
  // -------------------------
  const tasksSnapshot = await getDocs(collection(db, 'users', uid, 'tasks'));

  const taskBatches = [];

  for (let i = 0; i < tasksSnapshot.docs.length; i += 500) {
    const batch = writeBatch(db);

    tasksSnapshot.docs
      .slice(i, i + 500)
      .forEach(task => batch.delete(task.ref));

    taskBatches.push(batch.commit());
  }

  // -------------------------
  // Delete routines
  // -------------------------
  const routinesSnapshot = await getDocs(
    collection(db, 'users', uid, 'routine_tasks'),
  );

  for (let i = 0; i < routinesSnapshot.docs.length; i += 500) {
    const batch = writeBatch(db);

    routinesSnapshot.docs
      .slice(i, i + 500)
      .forEach(routine => batch.delete(routine.ref));

    taskBatches.push(batch.commit());
  }

  await Promise.all(taskBatches);

  // -------------------------
  // Delete user document
  // -------------------------
  await deleteDoc(doc(db, 'users', uid));

  // -------------------------
  // Delete auth account
  // -------------------------
  await deleteUser(user);

  // -------------------------
  // Reset local app
  // -------------------------
  resetApp(true);
};
