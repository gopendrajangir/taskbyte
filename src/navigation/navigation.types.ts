import { RoutineData, TaskData } from '@/db/models';
import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamsList = {
  SignIn: undefined;
};

export type AppStackParamsList = {
  HomeTabs: NavigatorScreenParams<HomeTabsParamsList>;
  CreateTask: undefined;
  CreateRoutine: undefined;
  TaskDetails: {
    taskId: string;
  };
  EditTask: {
    data: TaskData;
  };
  RoutineDetails: {
    routineId: string;
  };
  EditRoutine: {
    data: RoutineData;
  };
  Profile: undefined;
};

export type HomeTabsParamsList = {
  Home: undefined;
  Scheduler: undefined;
  Tasks: undefined;
};
