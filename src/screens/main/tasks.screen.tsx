import { StyleSheet, View, FlatList } from 'react-native';
import React, { useMemo, useState } from 'react';

import {
  AppButton,
  AppHeader,
  CompletionRateCard,
  NoData,
  ScreenLoader,
  ScreenSafeAreaView,
  TasksListCollapsible,
  TimedTaskRow,
} from '@/components';
import { Colors } from '@/config';
import { useGetAllTasks } from '@/hooks';
import { groupTasksByDateInSections } from '@/utils';

export const TasksScreen = () => {
  const [listType, setListType] = useState<'scheduled' | 'unscheduled'>(
    'scheduled',
  );

  const { data, isLoading } = useGetAllTasks();

  const grouped = useMemo(() => {
    return groupTasksByDateInSections(data ?? []);
  }, [data]);

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <CompletionRateCard
          total={data?.length ?? 0}
          completed={grouped.completed}
        />
        <View style={styles.selectBtnsContainer}>
          <AppButton
            title="Scheduled"
            onPress={() => setListType('scheduled')}
            type={listType === 'unscheduled' ? 'outline' : 'default'}
            style={styles.selectBtn}
          />
          <AppButton
            title="Unscheduled"
            onPress={() => setListType('unscheduled')}
            type={listType === 'scheduled' ? 'outline' : 'default'}
            style={styles.selectBtn}
          />
        </View>
      </View>
    );
  };

  // ---------- SCHEDULED LIST ----------
  const renderScheduledList = () => {
    return (
      <FlatList
        data={grouped.scheduled}
        keyExtractor={item => item.dateKey}
        contentContainerStyle={styles.mainContent}
        renderItem={({ item }) => <TasksListCollapsible data={item} />}
        ListEmptyComponent={
          <NoData message="No scheduled tasks" height={400} />
        }
      />
    );
  };

  // ---------- UNSCHEDULED LIST ----------
  const renderUnscheduledList = () => {
    return (
      <FlatList
        data={grouped.unscheduled}
        keyExtractor={item => item.id + 'unscheduled-task'}
        contentContainerStyle={styles.mainContent}
        style={styles.listContainer}
        renderItem={({ item }) => <TimedTaskRow data={item} />}
        ListEmptyComponent={
          <NoData message="No unscheduled tasks" height={400} />
        }
      />
    );
  };

  if (isLoading) {
    return (
      <ScreenSafeAreaView>
        <AppHeader title="All Tasks" />
        <ScreenLoader message="Fetching Tasks" />
      </ScreenSafeAreaView>
    );
  }

  return (
    <ScreenSafeAreaView>
      <AppHeader title="All Tasks" />
      {renderHeader()}
      {listType === 'scheduled'
        ? renderScheduledList()
        : renderUnscheduledList()}
    </ScreenSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mainContent: {
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  selectBtnsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 12,
  },
  selectBtn: {
    flex: 1,
  },
  heading: {
    textTransform: 'uppercase',
  },
  listContainer: {
    flex: 1,
  },
});
