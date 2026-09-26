import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import LoaderKitView from 'react-native-loader-kit';
import { Colors } from '@/config';

interface Props {
  message: string;
  bgColor?: string;
}

export const ScreenLoader: React.FC<Props> = ({ message, bgColor }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.content, { backgroundColor: bgColor }]}>
        <LoaderKitView
          style={{ width: 40, height: 40 }}
          name={'LineScalePulseOut'}
          animationSpeedMultiplier={1.0}
          color={Colors.cyan}
        />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    gap: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
});
