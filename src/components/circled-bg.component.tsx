import { View, StyleSheet } from 'react-native';
import React from 'react';

interface Props {
  size?: number;
  children?: React.ReactElement;
  selected?: boolean;
  color?: string;
}

export const CircledBg: React.FC<Props> = ({
  size = 32,
  selected,
  color,
  children,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderColor: color,
        },
        selected && styles.bordered,
        selected && {
          borderColor: color,
          borderRadius: size,
        },
      ]}
    >
      <View
        style={[
          { width: size, height: size, backgroundColor: color },
          styles.bg,
        ]}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bordered: {
    borderWidth: 1,
  },
  bg: {
    opacity: 0.15,
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '100%',
    height: '100%',
    width: '100%',
  },
});
