import moment from 'moment';
import * as RNLocalize from 'react-native-localize';

export const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good Morning';
  }

  if (hour < 18) {
    return 'Good Afternoon';
  }

  return 'Good Evening';
};

export const getTimeStatus = (timestamp: number) => {
  const target = moment(timestamp);
  const now = moment();

  if (target.isBefore(now)) {
    return 'overdue';
  }

  return 'upcoming';
};

export const is24Hour = () => {
  return RNLocalize.uses24HourClock();
};
