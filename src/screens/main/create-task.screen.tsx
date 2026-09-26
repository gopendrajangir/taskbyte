import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, { useMemo, useState } from 'react';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';

import {
  AppButton,
  AppHeader,
  categoryData,
  CategoryIcon,
  CategoryType,
  CircledBg,
  ScreenSafeAreaView,
  WeeksSelector,
} from '@/components';
import { Colors } from '@/config';
import {
  CalendarIcon,
  ChevronRightIcon,
  MinusCircleIcon,
  NotesIcon,
  PencilIcon,
  TimeIcon,
} from '@/assets';
import { is24Hour } from '@/utils';
import {
  useCreateRoutineMutation,
  useCreateTaskMutation,
  useWeeksSelector,
} from '@/hooks';
import { useAppToast } from '@/context';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AppStackParamsList } from '@/navigation/navigation.types';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

const categories: CategoryType[] = [
  'work',
  'study',
  'health',
  'personal',
  'finance',
];

export const CreateTaskScreen = () => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryType>('work');

  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [shouldRepeat, setShouldRepeat] = useState(false);

  const { weeks, selectWeek } = useWeeksSelector([0, 1, 2, 3, 4]);

  const { showToast } = useAppToast();

  const navigation = useNavigation<NavigationProp<AppStackParamsList>>();

  const onSuccess = () => {
    showToast({
      type: 'success',
      message: 'Task created successfully. All the best!',
    });
    navigation.goBack();
  };

  const onError = () => {
    showToast({
      type: 'danger',
      message: 'Some error occured',
    });
  };

  const { mutate: createTaskMutate, isPending: createTaskLoading } =
    useCreateTaskMutation({
      onSuccess,
      onError,
    });

  const { mutate: createRoutineMutate, isPending: createRoutineLoading } =
    useCreateRoutineMutation({
      onSuccess,
      onError,
    });

  const createTask = () => {
    let dueAt, hasTime;

    if (date && time) {
      dueAt = moment(date)
        .set({
          hour: moment(time).hour(),
          minute: moment(time).minute(),
          second: moment(time).second(),
          millisecond: 0,
        })
        .valueOf();
      hasTime = true;
    } else if (date) {
      dueAt = date.getTime();
    }

    const payload = {
      title,
      notes,
      category: selectedCategory,
      dueAt,
      hasTime,
    };

    if (shouldRepeat && weeks.length) {
      createRoutineMutate({
        ...payload,
        weeks,
        createInstance: true,
      });
    } else {
      createTaskMutate(payload);
    }
  };

  const handleDateChange = (selectedDate: Date) => {
    setShowDate(false);

    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (selectedTime: Date) => {
    setShowTime(false);

    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const canCreate = useMemo(() => {
    return title.length > 0;
  }, [title]);

  return (
    <ScreenSafeAreaView>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior="padding"
      >
        <AppHeader title="Create Task" />
        <ScrollView
          style={styles.main}
          contentContainerStyle={styles.mainContent}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Task Title</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="What do you want to accomplish?"
                placeholderTextColor={Colors.textFaint}
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                maxLength={50}
              />
              <CircledBg color={Colors.indigo}>
                <PencilIcon width={16} height={16} color={Colors.indigo} />
              </CircledBg>
            </View>
          </View>
          <View>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.categoriesList}>
              {categories.map(category => {
                const selected = category === selectedCategory;

                const { title, color } = categoryData[category];

                return (
                  <Pressable
                    key={category}
                    style={styles.categoryContainer}
                    onPress={() => {
                      setSelectedCategory(category);
                    }}
                  >
                    <CategoryIcon category={category} selected={selected} />
                    <Text style={[styles.categoryTitle, selected && { color }]}>
                      {title}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View style={styles.dateTimeContainer}>
            <Text style={styles.sectionTitle}>
              Date & Time{' '}
              <Text style={styles.sectionTitleOptional}>(Optional)</Text>
            </Text>
            <View style={[styles.section, styles.dateTimeSection]}>
              <View style={styles.dateTimeRow}>
                <CalendarIcon width={16} height={16} color={Colors.cyan} />
                <Text style={styles.dateTimeTitle}>Date</Text>
                <TouchableOpacity
                  style={styles.dateTimeBtn}
                  onPress={() => {
                    setShowDate(true);
                  }}
                >
                  <Text style={styles.dateTimeBtnText}>
                    {date ? moment(date).format('MMM DD, YYYY') : '--'}
                  </Text>
                  <ChevronRightIcon
                    width={16}
                    height={16}
                    color={Colors.textFaint}
                  />
                </TouchableOpacity>
                {date && (
                  <TouchableOpacity onPress={() => setDate(null)}>
                    <MinusCircleIcon
                      height={16}
                      width={16}
                      color={Colors.red}
                    />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.dateTimeRow}>
                <TimeIcon width={16} height={16} color={Colors.cyan} />
                <Text style={styles.dateTimeTitle}>Time</Text>
                <TouchableOpacity
                  style={styles.dateTimeBtn}
                  onPress={() => {
                    setShowTime(true);
                  }}
                  disabled={!date}
                >
                  <Text style={styles.dateTimeBtnText}>
                    {time
                      ? moment(time).format(`hh:mm ${!is24Hour() ? 'A' : ''}`)
                      : '--'}
                  </Text>
                  <ChevronRightIcon
                    width={16}
                    height={16}
                    color={Colors.textFaint}
                  />
                </TouchableOpacity>
                {time && (
                  <TouchableOpacity onPress={() => setTime(null)}>
                    <MinusCircleIcon
                      height={16}
                      width={16}
                      color={Colors.red}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
          <View>
            <Text style={styles.sectionTitle}>Repeat</Text>
            <View style={styles.repeatBtnsContainer}>
              <AppButton
                title="Yes"
                onPress={() => setShouldRepeat(true)}
                type={shouldRepeat ? 'outline' : 'default'}
                style={[
                  styles.repeatBtn,
                  !shouldRepeat && styles.repeatBtnUnselected,
                ]}
                textStyle={[
                  styles.repeatBtnText,
                  !shouldRepeat && styles.repeatBtnTextUnselected,
                ]}
              />
              <AppButton
                title="No"
                onPress={() => setShouldRepeat(false)}
                type={!shouldRepeat ? 'outline' : 'default'}
                style={[
                  styles.repeatBtn,
                  ,
                  shouldRepeat && styles.repeatBtnUnselected,
                ]}
                textStyle={[
                  styles.repeatBtnText,
                  shouldRepeat && styles.repeatBtnTextUnselected,
                ]}
              />
            </View>
            <WeeksSelector
              style={styles.weeksContainer}
              selectedWeeks={weeks}
              selectWeek={selectWeek}
              disabled={!shouldRepeat}
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Notes <Text style={styles.sectionTitleOptional}>(Optional)</Text>
            </Text>
            <View style={[styles.inputWrapper, styles.notesInputWrapper]}>
              <TextInput
                placeholder="Add notes..."
                placeholderTextColor={Colors.textFaint}
                style={styles.notesInput}
                multiline
                textAlignVertical="top"
                value={notes}
                onChangeText={setNotes}
                maxLength={200}
              />
              <CircledBg color={Colors.indigo} size={32}>
                <NotesIcon width={16} height={16} color={Colors.indigo} />
              </CircledBg>
            </View>
          </View>
          <DateTimePickerModal
            isVisible={showDate}
            mode="date"
            date={date ?? new Date()}
            minimumDate={new Date()}
            onConfirm={handleDateChange}
            onCancel={() => setShowDate(false)}
          />
          <DateTimePickerModal
            is24Hour={is24Hour()}
            isVisible={showTime}
            mode="time"
            minimumDate={new Date()}
            date={time ?? new Date()}
            onConfirm={handleTimeChange}
            onCancel={() => setShowTime(false)}
          />
        </ScrollView>
        <View style={styles.btnContainer}>
          <AppButton
            title="Create Task"
            onPress={() => createTask()}
            disabled={!canCreate}
            loading={createTaskLoading || createRoutineLoading}
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  main: {
    flex: 1,
    paddingHorizontal: 16,
  },
  mainContent: {
    gap: 20,
    paddingTop: 16,
    paddingBottom: 0,
  },
  section: {
    backgroundColor: Colors.surface,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    borderRadius: 10,
  },
  sectionTitle: {
    color: Colors.textMuted,
    textTransform: 'uppercase',
    fontSize: 11,
  },
  sectionTitleOptional: {
    textTransform: 'capitalize',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  categoriesList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  categoryContainer: {
    alignItems: 'center',
  },
  categoryTitle: {
    color: Colors.textSecondary,
    fontSize: 10,
    marginTop: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  dateTimeTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  dateTimeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  dateTimeBtnText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginRight: 8,
  },
  dateTimeContainer: {
    gap: 16,
  },
  dateTimeSection: {
    gap: 12,
  },
  weeksContainer: {
    marginTop: 12,
  },
  repeatBtnsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  repeatBtn: {
    borderRadius: 6,
    backgroundColor: Colors.card,
    padding: 6,
    paddingHorizontal: 14,
  },
  repeatBtnText: {
    fontSize: 12,
  },
  repeatBtnUnselected: {
    backgroundColor: Colors.card,
  },
  repeatBtnTextUnselected: {
    color: Colors.textSecondary,
  },
  notesInput: {
    height: 100,
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  notesInputWrapper: {
    alignItems: 'flex-start',
  },
  btnContainer: {
    padding: 16,
  },
  clearBtnText: {
    color: Colors.yellow,
  },
});
