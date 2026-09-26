import { create } from 'zustand';
import { getAuth, signOut } from '@react-native-firebase/auth';
import { __log, resetApp } from '@/utils';
import { FieldValue } from '@react-native-firebase/firestore';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: string;
  updatedAt: FieldValue;
  lastSyncedAt?: number | null;
}

type AuthState = {
  user: AuthUser | null;
  splashLoading: boolean;
  isGuest?: boolean;

  setUser: (user: AuthUser | null) => void;
  setSplashLoading: (loading: boolean) => void;
  setIsGuest: () => void;
  setUserData: (data: Omit<AuthUser, 'uid'>) => void;
  setLastSyncedAt: (timestamp: number) => void;

  logout: () => Promise<void>;
  reset: () => void;
};

const initialState = {
  user: null,
  splashLoading: true,
  isGuest: false,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...initialState,

  setUser: user => set({ user }),
  setUserData: data => {
    const state = get();
    const { user } = state;

    if (user) {
      set({
        ...state,
        user: {
          ...user,
          lastSyncedAt: data.lastSyncedAt ?? null,
          email: user.email ?? data.email ?? null,
          displayName: user.displayName ?? data.displayName ?? null,
          photoURL: user.photoURL ?? data.photoURL ?? null,
        },
      });
    }
  },

  setSplashLoading: splashLoading => set({ splashLoading }),

  setIsGuest: () => set({ isGuest: true }),

  logout: async () => {
    const currentState = get();

    const { isGuest } = currentState;

    if (isGuest) {
      set({
        isGuest: false,
      });
      resetApp();
    } else {
      try {
        await signOut(getAuth());
        resetApp();
        set({
          user: null,
        });
      } catch (error) {
        __log('Logout Error:', error);
      }
    }
  },
  setLastSyncedAt: (timestamp: number) => {
    const currentState = get();

    if (currentState.user) {
      set({
        ...currentState,
        user: { ...currentState.user, lastSyncedAt: timestamp },
      });
    }
  },

  reset: () => {
    const currentState = get();

    set({ ...initialState, splashLoading: currentState.splashLoading });
  },
}));
