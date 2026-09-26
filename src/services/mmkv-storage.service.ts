import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

export const MMKVStorageKeys = {
  isGuest: 'isGuest',
  loginProvider: 'loginProvider',
};

export class MMKVStorage {
  // SET
  static set<T>(key: string, value: T) {
    try {
      storage.set(key, JSON.stringify(value));
    } catch (error) {
      console.error(`MMKV set error for key: ${key}`, error);
    }
  }

  // GET
  static get<T = unknown>(key: string): T | null {
    const value = storage.getString(key);

    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.warn(`MMKV parse error for key: ${key}`, error);
      return null;
    }
  }

  // REMOVE SINGLE KEY
  static remove(key: string) {
    storage.delete(key);
  }

  // CLEAR ALL STORAGE
  static clear() {
    storage.clearAll();
  }

  // OPTIONAL: check existence
  static exists(key: string) {
    return storage.contains(key);
  }
}
