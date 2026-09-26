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
  ScreenLoader,
  ScreenSafeAreaView,
  TaskStatus,
  TaskTypeStatus,
} from '@/components';
import { Colors } from '@/config';
import { AppStackParamsList } from '@/navigation/navigation.types';
import { applyOpacity, convertToTaskDTO, getTaskType, is24Hour } from '@/utils';
import { CalendarIcon, TimeIcon } from '@/assets';
import {
  useDeleteTaskMutation,
  useGetTaskById,
  useMarkTaskAsDoneMutation,
} from '@/hooks';
import { useAppToast } from '@/context';
import { Task } from '@/db/models';

type Props = NativeStackScreenProps<AppStackParamsList, 'TaskDetails'>;

export const TaskDetailsScreen: React.FC<Props> = ({ route }) => {
  const { taskId } = route.params;

  const [task, setTask] = useState<Task | null>(null);
  const [showMarkDoneModal, setShowMarkDoneModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
    data: taskData,
    isLoading: taskDataLoading,
    refetch,
    isRefetching,
  } = useGetTaskById(taskId);

  const { mutate: deleteTask, isPending: deleteTaskLoading } =
    useDeleteTaskMutation({
      onSuccess: () => {
        showSuccessToast('Successfully deleted the task.');
        navigation.goBack();
      },
      onError: () => {
        showErrorToast('Error while deleting the task.');
      },
    });

  const { mutate: markTaskAsDone, isPending: markTaskAsDoneLoading } =
    useMarkTaskAsDoneMutation({
      onSuccess: () => {
        showSuccessToast('Congratulations! You finished the task.');
      },
      onError: () => {
        showErrorToast('Error while marking the task as done.');
      },
    });

  useEffect(() => {
    if (taskData) {
      setTask(taskData);
    }
  }, [taskData]);

  const navigation = useNavigation<NavigationProp<AppStackParamsList>>();

  const shouldFreeze = deleteTaskLoading || markTaskAsDoneLoading;

  const renderTaskDetails = (task: Task) => {
    const { title, notes, dueAt, hasTime, category, done } = task;

    const { title: categoryTitle, color: categoryColor } =
      categoryData[category];

    const date = dueAt ? moment(dueAt).format('MMM DD, YYYY') : '--';
    const time =
      dueAt && hasTime
        ? moment(dueAt).format(`hh:mm ${is24Hour() ? 'A' : ''}`)
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
        <View style={[styles.section]}>
          <Text style={styles.heading}>Date & Time</Text>
          <View style={styles.dateTimeRow}>
            <CalendarIcon width={16} height={16} color={Colors.cyan} />
            <Text style={styles.dateTimeTitle}>Date</Text>
            <Text style={styles.dateTimeBtnText}>{date}</Text>
          </View>
          <View style={styles.dateTimeRow}>
            <TimeIcon width={16} height={16} color={Colors.cyan} />
            <Text style={styles.dateTimeTitle}>Time</Text>
            <Text style={styles.dateTimeBtnText}>{time}</Text>
          </View>
        </View>
        <View style={[styles.sectionTransparent, { alignItems: 'flex-start' }]}>
          <Text style={styles.heading}>Status</Text>
          <TaskStatus
            dueAt={dueAt}
            hasTime={hasTime}
            done={done}
            style={styles.taskStatus}
            textSize={12}
          />
        </View>
      </>
    );
  };

  const renderTaskBtns = (task: Task) => {
    const { done } = task;

    return (
      <View style={styles.btns}>
        {!done && (
          <>
            <AppButtonByType
              type="edit"
              onPress={() =>
                navigation.navigate('EditTask', {
                  data: convertToTaskDTO(task),
                })
              }
              style={styles.btn}
              disabled={shouldFreeze}
            />
            <AppButtonByType
              type="mark-as-done"
              onPress={() => setShowMarkDoneModal(true)}
              style={styles.btn}
              loading={markTaskAsDoneLoading}
              disabled={shouldFreeze}
            />
          </>
        )}
        <AppButtonByType
          type="delete"
          onPress={() => setShowDeleteModal(true)}
          style={styles.btn}
          loading={deleteTaskLoading}
          disabled={shouldFreeze}
        />
      </View>
    );
  };

  return (
    <ScreenSafeAreaView>
      <AppHeader title="Task Details" />
      {taskDataLoading ? (
        <ScreenLoader message="Fetching task details" />
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
            {!task ? (
              <View style={styles.noData}>
                <NoData message="Task not found" />
              </View>
            ) : (
              renderTaskDetails(task)
            )}
          </ScrollView>
          {task && renderTaskBtns(task)}
        </>
      )}
      <ConfirmationModal
        visible={showDeleteModal}
        title="Delete Task?"
        message="Are you sure you want to delete this task?"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
          deleteTask(taskId);
        }}
      />
      <ConfirmationModal
        visible={showMarkDoneModal}
        title="Mark as Done"
        message="Are you sure you want to mark the task as done?"
        onCancel={() => setShowMarkDoneModal(false)}
        onConfirm={() => {
          setShowMarkDoneModal(false);
          markTaskAsDone(taskId);
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
