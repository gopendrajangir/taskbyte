import Config from 'react-native-config';

export const __log = (...messages: any[]) => {
  if (Config.ENABLE_LOGS === 'true') {
    console.log('LOG:', ...messages);
  }
};
