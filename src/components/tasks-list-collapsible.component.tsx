import React, { useState } from 'react';
import Collapsible from 'react-native-collapsible';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { ChevronDownIcon, ChevronUpIcon } from '@/assets';
import { Colors } from '@/config';
import { TimedTaskRow } from './timed-task-row.component';
import { ScheduledSection } from '@/utils';
import { NoData } from './no-data.component';

interface Props {
  data: ScheduledSection;
}

export const TasksListCollapsible: React.FC<Props> = ({ data }) => {
  const { timeBased, flexible, title } = data;

  const [collapsed, setCollapsed] = useState(true);

  let total = timeBased.length + flexible.length;
  let completed =
    timeBased.filter(data => data.done).length +
    flexible.filter(data => data.done).length;

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.header}
        onPress={() => setCollapsed(v => !v)}
        hitSlop={20}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.completedText}>
          {`${completed}/${total}`} Completed
        </Text>
        {collapsed ? (
          <ChevronDownIcon
            width={16}
            height={16}
            color={Colors.textSecondary}
          />
        ) : (
          <ChevronUpIcon width={16} height={16} color={Colors.textSecondary} />
        )}
      </Pressable>
      <Collapsible collapsed={collapsed} style={styles.collapsible}>
        <Text style={[styles.heading, styles.headingTimeBased]}>
          Time Based
        </Text>
        <View style={styles.tasksList}>
          {timeBased.length === 0 ? (
            <NoData message={'No time based tasks'} />
          ) : (
            timeBased.map(data => {
              return (
                <TimedTaskRow key={data.id} data={data} style={styles.task} />
              );
            })
          )}
        </View>
        <Text style={[styles.heading, styles.headingFlexible]}>Flexible</Text>
        <View style={styles.tasksList}>
          {flexible.length === 0 ? (
            <NoData message={'No flexible tasks'} style={styles.noData} />
          ) : (
            flexible.map(data => {
              return (
                <TimedTaskRow key={data.id} data={data} style={styles.task} />
              );
            })
          )}
        </View>
      </Collapsible>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingVertical: 14,
  },
  title: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  completedText: {
    color: Colors.textSecondary,
    marginLeft: 'auto',
    marginRight: 12,
    fontSize: 12,
  },
  collapsible: {
    padding: 12,
    paddingTop: 0,
  },
  heading: {
    textTransform: 'capitalize',
    marginVertical: 8,
    fontSize: 12,
  },
  headingTimeBased: {
    color: Colors.cyan,
    marginTop: 4,
  },
  headingFlexible: {
    color: Colors.indigo,
  },
  task: {
    borderRadius: 0,
    borderWidth: 0,
  },
  tasksList: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  noData: {
    marginVertical: 16,
    marginTop: 8,
  },
});
