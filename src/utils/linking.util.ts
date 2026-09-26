import {
  PRIVACY_POLICY_URL,
  SUPPORT_EMAIL,
  TERMS_OF_SERVICE_URL,
} from '@/config/constants';
import { Alert, Linking } from 'react-native';

export const openSupportEmail = async () => {
  const url = `mailto:${SUPPORT_EMAIL}`;

  try {
    await Linking.openURL(url);
  } catch (err) {
    Alert.alert(
      'No Email App',
      'Please email us at support.taskbyte@gmail.com',
    );
  }
};

export const openUrl = async (type: 'privacy' | 'terms') => {
  let url;

  switch (type) {
    case 'privacy':
      url = PRIVACY_POLICY_URL;
      break;
    case 'terms':
      url = TERMS_OF_SERVICE_URL;
      break;
    default:
      url = '';
  }

  const supported = await Linking.canOpenURL(url);

  if (supported) {
    await Linking.openURL(url);
  }
};
