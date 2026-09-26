import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { serverTimestamp } from '@react-native-firebase/firestore';

import { clearDatabase, resetDatabaseInstance } from '@/db';
import {
  MMKVStorage,
  MMKVStorageKeys,
  queryClient,
  syncEngine,
} from '@/services';
import { useAuthStore, useSyncStore } from '@/store';
import { __log } from './log.util';

export const resetApp = async (clearDb?: boolean) => {
  if (clearDb) {
    try {
      await clearDatabase();
    } catch (err) {
      __log('Error while clearing the database', err);
    }
  }
  queryClient.clear();
  resetDatabaseInstance();
  syncEngine.stop();

  useAuthStore.getState().reset();
  useSyncStore.getState().reset();
  MMKVStorage.set(MMKVStorageKeys.isGuest, false);
  MMKVStorage.set(MMKVStorageKeys.loginProvider, null);
};

export const firebaseUserToAuthUser = (data: FirebaseAuthTypes.User) => {
  return {
    uid: data.uid,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    provider: data.providerData?.[0]?.providerId,
    updatedAt: serverTimestamp(),
  };
};
