import { useEffect } from 'react';

import {
  downloadFirestoreDataToLocalDB,
  getFirestoreUser,
  syncEngine,
} from '@/services';
import { useAuthStore, useSyncStore } from '@/store';
import { useQueryClient } from '@tanstack/react-query';
import { useIsConnected } from './use-is-connected.hook';
import { __log } from '@/utils';

export const useSyncUserData = () => {
  const { user, isGuest, setUserData } = useAuthStore();
  const { triggerSyncFlag, setDownloding } = useSyncStore();

  const isConnected = useIsConnected();

  const queryClient = useQueryClient();

  const isLoggedIn = !!user || !isGuest;

  const uid = user?.uid;

  useEffect(() => {
    if (isLoggedIn && uid) {
      getFirestoreUser(uid)
        .then(result => {
          if (result) {
            setUserData(result);
          }
        })
        .catch(err => {
          __log('Some error occured: ', err);
        });
    }
  }, [isLoggedIn, uid]);

  useEffect(() => {
    if (isLoggedIn && triggerSyncFlag > 0) {
      syncEngine.triggerSync();
    }
  }, [isLoggedIn, triggerSyncFlag, triggerSyncFlag]);

  useEffect(() => {
    if (isLoggedIn && uid) {
      setDownloding(true);
      downloadFirestoreDataToLocalDB(uid)
        .then(() => {
          queryClient.invalidateQueries();
        })
        .catch(err => {
          __log(err);
        })
        .finally(() => {
          setDownloding(false);
        });
    }
  }, [isLoggedIn, uid]);

  useEffect(() => {
    if (isConnected && isLoggedIn) {
      syncEngine.triggerSync();
    }
  }, [isConnected, isLoggedIn]);
};
