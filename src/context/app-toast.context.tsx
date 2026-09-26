import React, { createContext, useContext, useRef, useState } from 'react';
import { Animated } from 'react-native';

import { AppToast } from '@/components/app-toast.component';

export type ToastType = 'success' | 'danger';

export type ToastData = {
  type: ToastType;
  message: string;
  duration?: number; // optional per-toast override
};

export type ToastContextType = {
  showToast: (toast: ToastData) => void;
};

export const ToastContext = createContext<ToastContextType | null>(null);

export const useAppToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useAppToast must be used inside AppToastProvider');
  return ctx;
};

const DEFAULT_DURATION = 3000;

export const AppToastProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [toast, setToast] = useState<ToastData | null>(null);

  const timerRef = useRef<number | null>(null);

  const anim = useRef(new Animated.Value(0)).current;

  const hide = () => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setToast(null));
  };

  const showToast = (data: ToastData) => {
    // clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setToast(data);

    // reset animation every time
    anim.setValue(0);

    Animated.timing(anim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();

    const duration = data.duration ?? DEFAULT_DURATION;

    timerRef.current = setTimeout(() => {
      hide();
    }, duration);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <AppToast toast={toast} anim={anim} />
    </ToastContext.Provider>
  );
};
