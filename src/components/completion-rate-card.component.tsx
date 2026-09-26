import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { LinearGradient } from 'react-native-linear-gradient';
import { Colors } from '@/config';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

interface Props {
  total: number;
  completed: number;
}

export const CompletionRateCard: React.FC<Props> = ({ total, completed }) => {
  const cent = total === 0 ? 0 : Math.floor((completed * 100) / total);

  return (
    <LinearGradient
      colors={[Colors.cyanSoft, Colors.glass, Colors.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <View style={styles.main}>
        <AnimatedCircularProgress
          size={54}
          width={3}
          fill={cent}
          tintColor="#00e0ff"
          backgroundColor="#3d5875"
        >
          {() => <Text style={styles.centText}>{cent}%</Text>}
        </AnimatedCircularProgress>
        <View style={styles.headingContainer}>
          <Text style={styles.heading}>Overall Completion Rate</Text>
          <Text style={styles.subHeading}>Great job! Keep it up.</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressBarInner, { width: `${cent}%` }]} />
          </View>
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
    padding: 12,
  },
  centText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  headingContainer: {
    marginLeft: 12,
    flex: 1,
  },
  heading: {
    color: Colors.textPrimary,
    fontWeight: '500',
    fontSize: 12,
  },
  subHeading: {
    color: Colors.textSecondary,
    marginTop: 2,
    fontSize: 12,
  },
  progressBar: {
    width: '100%',
    height: 2,
    backgroundColor: Colors.cyanSoft,
    marginTop: 12,
    borderRadius: 10,
  },
  progressBarInner: {
    backgroundColor: Colors.cyan,
    height: '100%',
    borderRadius: 10,
  },
});
