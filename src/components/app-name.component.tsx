import { Text, StyleSheet, StyleProp, TextStyle } from 'react-native';
import React from 'react';
import { Colors } from '@/config';

interface Props {
  style?: StyleProp<TextStyle>;
}

export const AppName: React.FC<Props> = ({ style }) => {
  return (
    <Text style={[styles.logoText, style]}>
      <Text style={[styles.taskText]}>Task</Text>
      <Text style={[styles.flowText]}>Byte</Text>
    </Text>
  );
};

const styles = StyleSheet.create({
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
  },
  taskText: {
    color: Colors.white,
  },
  flowText: {
    color: Colors.logoYellow,
    marginLeft: 1,
  },
});
