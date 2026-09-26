import { Routine, RoutineData, Task, TaskData } from '@/db/models';
import moment, { Moment } from 'moment';

export type TaskStatus = 'pending' | 'finished' | 'overdue';

export type TaskType = 'unscheduled' | 'flexible' | 'scheduled';

export const getTaskStatus = (
  dueAt?: number | null,
  hasTime?: boolean,
  done?: boolean,
): TaskStatus => {
  if (done) {
    return 'finished';
  }

  if (dueAt) {
    const dueDate = new Date(dueAt);

    let isOverdue = false;

    if (hasTime) {
      // Compare full datetime
      isOverdue = dueDate.getTime() < Date.now();
    } else {
      // Compare date only
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dueDay = new Date(dueDate);
      dueDay.setHours(0, 0, 0, 0);

      isOverdue = dueDay.getTime() < today.getTime();
    }

    if (isOverdue) {
      return 'overdue';
    }
  }

  return 'pending';
};

export const getTaskType = (dueAt?: number | null, hasTime?: boolean) => {
  if (!dueAt && !hasTime) {
    return 'unscheduled';
  }
  if (!hasTime) {
    return 'flexible';
  }
  return 'scheduled';
};

export const convertToTaskDTO = (task: Task): TaskData => {
  return {
    id: task.id,
    title: task.title,
    notes: task.notes,
    category: task.category,
    dueAt: task.dueAt,
    hasTime: task.hasTime,
    done: task.done,
    deleted: task.deleted,
    isRoutine: task.isRoutine,
    routineId: task.routineId,
    createdAt: task.createdAt.getTime(),
    updatedAt: task.updatedAt.getTime(),
  };
};

export const convertToRoutineDTO = (task: Routine): RoutineData => {
  return {
    id: task.id,
    title: task.title,
    notes: task.notes,
    category: task.category,
    dueAt: task.dueAt,
    hasTime: task.hasTime,
    weeks: task.weeks,
    deleted: task.deleted,
    lastGeneratedAt: task.lastGeneratedAt?.getTime() ?? null,
    createdAt: task.createdAt.getTime(),
    updatedAt: task.updatedAt.getTime(),
  };
};

/**
 * Format UI date label:
 * Today, May 25, 2026
 * Yesterday, May 24, 2026
 * Monday, May 20, 2026
 * May 10, 2026
 */
export const formatTaskGroupDate = (date: Moment) => {
  const d = moment(date);
  const today = moment().startOf('day');
  const diff = d.clone().startOf('day').diff(today, 'days');

  let prefix = '';

  if (diff === 0) {
    prefix = 'Today';
  } else if (diff === -1) {
    prefix = 'Yesterday';
  } else if (diff === 1) {
    prefix = 'Tomorrow';
  } else if (d.isSame(today, 'week')) {
    prefix = d.format('dddd'); // Monday, Tuesday...
  }

  const datePart = d.format('MMM DD, YYYY');

  return prefix ? `${prefix}, ${datePart}` : datePart;
};

export type ScheduledSection = {
  dateKey: string;
  title: string;
  timeBased: Task[];
  flexible: Task[];
};

export type GroupedTasks = {
  scheduled: ScheduledSection[];
  unscheduled: Task[];
  completed: number;
};

export const groupTasksByDateInSections = (tasks: Task[]): GroupedTasks => {
  const scheduledMap: Record<string, { timeBased: Task[]; flexible: Task[] }> =
    {};

  const unscheduled: Task[] = [];

  let completed = 0;

  tasks.forEach(task => {
    if (task.done) {
      completed++;
    }

    const { dueAt, hasTime } = task;

    // 1. Unscheduled tasks
    if (!dueAt) {
      unscheduled.push(task);
      return;
    }

    // 2. Normalize date key (midnight safe grouping)
    const dateKey = moment(dueAt).format('YYYY-MM-DD');

    if (!scheduledMap[dateKey]) {
      scheduledMap[dateKey] = {
        timeBased: [],
        flexible: [],
      };
    }

    // 3. Split by time type
    if (hasTime) {
      scheduledMap[dateKey].timeBased.push(task);
    } else {
      scheduledMap[dateKey].flexible.push(task);
    }
  });

  // 4. Convert map → sorted array (latest first)
  const scheduled: ScheduledSection[] = Object.keys(scheduledMap)
    .sort((a, b) => (a < b ? 1 : -1)) // descending date order
    .map(dateKey => {
      const group = scheduledMap[dateKey];
      const date = moment(dateKey, 'YYYY-MM-DD');

      return {
        dateKey,
        title: formatTaskGroupDate(date),
        timeBased: group.timeBased,
        flexible: group.flexible,
      };
    });

  return {
    scheduled,
    unscheduled,
    completed,
  };
};
