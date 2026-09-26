import {
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import React from 'react';
import { Colors } from '@/config';

interface Props {
  onPress: () => void;
  title: string;
  type?: 'outline' | 'default';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  loading?: boolean;
  icon?: React.ReactElement;
  outlineColor?: string;
  disabled?: boolean;
}

export const AppButton: React.FC<Props> = ({
  onPress,
  title,
  type = 'default',
  style,
  textStyle,
  loading,
  icon,
  outlineColor,
  disabled,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        type === 'outline' && styles.containerOutline,
        type === 'outline' &&
          outlineColor && {
            borderColor: outlineColor,
            backgroundColor: 'transparent',
          },
        style,
        (loading || disabled) && styles.containerDisabled,
      ]}
      disabled={loading || disabled}
    >
      {loading && <ActivityIndicator color={Colors.background} />}
      {icon}
      <Text
        style={[
          styles.text,
          type === 'outline' && styles.textOutline,
          type === 'outline' &&
            outlineColor && {
              color: outlineColor,
            },
          textStyle,
          (loading || disabled) && styles.textDisabled,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: Colors.cyan,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  containerDisabled: {
    backgroundColor: Colors.card,
  },
  containerOutline: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cyan,
  },
  text: {
    color: Colors.background,
    fontWeight: '500',
    fontSize: 12,
  },
  textOutline: {
    color: Colors.cyan,
  },
  textDisabled: {
    color: Colors.textFaint,
  },
});
