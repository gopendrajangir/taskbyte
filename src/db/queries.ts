import { Q } from '@nozbe/watermelondb';

import { CategoryType } from '@/components';
import { getDatabase } from './db';
import { Routine, Task } from './models';
import moment from 'moment';

export interface CreateTaskPayload {
  title: string;
  notes?: string;
  category: CategoryType;
  dueAt?: number;
  hasTime?: boolean;
}

export interface UpdateTaskPayload extends CreateTaskPayload {
  id: string;
}

export interface CreateRoutinePayload {
  title: string;
  notes?: string;
  category: CategoryType;
  dueAt?: number;
  hasTime?: boolean;
  weeks?: number[];
  createInstance?: boolean;
}

export interface UpdateRoutinePayload extends CreateRoutinePayload {
  id: string;
  createInstance?: boolean;
}

export interface CreateTaskWithRoutinePayload {
  title: string;
  notes?: string;
  category: CategoryType;
  dueAt?: number;
  hasTime?: boolean;
  weeks: number[];
}

export const createRoutine = async (payload: CreateRoutinePayload) => {
  const {
    title,
    notes = null,
    category,
    dueAt = null,
    hasTime = false,
    weeks,
    createInstance,
  } = payload;

  return await getDatabase().write(async () => {
    const routine = await getDatabase()
      .get<Routine>('routine_tasks')
      .create(r => {
        r.title = title;
        r.notes = notes;
        r.category = category;
        r.dueAt = dueAt;
        r.hasTime = hasTime;
        r.weeks = JSON.stringify(weeks);
        if (createInstance) {
          r.lastGeneratedAt = new Date();
        }
        r.updatedAt = new Date();
      });

    let task;
    if (createInstance) {
      task = await getDatabase()
        .get<Task>('tasks')
        .create(t => {
          t.title = title;
          t.notes = notes;
          t.category = category;

          t.dueAt = hasTime ? dueAt : moment().valueOf();
          t.hasTime = hasTime;

          t.done = false;
          t.isRoutine = true;

          t.routineId = routine.id;
          t.updatedAt = new Date();
        });
    }

    return {
      taskId: task?.id,
      routineId: routine.id,
    };
  });
};

export const createTask = async (payload: CreateTaskPayload) => {
  const {
    title,
    notes = null,
    category,
    dueAt = null,
    hasTime = false,
  } = payload;

  return await getDatabase().write(async () => {
    const task = await getDatabase()
      .get<Task>('tasks')
      .create(t => {
        t.title = title;
        t.notes = notes;
        t.category = category;

        t.dueAt = dueAt;
        t.hasTime = hasTime;

        t.done = false;
        t.updatedAt = new Date();
      });

    return task.id;
  });
};

export const editTask = async (payload: UpdateTaskPayload) => {
  const {
    title,
    notes = null,
    category,
    dueAt = null,
    hasTime = false,
  } = payload;

  return await getDatabase().write(async () => {
    const task = await getDatabase().get<Task>('tasks').find(payload.id);

    await task.update(t => {
      t.title = title;
      t.notes = notes;
      t.category = category;

      t.dueAt = dueAt;
      t.hasTime = hasTime;

      t.synced = false;
      t.updatedAt = new Date();
    });
  });
};

export const editRoutine = async (payload: UpdateRoutinePayload) => {
  const {
    id,
    title,
    notes = null,
    category,
    dueAt = null,
    hasTime = false,
    weeks,
    createInstance = false,
  } = payload;

  return await getDatabase().write(async () => {
    const routine = await getDatabase().get<Routine>('routine_tasks').find(id);

    await routine.update(r => {
      r.title = title;
      r.notes = notes;
      r.category = category;
      r.dueAt = dueAt;
      r.hasTime = hasTime;
      r.weeks = JSON.stringify(weeks);

      if (createInstance) {
        r.lastGeneratedAt = new Date();
      }

      r.synced = false;
      r.updatedAt = new Date();
    });

    let taskId: string | null = null;

    if (createInstance) {
      const startOfDay = moment().startOf('day').valueOf();
      const endOfDay = moment().endOf('day').valueOf();

      const existingTask = await getDatabase()
        .get<Task>('tasks')
        .query(
          Q.where('routine_id', routine.id),
          Q.where('due_at', Q.gte(startOfDay)),
          Q.where('due_at', Q.lte(endOfDay)),
        )
        .fetch();

      if (existingTask.length === 0) {
        const task = await getDatabase()
          .get<Task>('tasks')
          .create(t => {
            t.title = title;
            t.notes = notes;
            t.category = category;

            t.dueAt = hasTime ? dueAt : moment().valueOf();
            t.hasTime = hasTime;

            t.done = false;
            t.isRoutine = true;
            t.routineId = routine.id;

            t.updatedAt = new Date();
          });

        taskId = task.id;
      }
    }

    return {
      routineId: routine.id,
      taskId,
    };
  });
};

export const getAllRoutines = async () => {
  const routineTasks = await getDatabase()
    .get<Routine>('routine_tasks')
    .query(Q.where('deleted', Q.notEq(true)))
    .fetch();

  return routineTasks;
};

