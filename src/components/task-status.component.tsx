import React from 'react';
import { View, StyleSheet, Text, StyleProp, ViewStyle } from 'react-native';
import { Colors } from '@/config';
import { applyOpacity, getTaskStatus } from '@/utils';

interface Props {
  dueAt?: number | null;
  hasTime?: boolean;
  done?: boolean;
  style?: StyleProp<ViewStyle>;
  textSize?: number;
}

type TaskStatus = 'pending' | 'finished' | 'overdue';

export const TaskStatus: React.FC<Props> = ({
  dueAt,
  hasTime = false,
  done = false,
  style,
  textSize = 10,
}) => {
  const status = getTaskStatus(dueAt, hasTime, done);

  return (
    <View
      style={[
        styles.container,
        status === 'finished' && styles.containerFinished,
        status === 'overdue' && styles.containerOverdue,
        style,
      ]}
    >
      <Text
        style={[
          styles.statusText,
          status === 'finished' && styles.finishedStatusText,
          status === 'overdue' && styles.overdueStatusText,
          { fontSize: textSize },
        ]}
      >
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 0.6,
    borderStyle: 'dashed',
    borderColor: Colors.yellow,
    backgroundColor: applyOpacity(Colors.yellow, 0.2),
  },
  containerFinished: {
    borderColor: Colors.green,
    backgroundColor: applyOpacity(Colors.green, 0.2),
  },
  containerOverdue: {
    borderColor: Colors.red,
    backgroundColor: applyOpacity(Colors.red, 0.2),
  },
  statusText: {
    fontSize: 12,
    textTransform: 'capitalize',
    color: Colors.yellow,
  },
  finishedStatusText: {
    color: Colors.green,
  },
  overdueStatusText: {
    color: Colors.red,
  },
});
