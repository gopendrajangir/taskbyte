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
import { RoutineWeeks } from './routine-weeks.component';
import { Routine } from '@/db/models';
import { AppStackParamsList } from '@/navigation/navigation.types';
import { useNavigation, NavigationProp } from '@react-navigation/native';

interface Props {
  data: Routine;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const RoutineRow: React.FC<Props> = ({ data, color, style }) => {
  const { id, title, dueAt, hasTime, category, weeks } = data;

  const now = moment(dueAt);

  const time = now.format('hh:mm');
  const suffix = now.format('A');

  const navigation = useNavigation<NavigationProp<AppStackParamsList>>();

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => navigation.navigate('RoutineDetails', { routineId: id })}
    >
      <View style={styles.main}>
        <CategoryIcon
          category={category as CategoryType}
          size={36}
          iconSize={20}
        />
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.timeWeekContainer}>
            <Text style={styles.timeText} numberOfLines={1}>
              {hasTime ? `${time} ${!is24Hour() ? suffix : ''}` : `Anytime`}
            </Text>
            <RoutineWeeks
              selectedWeeks={JSON.parse(weeks)}
              color={color}
              style={styles.routineWeeks}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  main: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    flex: 1,
    padding: 10,
  },
  timeText: {
    color: Colors.textSecondary,
    marginRight: 'auto',
    fontSize: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: Colors.textPrimary,
    marginRight: 'auto',
    fontSize: 14,
  },
  timeWeekContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routineWeeks: {
    padding: 2,
  },
});
