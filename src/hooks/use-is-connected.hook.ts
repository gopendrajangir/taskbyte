import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { __log } from '@/utils';

export const useIsConnected = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online =
        state.isConnected === true && state.isInternetReachable !== false;

      setIsConnected(online);

      if (online) {
        __log('Internet restored');
      } else {
        __log('Internet lost');
      }
    });

    return () => unsubscribe();
  }, []);

  return isConnected;
};
