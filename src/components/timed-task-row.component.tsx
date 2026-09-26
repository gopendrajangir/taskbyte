import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React from 'react';
import moment from 'moment';
import { Colors } from '@/config';
import { is24Hour } from '@/utils';
import { CategoryIcon, CategoryType } from './category-icon.component';
import { TaskStatus } from './task-status.component';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { AppStackParamsList } from '@/navigation/navigation.types';
import { Task } from '@/db/models';

interface Props {
  data: Task;
  style?: StyleProp<ViewStyle>;
}

export const TimedTaskRow: React.FC<Props> = ({ data, style }) => {
  const { id, title, dueAt, hasTime, category, done } = data;

  const now = moment(dueAt);

  const time = now.format('hh:mm');
  const suffix = now.format('A');

  const navigation = useNavigation<NavigationProp<AppStackParamsList>>();

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => {
        navigation.navigate('TaskDetails', { taskId: id });
      }}
    >
      <View style={styles.main}>
        {hasTime && (
          <>
            <View style={styles.timeTag}>
              <Text style={styles.timeText}>{is24Hour() ? 'Time' : time}</Text>
              <Text style={styles.timeText}>{is24Hour() ? time : suffix}</Text>
            </View>
            <View style={styles.vr} />
          </>
        )}
        <CategoryIcon
          category={category as CategoryType}
          size={36}
          iconSize={20}
        />
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.category} numberOfLines={1}>
            {category}
          </Text>
        </View>
        <TaskStatus dueAt={dueAt} hasTime={hasTime} done={done} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    overflow: 'hidden',
  },
  main: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    backgroundColor: Colors.surface,
    flex: 1,
    padding: 10,
    paddingHorizontal: 12,
  },
  vr: {
    width: 0.8,
    alignSelf: 'stretch',
    backgroundColor: Colors.border,
  },
  leftBar: {
    width: 4,
    alignSelf: 'stretch',
    top: 0,
    left: 0,
  },
  leftBarFlexible: {
    backgroundColor: Colors.yellowText,
  },
  leftBarBacklog: {
    backgroundColor: Colors.textMuted,
  },
  timeTag: {
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 4,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: Colors.textSecondary,
  },
  titleContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: Colors.textPrimary,
    marginRight: 'auto',
    fontSize: 12,
  },
  category: {
    color: Colors.textSecondary,
    marginRight: 'auto',
    fontSize: 10,
    textTransform: 'capitalize',
  },
});
