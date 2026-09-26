import { NativeModules, Platform } from 'react-native';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from '@react-native-firebase/auth';
import { AppleAuthProvider } from '@react-native-firebase/auth';
import {
  appleAuth,
  appleAuthAndroid,
} from '@invertase/react-native-apple-authentication';
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';
import Config from 'react-native-config';

const { GoogleAuthModule } = NativeModules;

export const googleSignIn = async () => {
  const idToken = await GoogleAuthModule.signIn();

  if (!idToken) {
    throw new Error('No ID token found');
  }
  // Create a Google credential with the token
  const googleCredential = GoogleAuthProvider.credential(idToken);
  // Sign-in the user with the credential
  return signInWithCredential(getAuth(), googleCredential);
};

export const appleSignInAndroid = async () => {
  // Generate secure, random values for state and nonce
  const rawNonce = uuid();
  const state = uuid();

  // Configure the request
  appleAuthAndroid.configure({
    // The Service ID you registered with Apple
    clientId: 'com.gopendra.taskbyte.auth',

    // Return URL added to your Apple dev console. We intercept this redirect, but it must still match
    // the URL you provided to Apple. It can be an empty route on your backend as it's never called.
    redirectUri: Config.APPLE_REDIRECT_URI,

    // The type of response requested - code, id_token, or both.
    responseType: appleAuthAndroid.ResponseType.ALL,

    // The amount of user information requested from Apple.
    scope: appleAuthAndroid.Scope.ALL,

    // Random nonce value that will be SHA256 hashed before sending to Apple.
    nonce: rawNonce,

    // Unique state value used to prevent CSRF attacks. A UUID will be generated if nothing is provided.
    state,
  });

  // Open the browser window for user sign in
  const response = await appleAuthAndroid.signIn();

  if (!response.id_token) {
    throw new Error('Apple Sign-In failed');
  }

  const appleCredential = AppleAuthProvider.credential(
    response.id_token,
    rawNonce,
  );

  return signInWithCredential(getAuth(), appleCredential);
};

export const appleSignInIOS = async () => {
  // Start the sign-in request
  const appleAuthRequestResponse = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
  });

  // Ensure Apple returned a user identityToken
  if (!appleAuthRequestResponse.identityToken) {
    throw new Error('Apple Sign-In failed - no identify token returned');
  }

  // Create a Firebase credential from the response
  const { identityToken, nonce } = appleAuthRequestResponse;
  const appleCredential = AppleAuthProvider.credential(identityToken, nonce);

  // Sign the user in with the credential
  return signInWithCredential(getAuth(), appleCredential);
};

export const appleSignIn = async () => {
  if (Platform.OS === 'android') {
    return await appleSignInAndroid();
  }
  if (Platform.OS === 'ios') {
    return await appleSignInIOS();
  }
};
