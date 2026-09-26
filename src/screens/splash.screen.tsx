import { StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { getAuth } from '@react-native-firebase/auth';

import { FullLogo, ScreenSafeAreaView } from '@/components';
import { useAuthStore } from '@/store';
import { MMKVStorage, MMKVStorageKeys } from '@/services';
import { firebaseUserToAuthUser } from '@/utils';

export const SplashScreen = () => {
  const { setSplashLoading, setUser, setIsGuest } = useAuthStore();

  useEffect(() => {
    const isGuest = MMKVStorage.get<boolean>(MMKVStorageKeys.isGuest);

    if (isGuest) {
      setIsGuest();
    } else {
      const currentUser = getAuth().currentUser;
      if (currentUser) {
        setUser(firebaseUserToAuthUser(currentUser));
      }
    }

    setTimeout(() => {
      setSplashLoading(false);
    }, 2000);
  }, []);

  return (
    <ScreenSafeAreaView style={styles.container}>
      <FullLogo />
    </ScreenSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  logo: {
    width: 80,
    height: 80,
  },
});

export default SplashScreen;
