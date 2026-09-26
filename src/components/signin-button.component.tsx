import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { Colors } from '@/config';

interface Props {
  title: string;
  icon: React.ReactElement;
  onPress: () => void;
}

export const SignInButton: React.FC<Props> = ({ title, icon, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {icon}
      <Text style={styles.titleText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#444',
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10
  },
  titleText: {
    color: Colors.white,
    fontWeight: '500',
    fontSize: 12
  },
});
