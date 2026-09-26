/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { AppToastProvider } from '@/context';
import { RootNavigator } from '@/navigation/root-navigator.navigation';
import { queryClient } from '@/services/query-client.service';

const App = () => {
  return (
    <GestureHandlerRootView style={styles.gestureHandlerView}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider style={styles.container}>
          <AppToastProvider>
            <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
              <RootNavigator />
            </KeyboardProvider>
          </AppToastProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  gestureHandlerView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});

export default App;
