// AppToast.tsx

import { ToastData } from '@/context';
import React from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

export const AppToast = ({
  toast,
  anim,
}: {
  toast: ToastData | null;
  anim: Animated.Value;
}) => {
  if (!toast) return null;

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 0],
  });

  const opacity = anim;

  const backgroundColor = toast.type === 'success' ? '#16A34A' : '#8e2b15';

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          backgroundColor,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={styles.text}>{toast.message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,

    paddingVertical: 12,
    paddingHorizontal: 12,

    borderRadius: 8,

    zIndex: 9999,
    elevation: 10,

    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },

  text: {
    color: 'white',
    fontSize: 12,
    // fontWeight: '600',
  },
});
