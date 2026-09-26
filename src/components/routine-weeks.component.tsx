import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import React from 'react';

import { weeksList } from '@/hooks';
import { Colors } from '@/config';
import { applyOpacity } from '@/utils';

interface Props {
  selectedWeeks: number[];
  style?: StyleProp<ViewStyle>;
  weekViewStyle?: StyleProp<ViewStyle>;
  color?: string;
  size?: number;
  textSize?: number;
}

export const RoutineWeeks: React.FC<Props> = ({
  selectedWeeks,
  style,
  weekViewStyle,
  color = Colors.cyan,
  size = 20,
  textSize = 10,
}) => {
  return (
    <View style={[styles.container, style]}>
      {weeksList.map((w, i) => {
        const selected = selectedWeeks.includes(i);

        return (
          <View
            key={w.title}
            style={[
              styles.weekContainer,
              { width: size, height: size },
              selected && {
                backgroundColor: applyOpacity(color, 0.3),
              },
              weekViewStyle,
            ]}
          >
            <Text
              style={[
                styles.btnText,
                {
                  fontSize: textSize,
                },
                selected && {
                  color,
                },
              ]}
            >
              {w.code}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  weekContainer: {
    width: 22,
    height: 22,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.textFaint,
  },
  btnText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
});
