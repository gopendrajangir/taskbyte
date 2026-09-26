import { useAuthStore, useSyncStore } from '@/store';
import {
  setFirestoreUser,
  uploadTasksToFirestore,
  purgeDeletedData,
  updateLastSyncedAt,
} from './firestore-client.service';
import { __log } from '@/utils';

class SyncEngine {
  private static instance: SyncEngine;

  private userPending = true;

  private syncing = false;
  private syncRequested = false;

  private isStopped = false;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly DEBOUNCE_MS = 2000;

  private constructor() {}

  static getInstance() {
    if (!SyncEngine.instance) {
      SyncEngine.instance = new SyncEngine();
    }
    return SyncEngine.instance;
  }

  // ---------------------------
  // STOP (NOW ACTUALLY SAFE)
  // ---------------------------
  stop() {
    this.isStopped = true; // 👈 blocks all future work

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  // optional: allow restart after login
  restart() {
    this.isStopped = false;
    this.userPending = true;
  }

  // ---------------------------
  // TRIGGER
  // ---------------------------
  triggerSync({ immediate = false } = {}) {
    if (this.isStopped) return; // 👈 important guard

    this.syncRequested = true;

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    if (immediate) {
      this.startSyncLoop();
      return;
    }

    this.debounceTimer = setTimeout(() => {
      this.startSyncLoop();
    }, this.DEBOUNCE_MS);
  }

  // ---------------------------
  // MAIN LOOP
  // ---------------------------
  private async startSyncLoop() {
    if (this.syncing || this.isStopped) return;

    const state = useSyncStore.getState();

    this.syncing = true;
    state.setSyncing(true);

    try {
      do {
        if (this.isStopped) break; // 👈 HARD STOP CHECK

        this.syncRequested = false;

        await this.processSyncCycle();
      } while (this.syncRequested && !this.isStopped);
    } finally {
      state.setSyncing(false);
      this.syncing = false;

      try {
        const timestamp = Date.now();
        useAuthStore.getState().setLastSyncedAt(timestamp);
        await updateLastSyncedAt(timestamp);
      } catch (err) {
        __log('Error updating last sync to firestore');
      }
    }
  }

  // ---------------------------
  // CYCLE
  // ---------------------------
  private async processSyncCycle() {
    if (this.isStopped) return;

    await this.syncUserIfNeeded();
    if (this.isStopped) return;

    await this.syncTasksIfNeeded();
  }

  // ---------------------------
  // USER SYNC
  // ---------------------------
  private async syncUserIfNeeded() {
    if (this.isStopped) return;
    if (!this.userPending) return;

    const result = await setFirestoreUser();

    if (this.isStopped) return;

    if (result) {
      this.userPending = false;
    }
  }

  // ---------------------------
  // TASK SYNC
  // ---------------------------
  private async syncTasksIfNeeded() {
    if (this.isStopped) return;

    await uploadTasksToFirestore();
    if (this.isStopped) return;

    await purgeDeletedData();
  }
}

export const syncEngine = SyncEngine.getInstance();
