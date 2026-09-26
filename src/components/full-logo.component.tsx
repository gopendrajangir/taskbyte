import {
  View,
  StyleSheet,
  Image,
  Text,
  StyleProp,
  ViewStyle,
} from 'react-native';
import React from 'react';
import { Colors } from '@/config';
import { LogoImage } from '@/assets';
import { AppName } from './app-name.component';

interface FullLogoProps {
  style?: StyleProp<ViewStyle>;
}

export const FullLogo: React.FC<FullLogoProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <Image source={LogoImage} style={styles.logo} />
      <View style={styles.nameContainer}>
        <AppName />
      </View>
      <Text style={styles.bottomLine}>Plan, Focus, Achieve</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  logo: {
    height: 60,
    width: 60,
  },
  bottomLine: {
    color: Colors.offWhite,
    fontSize: 10,
    marginTop: 2,
  },
});
