import { StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import React from 'react';
import { AppButton } from './app-button.component';
import { BinIcon, PencilIcon, TickCircleIcon } from '@/assets';
import { Colors } from '@/config';

interface Props {
  type: 'edit' | 'mark-as-done' | 'delete' | 'cancel' | 'confirm';
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
  disabled?: boolean;
  textStyle?: StyleProp<TextStyle>;
  title?: string;
  onPress: () => void;
}

export const AppButtonByType: React.FC<Props> = ({
  type,
  style,
  loading,
  disabled,
  textStyle,
  title,
  onPress,
}) => {
  switch (type) {
    case 'edit':
      return (
        <AppButton
          type="outline"
          title={title ?? 'Edit'}
          outlineColor={Colors.indigo}
          icon={<PencilIcon color={Colors.indigo} height={16} width={16} />}
          onPress={onPress}
          style={style}
          textStyle={textStyle}
          loading={loading}
          disabled={disabled}
        />
      );
    case 'mark-as-done':
      return (
        <AppButton
          type="outline"
          title={title ?? 'Mark as Done'}
          outlineColor={Colors.green}
          icon={<TickCircleIcon color={Colors.green} height={16} width={16} />}
          onPress={onPress}
          textStyle={textStyle}
          style={style}
          loading={loading}
          disabled={disabled}
        />
      );
    case 'delete':
      return (
        <AppButton
          type="outline"
          title={title ?? 'Delete'}
          outlineColor={Colors.red}
          icon={<BinIcon color={Colors.red} height={16} width={16} />}
          onPress={onPress}
          style={style}
          textStyle={textStyle}
          loading={loading}
          disabled={disabled}
        />
      );
    case 'cancel':
      return (
        <AppButton
          type="outline"
          title={title ?? 'Cancel'}
          outlineColor={Colors.red}
          onPress={onPress}
          style={style}
          textStyle={textStyle}
          loading={loading}
          disabled={disabled}
        />
      );
    case 'confirm':
      return (
        <AppButton
          type="outline"
          title={title ?? 'Confirm'}
          outlineColor={Colors.green}
          onPress={onPress}
          style={style}
          textStyle={textStyle}
          loading={loading}
          disabled={disabled}
        />
      );
  }
  return <View />;
};
