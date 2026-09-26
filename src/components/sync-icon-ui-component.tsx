import { SyncIcon } from '@/assets';
import { Colors } from '@/config';
import { useSyncStore } from '@/store';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';

type SyncIconProps = {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export const SyncIconUI = ({
  size = 32,
  color = Colors.cyan,
  style,
}: SyncIconProps) => {
  const { syncing } = useSyncStore();

  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation;

    if (syncing) {
      rotateAnim.setValue(0);

      animation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );

      animation.start();
    } else {
      rotateAnim.stopAnimation();
    }

    return () => animation?.stop();
  }, [syncing, rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!syncing) {
    return null;
  }

  return (
    <Animated.View
      style={[
        {
          transform: [{ rotate }],
        },
        style,
      ]}
    >
      <SyncIcon height={size} width={size} color={color} />
    </Animated.View>
  );
};
