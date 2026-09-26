import { StyleSheet, ImageBackground, Text, View } from 'react-native';
import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

import {
  appleSignIn,
  googleSignIn,
  MMKVStorage,
  MMKVStorageKeys,
  syncEngine,
} from '@/services';
import { FullLogo, SignInButton } from '@/components';
import { Colors } from '@/config';
import { useAppToast } from '@/context';
import { AuthStackParamsList } from '@/navigation/navigation.types';
import {
  AppleIcon,
  BackgroundImage,
  GoogleIcon,
  LockIcon,
  User2Icon,
} from '@/assets';
import { useAuthStore } from '@/store';
import { __log, firebaseUserToAuthUser, openUrl } from '@/utils';
import { SigninProvider } from '@/types/global.type';

type Props = NativeStackScreenProps<AuthStackParamsList, 'SignIn'>;

export const SignInScreen: React.FC<Props> = () => {
  const { setUser, setIsGuest } = useAuthStore();
  const { showToast } = useAppToast();

  const onSignInSuccess = (
    result: FirebaseAuthTypes.UserCredential,
    provider: SigninProvider,
  ) => {
    setUser(firebaseUserToAuthUser(result.user));
    syncEngine.restart();
    syncEngine.triggerSync();
    MMKVStorage.set(MMKVStorageKeys.loginProvider, provider);
  };

  const onSignInError = () => {
    showToast({
      type: 'danger',
      message: 'Some error occurred. Try Again',
    });
  };

  const onGoogleSignIn = async () => {
    try {
      const result = await googleSignIn();
      onSignInSuccess(result, 'google');
    } catch (err) {
      __log(err);
      onSignInError();
    }
  };

  const onAppleSignIn = async () => {
    try {
      const result = await appleSignIn();
      if (result) {
        onSignInSuccess(result, 'apple');
      } else {
        throw new Error('Some error occured');
      }
    } catch (err) {
      __log(err);
      onSignInError();
    }
  };

  const onGuestSignIn = () => {
    setIsGuest();
    MMKVStorage.set('isGuest', true);
  };

  return (
    <ImageBackground source={BackgroundImage} style={styles.container}>
      <FullLogo style={styles.logo} />
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.welcomeSignInText}>
          Sign in to continue to your workspace
        </Text>
      </View>
      <SignInButton
        title="Continue with Google"
        icon={<GoogleIcon width={20} height={20} />}
        onPress={onGoogleSignIn}
      />
      <View style={styles.orContainer}>
        <View style={styles.orLine} />
        <Text style={styles.orText}>OR</Text>
        <View style={styles.orLine} />
      </View>
      <SignInButton
        title="Continue with Apple"
        icon={<AppleIcon width={20} height={20} color="#fff" />}
        onPress={onAppleSignIn}
      />
      <View style={styles.orContainer}>
        <View style={styles.orLine} />
        <Text style={styles.orText}>OR</Text>
        <View style={styles.orLine} />
      </View>
      <SignInButton
        title="Continue as Guest"
        icon={<User2Icon width={20} height={20} color="#fff" />}
        onPress={onGuestSignIn}
      />
      <View style={styles.termsContainer}>
        <LockIcon color={'#555'} height={20} width={20} />
        <View>
          <Text style={styles.continueText}>
            By continuing, you agree to our
          </Text>
          <Text style={styles.termsBottomText}>
            <Text style={styles.termsText} onPress={() => openUrl('terms')}>
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text style={styles.privacyText} onPress={() => openUrl('privacy')}>
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 16,
  },
  logo: {
    marginTop: 'auto',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 80,
  },
  welcomeText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  welcomeSignInText: {
    color: Colors.offWhite,
    fontSize: 12,
    marginTop: 4,
  },
  orContainer: {
    marginVertical: 18,
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orText: {
    color: Colors.offWhite,
    marginHorizontal: 20,
    fontSize: 12,
  },
  orLine: {
    height: 1,
    backgroundColor: '#333',
    flex: 0.3,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 40,
  },
  continueText: {
    color: Colors.offWhite,
    fontSize: 12,
  },
  termsBottomText: {
    color: Colors.offWhite,
    fontSize: 10,
  },
  termsText: {
    color: Colors.logoYellow,
  },
  privacyText: {
    color: Colors.logoYellow,
  },
});

export default SignInScreen;
