import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import React from 'react';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { LinearGradient } from 'react-native-linear-gradient';
import { Colors } from '@/config';

interface Props {
  total: number;
  completed: number;
  style?: StyleProp<ViewStyle>;
}

export const ProgressCard: React.FC<Props> = ({ total, completed, style }) => {
  const isZero = total === 0 && completed === 0;

  const progressText = isZero ? '0%' : `${completed}/${total}`;

  const cent = isZero ? 0 : Math.floor((completed * 100) / total);

  return (
    <LinearGradient
      colors={[Colors.background, Colors.glass, Colors.cyanSoft]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.container, style]}
    >
      <View style={styles.main}>
        <View style={styles.progressLeft}>
          <Text style={styles.todaysFocusText}>Today's Focus</Text>
          {isZero ? (
            <Text style={styles.noTasksText}>No Tasks for Today</Text>
          ) : (
            <Text style={styles.progressCentText}>{cent}%</Text>
          )}
          <Text
            style={styles.completedText}
          >{`${completed} of ${total} tasks completed`}</Text>
        </View>
        <AnimatedCircularProgress
          size={60}
          width={3}
          fill={cent}
          tintColor="#00e0ff"
          backgroundColor="#3d5875"
        >
          {() => <Text style={styles.progressText}>{progressText}</Text>}
        </AnimatedCircularProgress>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  main: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingVertical: 14
  },
  progressLeft: {
    flex: 1,
    gap: 2,
  },
  progressCentText: {
    fontSize: 32,
    color: '#fff',
  },
  todaysFocusText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  completedText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  progressText: {
    fontSize: 20,
    color: '#fff',
  },
  noTasksText: {
    fontSize: 18,
    marginVertical: 8,
    color: Colors.textPrimary,
  },
});
