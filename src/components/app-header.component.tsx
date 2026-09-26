import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

import { useAuthStore } from '@/store';
import { getGreeting } from '@/utils';
import { AppName } from './app-name.component';
import { LeftArrowIcon, User2Icon } from '@/assets';
import { Colors } from '@/config';
import { AppStackParamsList } from '@/navigation/navigation.types';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { SyncIconUI } from './sync-icon-ui-component';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  isHome?: boolean;
  title?: string;
}

export const AppHeader: React.FC<Props> = ({ isHome = false, title }) => {
  const greeting = getGreeting();

  const { user, isGuest } = useAuthStore();

  const displayName = user?.displayName;
  const photoURL = user?.photoURL;

  const navigation = useNavigation<NavigationProp<AppStackParamsList>>();

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {isHome ? (
        <>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <AppName style={styles.appName} />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={styles.avatarContainer}
          >
            {photoURL ? (
              <Image source={{ uri: photoURL }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                {isGuest || !displayName ? (
                  <User2Icon
                    height={30}
                    width={30}
                    color={Colors.textSecondary}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {displayName.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.nonHomeContainer}>
          <LeftArrowIcon
            height={28}
            width={28}
            color={Colors.textPrimary}
            onPress={() => navigation.goBack()}
            hitSlop={20}
          />
          <Text style={styles.screenTitle}>{title}</Text>
          <SyncIconUI style={styles.syncIcon} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 58,
  },
  greeting: { fontSize: 12, color: '#fff', marginBottom: 0 },
  appName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderRadius: 50,
    padding: 2,
    borderColor: Colors.glass,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 18,
    backgroundColor: '#1E293B',
  },
  avatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 32,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  nonHomeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  screenTitle: {
    position: 'absolute',
    fontSize: 16,
    left: '50%',
    color: Colors.textPrimary,
    transform: [
      {
        translateX: '-50%',
      },
    ],
  },
  syncIcon: {
    marginLeft: 'auto',
  },
});
