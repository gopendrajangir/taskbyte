import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

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
  ChevronRightIcon,
  MinusCircleIcon,
  NotesIcon,
  PencilIcon,
  TimeIcon,
} from '@/assets';
import { is24Hour } from '@/utils';
import { useEditRoutineMutation, useWeeksSelector } from '@/hooks';
import { useAppToast } from '@/context';
import { AppStackParamsList } from '@/navigation/navigation.types';

const categories: CategoryType[] = [
  'work',
  'study',
  'health',
  'personal',
  'finance',
];

type Props = NativeStackScreenProps<AppStackParamsList, 'EditRoutine'>;

export const EditRoutineScreen: React.FC<Props> = ({ route }) => {
  const { data: defaultRoutine } = route.params;

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [time, setTime] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryType>('work');

  const [showTime, setShowTime] = useState(false);

  const { showToast } = useAppToast();
  const navigation = useNavigation<NavigationProp<AppStackParamsList>>();

  const { weeks, selectWeek } = useWeeksSelector(
    JSON.parse(defaultRoutine.weeks),
  );

  useEffect(() => {
    const { title, notes, dueAt, hasTime, category } = defaultRoutine;

    setTitle(title);
    setNotes(notes ?? '');
    setSelectedCategory(category);

    if (dueAt) {
      if (hasTime) {
        setTime(new Date(dueAt));
      }
    }
  }, [defaultRoutine]);

  const { mutate: editRoutineMutate, isPending: editRoutineLoading } =
    useEditRoutineMutation({
      onSuccess: () => {
        showToast({
          type: 'success',
          message: 'Routine updated successfully.',
        });
        navigation.goBack();
      },
      onError: () => {
        showToast({
          type: 'danger',
          message: 'Some error occured',
        });
      },
    });

  const saveRoutine = () => {
    let dueAt = time ? moment(time).valueOf() : undefined;

    const now = moment();

    // Convert Moment's day() (0=Sunday) to 0=Monday
    const todayIndex = (now.day() + 6) % 7;

    const isSameWeekday = weeks.includes(todayIndex);

    if (isSameWeekday && time) {
      dueAt = moment()
        .set({
          hour: moment(time).hour(),
          minute: moment(time).minute(),
          second: moment(time).second(),
          millisecond: 0,
        })
        .valueOf();
    }

    const payload = {
      id: defaultRoutine.id,
      title,
      notes,
      category: selectedCategory,
      dueAt,
      hasTime: !!time,
      weeks,
    };

    editRoutineMutate({
      ...payload,
      createInstance: isSameWeekday && (!time || moment(time).isAfter(now)),
    });
  };

  const handleTimeChange = (selectedTime: Date) => {
    setShowTime(false);
    if (selectedTime) setTime(selectedTime);
  };

  const canSave = useMemo(() => {
    if (title.length === 0) return false;

    const weeksChanged =
      JSON.stringify(JSON.parse(defaultRoutine.weeks)) !==
      JSON.stringify(weeks);

    return (
      defaultRoutine.title !== title ||
      defaultRoutine.notes !== notes ||
      defaultRoutine.category !== selectedCategory ||
      weeksChanged ||
      (time && !defaultRoutine.hasTime) ||
      (!time && defaultRoutine.hasTime) ||
      (defaultRoutine.hasTime && time
        ? moment(defaultRoutine.dueAt).format('HH:mm:ss') !==
          moment(time).format('HH:mm:ss')
        : false)
    );
  }, [title, notes, selectedCategory, time, weeks, defaultRoutine]);

  return (
    <ScreenSafeAreaView>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior="padding"
      >
        <AppHeader title="Edit Routine" />

        <ScrollView
          style={styles.main}
          contentContainerStyle={styles.mainContent}
        >
          {/* Title */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Routine Title</Text>
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

          {/* Category */}
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
                    onPress={() => setSelectedCategory(category)}
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

          {/* Time */}
          <View style={styles.dateTimeContainer}>
            <Text style={styles.sectionTitle}>
              Time <Text style={styles.sectionTitleOptional}>(Optional)</Text>
            </Text>

            <View style={[styles.section, styles.dateTimeSection]}>
              <View style={styles.dateTimeRow}>
                <TimeIcon width={16} height={16} color={Colors.cyan} />
                <Text style={styles.dateTimeTitle}>Time</Text>

                <TouchableOpacity
                  style={styles.dateTimeBtn}
                  onPress={() => setShowTime(true)}
                >
                  <Text style={styles.dateTimeBtnText}>
                    {time
                      ? moment(time).format(is24Hour() ? 'HH:mm' : 'hh:mm A')
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
                      width={16}
                      height={16}
                      color={Colors.red}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Repeat */}
          <View>
            <Text style={styles.sectionTitle}>Repeat</Text>
            <WeeksSelector
              style={styles.weeksContainer}
              selectedWeeks={weeks}
              selectWeek={selectWeek}
              canBeEmpty={false}
            />
          </View>

          {/* Notes */}
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
              <CircledBg color={Colors.indigo}>
                <NotesIcon width={16} height={16} color={Colors.indigo} />
              </CircledBg>
            </View>
          </View>

          <DateTimePickerModal
            isVisible={showTime}
            is24Hour={is24Hour()}
            mode="time"
            date={time ?? new Date()}
            minimumDate={new Date()}
            onConfirm={handleTimeChange}
            onCancel={() => setShowTime(false)}
          />
        </ScrollView>

        <View style={styles.btnContainer}>
          <AppButton
            title="Save Routine"
            onPress={saveRoutine}
            disabled={!canSave}
            loading={editRoutineLoading}
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
    gap: 16,
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
    gap: 12,
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
