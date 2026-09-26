import { appSchema, tableSchema } from '@nozbe/watermelondb';
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { Task, Routine } from './models';
import { getAuth } from '@react-native-firebase/auth';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'tasks',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'category', type: 'string', isOptional: true },

        { name: 'due_at', type: 'number', isOptional: true },
        { name: 'has_time', type: 'boolean' },

        { name: 'done', type: 'boolean' },
        { name: 'is_routine', type: 'boolean', isOptional: true },

        { name: 'routine_id', type: 'string', isOptional: true },
        { name: 'synced', type: 'boolean', isOptional: true },
        { name: 'deleted', type: 'boolean', isOptional: true },

        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    tableSchema({
      name: 'routine_tasks',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'category', type: 'string', isOptional: true },

        { name: 'due_at', type: 'number', isOptional: true },
        { name: 'has_time', type: 'boolean' },

        { name: 'weeks', type: 'string' },

        { name: 'last_generated_at', type: 'number', isOptional: true },
        { name: 'synced', type: 'boolean', isOptional: true },
        { name: 'deleted', type: 'boolean', isOptional: true },

        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});

let dbInstance: Database | null = null;

const createDatabase = (userId: string = 'taskbyte_guest') => {
  const adapter = new SQLiteAdapter({
    schema,
    dbName: `app_${userId}`,
  });

  const database = new Database({
    adapter,
    modelClasses: [Task, Routine],
  });

  return database;
};

export const getDatabase = () => {
  const { currentUser } = getAuth();
  const uid = currentUser?.uid;

  if (!dbInstance) {
    dbInstance = createDatabase(uid);
  }

  return dbInstance;
};

export const resetDatabaseInstance = () => {
  dbInstance = null;
};
