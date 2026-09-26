import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppStackParamsList,
  AuthStackParamsList,
  HomeTabsParamsList,
} from './navigation.types';
import { useAuthStore } from '@/store';
import {
  SplashScreen,
  SignInScreen,
  HomeScreen,
  CreateTaskScreen,
  SchedulerScreen,
  TasksScreen,
  CreateRoutineScreen,
  TaskDetailsScreen,
  EditTaskScreen,
  RoutineDetailsScreen,
  EditRoutineScreen,
  ProfileScreen,
} from '@/screens';
import React from 'react';
import { CalendarIcon, HomeIcon, TasksIcon } from '@/assets';
import { Colors } from '@/config';
import { useSyncUserData } from '@/hooks';

const AuthStack = createNativeStackNavigator<AuthStackParamsList>();
const AppStack = createNativeStackNavigator<AppStackParamsList>();
const HomeTabs = createBottomTabNavigator<HomeTabsParamsList>();

const HomeTabsNavigator = () => {
  const { bottom } = useSafeAreaInsets();

  const extraPadding = bottom;

  return (
    <HomeTabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          height: 60 + extraPadding,
          backgroundColor: Colors.backgroundDark,
          borderTopColor: '#222',
          elevation: 0,
          shadowOpacity: 0,
          paddingTop: 4,
        },

        tabBarActiveTintColor: Colors.logoYellow,
        tabBarInactiveTintColor: '#aaa',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },

        tabBarIcon: ({ color }) => {
          const size = 20;

          switch (route.name) {
            case 'Home':
              return <HomeIcon color={color} height={size} width={size} />;
            case 'Scheduler':
              return <CalendarIcon color={color} height={size} width={size} />;
            case 'Tasks':
              return <TasksIcon color={color} height={size} width={size} />;
            default:
              return <HomeIcon color={color} height={size} width={size} />;
          }
        },
      })}
    >
      <HomeTabs.Screen name="Home" component={HomeScreen} />
      <HomeTabs.Screen name="Scheduler" component={SchedulerScreen} />
      <HomeTabs.Screen name="Tasks" component={TasksScreen} />
    </HomeTabs.Navigator>
  );
};

export const RootNavigator = () => {
  const { user, isGuest, splashLoading } = useAuthStore();

  const isLoggedIn = !!user || isGuest;

  useSyncUserData();

  if (splashLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {!isLoggedIn ? (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="SignIn" component={SignInScreen} />
        </AuthStack.Navigator>
      ) : (
        <AppStack.Navigator screenOptions={{ headerShown: false }}>
          <AppStack.Screen name="HomeTabs" component={HomeTabsNavigator} />
          <AppStack.Screen name="CreateTask" component={CreateTaskScreen} />
          <AppStack.Screen
            name="CreateRoutine"
            component={CreateRoutineScreen}
          />
          <AppStack.Screen name="TaskDetails" component={TaskDetailsScreen} />
          <AppStack.Screen name="EditTask" component={EditTaskScreen} />
          <AppStack.Screen
            name="RoutineDetails"
            component={RoutineDetailsScreen}
          />
          <AppStack.Screen name="EditRoutine" component={EditRoutineScreen} />
          <AppStack.Screen name="Profile" component={ProfileScreen} />
        </AppStack.Navigator>
      )}
    </NavigationContainer>
  );
};
