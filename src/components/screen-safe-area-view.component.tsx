import { StyleSheet, StyleProp, ViewStyle, View } from 'react-native';
import React, { PropsWithChildren } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/config';

type SafeEdges = ('top' | 'bottom' | 'left' | 'right')[];

interface Props extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  edges?: SafeEdges;
}

export const ScreenSafeAreaView: React.FC<Props> = ({
  children,
  edges,
  style,
}) => {
  const defaultEdges: SafeEdges = ['top', 'bottom'];

  const { top, bottom, left, right } = useSafeAreaInsets();

  const paddingStyle: {
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
  } = {};

  if (defaultEdges.includes('top')) {
    paddingStyle.paddingTop = top;
  }
  if (defaultEdges.includes('bottom')) {
    paddingStyle.paddingBottom = bottom;
  }
  if (defaultEdges.includes('left')) {
    paddingStyle.paddingLeft = left;
  }
  if (defaultEdges.includes('right')) {
    paddingStyle.paddingRight = right;
  }

  return (
    <View style={[styles.container, paddingStyle, style]}>{children}</View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
