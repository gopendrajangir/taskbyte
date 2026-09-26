declare module 'react-native-config' {
  export interface NativeConfig {
    APP_ENV: string;
    APP_NAME: string;
    ENABLE_LOGS: string;
    APPLE_REDIRECT_URI: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
