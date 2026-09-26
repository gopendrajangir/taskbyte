import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import React from 'react';
import { weeksList } from '@/hooks';
import { Colors } from '@/config';
import { applyOpacity } from '@/utils';

interface Props {
  selectedWeeks: number[];
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  canBeEmpty?: boolean;
  size?: number;
  textSize?: number;
  selectWeek: (w: number) => void;
}

export const WeeksSelector: React.FC<Props> = ({
  selectedWeeks,
  style,
  disabled,
  canBeEmpty = true,
  size = 32,
  textSize = 12,
  selectWeek,
}) => {
  return (
    <View style={[styles.container, style]}>
      {weeksList.map((w, i) => {
        const selected = selectedWeeks.includes(i);

        return (
          <TouchableOpacity
            key={w.title}
            style={[
              styles.btn,
              { height: size, width: size },
              selected && styles.btnSelected,
              disabled && styles.btnDisabled,
            ]}
            disabled={disabled}
            onPress={() => {
              if (
                !(
                  !canBeEmpty &&
                  selectedWeeks.length === 1 &&
                  selectedWeeks[0] === i
                )
              ) {
                selectWeek(i);
              }
            }}
          >
            <Text
              style={[
                styles.btnText,
                { fontSize: textSize },
                selected && styles.btnTextSelected,
                disabled && styles.btnTextDisabled,
              ]}
            >
              {w.code}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.card,
  },
  btnSelected: {
    backgroundColor: Colors.cyan,
  },
  btnDisabled: {
    backgroundColor: applyOpacity(Colors.textFaint, 0.3),
  },
  btnText: {
    color: Colors.textPrimary,
    fontSize: 16,
  },
  btnTextSelected: {
    color: Colors.background,
  },
  btnTextDisabled: {
    color: Colors.textPrimary,
  },
});
