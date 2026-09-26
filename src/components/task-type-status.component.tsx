import { View, StyleSheet, Text } from 'react-native';
import React from 'react';
import { applyOpacity, TaskType } from '@/utils';
import { Colors } from '@/config';

interface Props {
  type: TaskType;
}

export const TaskTypeStatus: React.FC<Props> = ({ type }) => {
  const getColor = () => {
    switch (type) {
      case 'scheduled':
        return Colors.cyan;
      case 'flexible':
        return Colors.yellow;
      default:
        return Colors.textSecondary;
    }
  };

  const color = getColor();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: applyOpacity(color, 0.2),
        },
      ]}
    >
      <Text style={[styles.type, { color: color }]}>{type}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 24,
    flexDirection: 'row',
  },
  type: {
    fontSize: 10,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
