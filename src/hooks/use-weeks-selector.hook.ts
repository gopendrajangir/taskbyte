import { useState } from 'react';

export const weeksMap: {
  [key: string]: { title: string; short: string; code: string };
} = {
  0: {
    title: 'Monday',
    short: 'Mon',
    code: 'M',
  },
  1: {
    title: 'Tuesday',
    short: 'Tue',
    code: 'T',
  },
  2: {
    title: 'Wednesday',
    short: 'Wed',
    code: 'W',
  },
  3: {
    title: 'Thursday',
    short: 'Thu',
    code: 'T',
  },
  4: {
    title: 'Friday',
    short: 'Fri',
    code: 'F',
  },
  5: {
    title: 'Saturday',
    short: 'Sat',
    code: 'S',
  },
  6: {
    title: 'Sunday',
    short: 'Sun',
    code: 'S',
  },
};

export const weeksList = Array(7)
  .fill(0)
  .map((_, i) => weeksMap[i]);

export const useWeeksSelector = (defaultWeeks: number[]) => {
  const [weeks, setWeeks] = useState<number[]>(defaultWeeks);

  const selectWeek = (week: number) => {
    if (weeks.includes(week)) {
      setWeeks(weeks => weeks.filter(w => w !== week));
    } else {
      setWeeks([...weeks, week]);
    }
  };

  return {
    selectWeek,
    weeks,
  };
};
