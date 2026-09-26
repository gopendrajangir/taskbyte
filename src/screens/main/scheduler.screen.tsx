import {
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  SectionList,
  Text,
} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, NavigationProp } from '@react-navigation/native';

import {
  AppHeader,
  NoData,
  RoutineCard,
  RoutineRow,
  ScreenLoader,
  ScreenSafeAreaView,
  TaskGroupHeader,
} from '@/components';
import { Colors } from '@/config';
import { PlusIcon } from '@/assets';
import { AppStackParamsList } from '@/navigation/navigation.types';
import { useGetAllRoutines } from '@/hooks';

export const SchedulerScreen = () => {
  const { data, isLoading, isRefetching, refetch } = useGetAllRoutines();

  const navigation = useNavigation<NavigationProp<AppStackParamsList>>();

  const timeBased = data?.filter(d => d.hasTime);
  const flexible = data?.filter(d => !d.hasTime);

  const sections = [
    {
      title: 'Time Based',
      subTitle: 'Scheduled',
      subTitleColor: Colors.cyan,
      data: timeBased ?? [],
      noDataMessage: 'No time based routine tasks',
      rowColor: undefined,
    },
    {
      title: 'Flexible',
      subTitle: 'Anytime',
      subTitleColor: Colors.indigo,
      data: flexible ?? [],
      noDataMessage: 'No flexible routine tasks',
      rowColor: Colors.indigo,
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
          title={title}
          subTitle={subTitle}
          subTitleColor={subTitleColor}
          style={styles.groupHeader}
        />

        {data.length === 0 && (
          <NoData message={noDataMessage} style={styles.noData} />
        )}
      </>
    );
  };

  return (
    <ScreenSafeAreaView>
      <AppHeader title="Routine Scheduler" />

      {isLoading ? (
        <ScreenLoader message="Fetching Tasks" />
      ) : (
        <>
          <SectionList
            style={styles.main}
            contentContainerStyle={styles.mainContent}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
            }
            ListHeaderComponent={() => (
              <RoutineCard
                count={data?.length ?? 0}
                style={styles.routineCard}
              />
            )}
            sections={sections}
            renderSectionHeader={renderSectionHeader}
            renderItem={({ item, section }) => (
              <RoutineRow
                data={item}
                color={section.rowColor}
                style={styles.routineRow}
              />
            )}
            keyExtractor={item => item.id}
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
                navigation.navigate('CreateRoutine');
              }}
            >
              <PlusIcon height={18} width={18} color="#000" />
              <Text style={styles.createRoutineText}>Create Routine</Text>
            </TouchableOpacity>
          </LinearGradient>
        </>
      )}
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
    padding: 16,
  },
  mainContent: {
    paddingBottom: 100,
  },
  heading: {
    textTransform: 'uppercase',
  },
  btnGradient: {
    borderRadius: 50,
    position: 'absolute',
    bottom: 28,
    right: 28,
  },
  addBtn: {
    borderRadius: 50,
    gap: 2,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  routineCard: {
    marginBottom: 20,
  },
  groupHeader: {
    marginBottom: 20,
  },
  routineRow: {
    marginBottom: 16,
  },
  noData: {
    marginBottom: 32,
    marginTop: 8,
  },
  createRoutineText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
