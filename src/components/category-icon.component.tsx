import React from 'react';
import { Colors } from '@/config';
import { BookIcon, MoneyIcon, UserIcon, WorkIcon, YogaIcon } from '@/assets';
import { CircledBg } from './circled-bg.component';

export type CategoryType = 'work' | 'study' | 'health' | 'personal' | 'finance';

interface Props {
  category: CategoryType;
  selected?: boolean;
  size?: number;
  iconSize?: number;
}

export const categoryData = {
  work: {
    color: Colors.cyan,
    Icon: WorkIcon,
    title: 'Work',
  },
  study: {
    color: Colors.indigo,
    Icon: BookIcon,
    title: 'Study',
  },
  health: {
    color: Colors.green,
    Icon: YogaIcon,
    title: 'Health',
  },
  personal: {
    color: Colors.yellow,
    Icon: UserIcon,
    title: 'Personal',
  },
  finance: {
    color: Colors.red,
    Icon: MoneyIcon,
    title: 'Finance',
  },
};

export const CategoryIcon: React.FC<Props> = ({
  category,
  selected,
  size = 44,
  iconSize = 20,
}) => {
  const { color, Icon } = categoryData[category];

  return (
    <CircledBg color={color} size={size} selected={selected}>
      <Icon width={iconSize} height={iconSize} color={color} />
    </CircledBg>
  );
};
