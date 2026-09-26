import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  RefreshControl,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import moment from 'moment';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import {
  AppButtonByType,
  AppHeader,
  categoryData,
  CategoryIcon,
  ConfirmationModal,
  NoData,
  RoutineWeeks,
  ScreenLoader,
  ScreenSafeAreaView,
  TaskTypeStatus,
} from '@/components';
import { Colors } from '@/config';
import { AppStackParamsList } from '@/navigation/navigation.types';
import {
  applyOpacity,
  convertToRoutineDTO,
  getTaskType,
  is24Hour,
} from '@/utils';
import { TimeIcon } from '@/assets';
import { useAppToast } from '@/context';
import { Routine } from '@/db/models';
import { useDeleteRoutineMutation, useGetRoutineById } from '@/hooks';

type Props = NativeStackScreenProps<AppStackParamsList, 'RoutineDetails'>;

export const RoutineDetailsScreen: React.FC<Props> = ({ route }) => {
  const { routineId } = route.params;

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const navigation = useNavigation<NavigationProp<AppStackParamsList>>();
  const { showToast } = useAppToast();

  const showErrorToast = (message: string) => {
    showToast({
      type: 'danger',
      message,
    });
  };

  const showSuccessToast = (message: string) => {
    showToast({
      type: 'success',
      message,
    });
  };

  const {
    data: routineData,
    isLoading: routineDataLoading,
    refetch,
    isRefetching,
  } = useGetRoutineById(routineId);

  const { mutate: deleteRoutine, isPending: deleteRoutineLoading } =
    useDeleteRoutineMutation({
      onSuccess: () => {
        showSuccessToast('Successfully deleted the routine.');
        navigation.goBack();
      },
      onError: () => {
        showErrorToast('Error while deleting the routine.');
      },
    });

  useEffect(() => {
    if (routineData) {
      setRoutine(routineData);
    }
  }, [routineData]);

  const shouldFreeze = deleteRoutineLoading;

  const renderRoutineDetails = (routine: Routine) => {
    const { title, notes, dueAt, hasTime, category, weeks } = routine;

    const { title: categoryTitle, color: categoryColor } =
      categoryData[category];

    const time =
      dueAt && hasTime
        ? moment(dueAt).format(is24Hour() ? 'HH:mm' : 'hh:mm A')
        : '--';

    return (
      <>
        <View style={styles.sectionTransparent}>
          <Text style={styles.heading}>Title</Text>
          <Text style={styles.title}>{title}</Text>
        </View>

        <View style={styles.sectionTransparent}>
          <Text style={styles.heading}>Category</Text>

          <View style={styles.categoryContainer}>
            <CategoryIcon category={category} size={36} iconSize={20} />

            <Text
              style={[
                styles.categoryText,
                {
                  color: categoryColor,
                  backgroundColor: applyOpacity(categoryColor, 0.2),
                },
              ]}
            >
              {categoryTitle}
            </Text>
          </View>
        </View>

        <View style={styles.sectionTransparent}>
          <Text style={styles.heading}>Notes</Text>
          <Text style={styles.notes}>{notes || '--'}</Text>
        </View>

        <View
          style={[
            styles.sectionTransparent,
            {
              alignItems: 'flex-start',
            },
          ]}
        >
          <Text style={styles.heading}>Type</Text>
          <TaskTypeStatus type={getTaskType(dueAt, hasTime)} />
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Time</Text>

          <View style={styles.dateTimeRow}>
            <TimeIcon width={20} height={20} color={Colors.cyan} />
            <Text style={styles.dateTimeTitle}>Time</Text>
            <Text style={styles.dateTimeBtnText}>{time}</Text>
          </View>
        </View>

        <View style={styles.sectionTransparent}>
          <Text style={styles.heading}>Repeats on</Text>

          <RoutineWeeks
            selectedWeeks={JSON.parse(weeks)}
            color={Colors.cyan}
            style={{}}
            size={32}
            textSize={12}
          />
        </View>
      </>
    );
  };

  const renderRoutineBtns = (routine: Routine) => {
    return (
      <View style={styles.btns}>
        <AppButtonByType
          type="edit"
          onPress={() =>
            navigation.navigate('EditRoutine', {
              data: convertToRoutineDTO(routine),
            })
          }
          style={styles.btn}
          disabled={shouldFreeze}
        />
        <AppButtonByType
          type="delete"
          onPress={() => setShowDeleteModal(true)}
          style={styles.btn}
          loading={deleteRoutineLoading}
          disabled={shouldFreeze}
        />
      </View>
    );
  };

  return (
    <ScreenSafeAreaView>
      <AppHeader title="Routine Details" />

      {routineDataLoading ? (
        <ScreenLoader message="Fetching routine details" />
      ) : (
        <>
          <ScrollView
            style={styles.main}
            contentContainerStyle={styles.mainContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={() => {
                  refetch();
                }}
              />
            }
          >
            {!routine ? (
              <NoData message="Routine not found" />
            ) : (
              renderRoutineDetails(routine)
            )}
          </ScrollView>

          {routine && renderRoutineBtns(routine)}
        </>
      )}

      <ConfirmationModal
        visible={showDeleteModal}
        title="Delete Routine?"
        message="Are you sure you want to delete this routine?"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
          deleteRoutine(routineId);
        }}
      />
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
  taskDetailsMain: {
    flex: 1,
  },
  mainContent: {
    gap: 20,
    paddingBottom: 100,
  },
  noData: {
    height: 200,
  },
  categoryContainer: {
    alignItems: 'center',
    gap: 6,
    flexDirection: 'row',
  },
  categoryText: {
    flex: 0,
    padding: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    fontSize: 10,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 14,
  },
  heading: {
    textTransform: 'uppercase',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    fontSize: 12,
  },
  sectionTransparent: {
    gap: 6,
  },
  notes: {
    color: Colors.textPrimary,
    fontSize: 12,
    lineHeight: 18,
  },
  section: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    borderRadius: 12,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
    marginTop: 12,
  },
  dateTimeTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  dateTimeBtnText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginRight: 4,
    marginLeft: 'auto',
  },
  btns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
    padding: 16,
  },
  btn: {
    borderRadius: 12,
    padding: 12,
    flexGrow: 1,
  },
  taskStatus: {
    padding: 6,
    paddingHorizontal: 16,
    borderRadius: 40,
  },
});
