import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import React from 'react';
import { Colors } from '@/config';

interface Props {
  message: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export const NoData: React.FC<Props> = ({ message, height, style }) => {
  return (
    <View style={[styles.container, { height }, style]}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