export const deleteTask = async (taskId: string) => {
  await getDatabase().write(async () => {
    const task = await getDatabase().get<Task>('tasks').find(taskId);

    await task.update(t => {
      t.deleted = true;
      t.synced = false;
      t.updatedAt = new Date();
    });
  });
};

export const deleteRoutine = async (routineId: string) => {
  await getDatabase().write(async () => {
    const routine = await getDatabase()
      .get<Routine>('routine_tasks')
      .find(routineId);

    await routine.update(t => {
      t.deleted = true;
      t.synced = false;
      t.updatedAt = new Date();
    });
  });
};

export const markTaskAsDone = async (taskId: string) => {
  await getDatabase().write(async () => {
    const task = await getDatabase().get<Task>('tasks').find(taskId);

    await task.update(t => {
      t.done = true;
      t.synced = false;
      t.updatedAt = new Date();
    });
  });
};

export const getTasksForDate = async (date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return getDatabase()
    .get<Task>('tasks')
    .query(
      Q.where('due_at', Q.gte(startOfDay.getTime())),
      Q.where('due_at', Q.lte(endOfDay.getTime())),
      Q.where('deleted', Q.notEq(true)),
      Q.sortBy('due_at', Q.desc),
    )
    .fetch();
};

export const getTaskById = async (taskId: string) => {
  return getDatabase().get<Task>('tasks').find(taskId);
};

export const getRoutineById = async (routineId: string) => {
  return getDatabase().get<Routine>('routine_tasks').find(routineId);
};

export const getUnscheduledTasks = async () => {
  return getDatabase()
    .get<Task>('tasks')
    .query(
      Q.where('due_at', null),
      Q.sortBy('created_at', 'desc'),
      Q.where('deleted', Q.notEq(true)),
    )
    .fetch();
};

export const getAllTasks = async () => {
  const tasks = await getDatabase()
    .get<Task>('tasks')
    .query(Q.sortBy('created_at', 'desc'), Q.where('deleted', Q.notEq(true)))
    .fetch();

  return tasks;
};

export const generateTasksFromRoutine = async () => {
  const routines = await getDatabase()
    .get<Routine>('routine_tasks')
    .query(Q.where('deleted', Q.notEq(true)))
    .fetch();

  await getDatabase().write(async () => {
    for (const routine of routines) {
      const today = moment().startOf('day');
      const prev30thDate = today.clone().subtract(30, 'day').startOf('day');

      let lastGeneratedAt = routine.lastGeneratedAt
        ? moment(routine.lastGeneratedAt).startOf('day')
        : moment(routine.createdAt).subtract(1, 'day').startOf('day');

      const endDate = prev30thDate.isAfter(lastGeneratedAt)
        ? prev30thDate
        : lastGeneratedAt.clone().add(1, 'day').startOf('day');

      let currentDate = today.clone();

      const routineWeeks = JSON.parse(routine.weeks);

      while (currentDate.isSameOrAfter(endDate)) {
        const day = (currentDate.day() + 6) % 7;

        if (routineWeeks.includes(day)) {
          const startOfDay = currentDate.clone().startOf('day').valueOf();
          const endOfDay = currentDate.clone().endOf('day').valueOf();

          const existingTask = await getDatabase()
            .get<Task>('tasks')
            .query(
              Q.where('routine_id', routine.id),
              Q.where('due_at', Q.gte(startOfDay)),
              Q.where('due_at', Q.lte(endOfDay)),
            )
            .fetch();

          if (existingTask.length === 0) {
            await getDatabase()
              .get<Task>('tasks')
              .create(t => {
                const routineDueAt = routine.dueAt
                  ? moment(routine.dueAt)
                  : null;

                const dueAt = routineDueAt
                  ? currentDate
                      .clone()
                      .set({
                        hour: routineDueAt.hour(),
                        minute: routineDueAt.minute(),
                        second: routineDueAt.second(),
                        millisecond: 0,
                      })
                      .valueOf()
                  : currentDate.clone().valueOf();

                t.title = routine.title;
                t.notes = routine.notes;
                t.category = routine.category;

                t.dueAt = dueAt;
                t.hasTime = routine.hasTime;

                t.done = false;
                t.isRoutine = true;

                t.routineId = routine.id;
              });
          }
        }

        currentDate.subtract(1, 'day');
      }

      await routine.update(r => {
        r.lastGeneratedAt = new Date(today.valueOf());
      });
    }
  });
};

export const getUnSyncedTasks = async () => {
  const tasks = await getDatabase()
    .get<Task>('tasks')
    .query(Q.where('synced', Q.notEq(true)))
    .fetch();

  const routines = await getDatabase()
    .get<Routine>('routine_tasks')
    .query(Q.where('synced', Q.notEq(true)))
    .fetch();

  return {
    tasks,
    routines,
  };
};

export const getDeletedTasks = async () => {
  const tasks = await getDatabase()
    .get<Task>('tasks')
    .query(Q.where('deleted', true), Q.where('synced', true))
    .fetch();

  const routines = await getDatabase()
    .get<Routine>('routine_tasks')
    .query(Q.where('deleted', true), Q.where('synced', true))
    .fetch();

  return {
    tasks,
    routines,
  };
};

export const clearDatabase = async () => {
  const database = getDatabase();

  await database.write(async () => {
    await database.unsafeResetDatabase();
  });
};
