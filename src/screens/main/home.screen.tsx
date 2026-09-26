import {
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  SectionList,
  Modal,
} from 'react-native';
import React, { useCallback } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from '@react-navigation/native';

import {
  AppHeader,
  NoData,
  ProgressCard,
  ScreenLoader,
  ScreenSafeAreaView,
  TaskGroupHeader,
  TimedTaskRow,
} from '@/components';

import {
  AppStackParamsList,
  HomeTabsParamsList,
} from '@/navigation/navigation.types';
import { Colors } from '@/config';
import { PlusIcon } from '@/assets';
import {
  useGenerateTasksFromRoutine,
  useGetTasksForDate,
  useGetUnscheduledTasks,
} from '@/hooks';
import { useSyncStore } from '@/store';
import { applyOpacity } from '@/utils';

type Props = NativeStackScreenProps<HomeTabsParamsList, 'Home'>;

export const HomeScreen: React.FC<Props> = () => {
  const { downloading } = useSyncStore();

  const {
    data: todayTasks,
    isLoading: todayTasksLoading,
    isRefetching: todayTasksRefetching,
    refetch: refetchTodayTasks,
  } = useGetTasksForDate(new Date());

  const {
    data: unscheduledTasks,
    isLoading: unscheduledTasksLoading,
    isRefetching: unscheduledTasksRefetching,
    refetch: refetchUnscheduledTasks,
  } = useGetUnscheduledTasks();

  const {
    mutate: generateTasksFromRoutine,
    isPending: generateTasksFromRoutineLoading,
  } = useGenerateTasksFromRoutine();

  const scheduled = todayTasks?.filter(d => d.hasTime && !!d.dueAt);
  const anytime = todayTasks?.filter(d => !d.hasTime && !!d.dueAt);

  const navigation = useNavigation<NavigationProp<AppStackParamsList>>();

  const isLoading =
    todayTasksLoading ||
    unscheduledTasksLoading ||
    generateTasksFromRoutineLoading;

  useFocusEffect(
    useCallback(() => {
      generateTasksFromRoutine();
    }, []),
  );

  const completedCount = todayTasks?.reduce((acc, t) => {
    return acc + (t.done ? 1 : 0);
  }, 0);

  const sections = [
    {
      title: 'Today Timeline',
      subTitle: 'Scheduled',
      subTitleColor: Colors.cyan,
      data: scheduled ?? [],
      noDataMessage: 'No scheduled tasks',
    },
    {
      title: 'Anytime Today',
      subTitle: 'Flexible',
      subTitleColor: Colors.yellowText,
      data: anytime ?? [],
      noDataMessage: 'No flexible tasks',
    },
    {
      title: 'Unscheduled',
      subTitle: 'Backlog',
      subTitleColor: Colors.textMuted,
      data: unscheduledTasks ?? [],
      noDataMessage: 'No unscheduled tasks',
    },
  ];

  const renderSectionHeader = ({
    section,
  }: {
    section: (typeof sections)[0];
  }) => {
    const { title, subTitle, subTitleColor, noDataMessage, data } = section;
    return (
      <>
        <TaskGroupHeader
          subTitle={subTitle}
          title={title}
          subTitleColor={subTitleColor}
          style={styles.groupHeader}
        />
        {(!data || data.length === 0) && (
          <NoData message={noDataMessage} style={styles.noData} />
        )}
      </>
    );
  };

  return (
    <ScreenSafeAreaView>
      <AppHeader isHome />
      {isLoading ? (
        <ScreenLoader message={'Fetching Tasks'} />
      ) : (
        <>
          <SectionList
            style={styles.main}
            contentContainerStyle={styles.mainContent}
            refreshControl={
              <RefreshControl
                refreshing={todayTasksRefetching || unscheduledTasksRefetching}
                onRefresh={() => {
                  refetchTodayTasks();
                  refetchUnscheduledTasks();
                  generateTasksFromRoutine();
                }}
              />
            }
            ListHeaderComponent={() => {
              return (
                <ProgressCard
                  total={todayTasks?.length ?? 0}
                  completed={completedCount ?? 0}
                  style={styles.progressCard}
                />
              );
            }}
            sections={sections}
            renderSectionHeader={renderSectionHeader}
            renderItem={({ item }) => {
              return (
                <TimedTaskRow
                  key={item.id}
                  data={item}
                  style={styles.taskRow}
                />
              );
            }}
          />
          <LinearGradient
            colors={[Colors.cyan, Colors.glass]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btnGradient}
          >
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => {
                navigation.navigate('CreateTask');
              }}
            >
              <PlusIcon height={24} width={24} color="#000" />
            </TouchableOpacity>
          </LinearGradient>
        </>
      )}
      <Modal visible={downloading} transparent>
        <ScreenLoader
          message="Downloading your tasks"
          bgColor={applyOpacity(Colors.background, 0.7)}
        />
      </Modal>
    </ScreenSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  main: {
    flex: 1,
  },
  mainContent: {
    padding: 16,
    paddingBottom: 100,
  },
  todayText: {
    fontSize: 22,
    fontWeight: '500',
    color: '#aaa',
  },
  progressText: {
    fontSize: 22,
    fontWeight: '500',
    color: '#aaa',
  },
  listContainer: {
    gap: 8,
  },
  addBtn: {
    borderRadius: 50,
    padding: 16,
  },
  btnGradient: {
    borderRadius: 50,
    position: 'absolute',
    bottom: 28,
    right: 28,
  },
  progressCard: {
    marginBottom: 16,
  },
  noData: {
    marginTop: 12,
    marginBottom: 20,
  },
  groupHeader: {
    marginBottom: 20,
    marginTop: 8,
  },
  taskRow: {
    marginBottom: 10,
  },
});

export default HomeScreen;
