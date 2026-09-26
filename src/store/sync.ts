import { create } from 'zustand';

type SyncState = {
  triggerSyncFlag: number;
  syncing: boolean;
  downloading: boolean;

  setTriggerSync: () => void;
  setSyncing: (value: boolean) => void;
  setDownloding: (value: boolean) => void;
  reset: () => void;
};

const initialState = {
  triggerSyncFlag: 0,
  syncing: false,
  downloading: false,
};

export const useSyncStore = create<SyncState>(set => ({
  ...initialState,

  setSyncing: (value: boolean) => set({ syncing: value }),
  setTriggerSync: () => {
    set({ triggerSyncFlag: new Date().getTime() });
  },
  setDownloding: (value: boolean) => {
    set({ downloading: value });
  },

  reset: () => set(initialState),
}));
