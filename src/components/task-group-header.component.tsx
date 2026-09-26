import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import React from 'react';
import { Colors } from '@/config';

interface Props {
  subTitle: string;
  title: string;
  style?: StyleProp<ViewStyle>;
  subTitleColor: string;
}

export const TaskGroupHeader: React.FC<Props> = ({
  subTitle,
  title,
  style,
  subTitleColor,
}) => {
  return (
    <View style={style}>
      <Text style={[styles.subTitle, { color: subTitleColor }]}>
        {subTitle}
      </Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  subTitle: {
    color: Colors.cyan,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontSize: 10,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 14,
    marginTop: 4,
    letterSpacing: 0.3
  },
});
