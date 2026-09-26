import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import React from 'react';
import { LinearGradient } from 'react-native-linear-gradient';

import { Colors } from '@/config';
import { CalendarOutlineIcon } from '@/assets';
import { applyOpacity } from '@/utils';

interface Props {
  count?: number;
  style?: StyleProp<ViewStyle>;
}

export const RoutineCard: React.FC<Props> = ({ count, style }) => {
  return (
    <LinearGradient
      colors={[Colors.cyanSoft, Colors.glass, Colors.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.container, style]}
    >
      <View style={styles.main}>
        <View style={styles.iconWrapper}>
          <CalendarOutlineIcon width={22} height={22} color={Colors.cyan} />
        </View>
        <View style={styles.headingContainer}>
          <Text style={styles.heading}>Your Routines</Text>
          <Text style={styles.subHeading}>Stay consistent, every day.</Text>
        </View>
        <View style={styles.totalContainer}>
          <Text style={styles.totalRoutines}>{count}</Text>
          <Text style={styles.activeText}>Active</Text>
        </View>
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
    padding: 14,
  },
  iconWrapper: {
    backgroundColor: applyOpacity(Colors.cyan, 0.1),
    width: 54,
    height: 54,
    borderRadius: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headingContainer: {
    marginLeft: 12,
  },
  heading: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  subHeading: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  totalContainer: {
    marginLeft: 'auto',
    alignItems: 'center',
  },
  totalRoutines: {
    color: Colors.cyan,
    fontSize: 26,
    fontWeight: '600',
  },
  activeText: {
    color: Colors.cyan,
    fontSize: 12,
  },
});
