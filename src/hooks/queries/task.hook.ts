import {
  createTask,
  CreateTaskPayload,
  getAllTasks,
  deleteTask,
  markTaskAsDone,
  getTasksForDate,
  getUnscheduledTasks,
  getTaskById,
  editTask,
  UpdateTaskPayload,
} from '@/db';
import { useSyncStore } from '@/store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useCreateTaskMutation = (options?: {
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const createTaskFn = async (payload: CreateTaskPayload) => {
    await createTask(payload);
  };

  const queryClient = useQueryClient();
  const { setTriggerSync } = useSyncStore();

  return useMutation({
    mutationKey: ['create-task'],
    mutationFn: createTaskFn,
    ...options,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-task-by-id'] });
      queryClient.invalidateQueries({ queryKey: ['get-tasks-for-date'] });
      queryClient.invalidateQueries({
        queryKey: ['get-unscheduled-tasks'],
      });
      queryClient.invalidateQueries({ queryKey: ['get-all-tasks'] });
      setTriggerSync();
      options?.onSuccess?.();
    },
  });
};

export const useDeleteTaskMutation = (options?: {
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const deleteTaskFn = async (taskId: string) => {
    await deleteTask(taskId);
  };

  const queryClient = useQueryClient();
  const { setTriggerSync } = useSyncStore();

  return useMutation({
    mutationKey: ['delete-task'],
    mutationFn: deleteTaskFn,
    ...options,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-task-by-id'] });
      queryClient.invalidateQueries({ queryKey: ['get-tasks-for-date'] });
      queryClient.invalidateQueries({
        queryKey: ['get-unscheduled-tasks'],
      });
      queryClient.invalidateQueries({ queryKey: ['get-all-tasks'] });
      setTriggerSync();
      options?.onSuccess?.();
    },
  });
};

export const useMarkTaskAsDoneMutation = (options?: {
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const markTaskAsDoneFn = async (taskId: string) => {
    await markTaskAsDone(taskId);
  };

  const queryClient = useQueryClient();
  const { setTriggerSync } = useSyncStore();

  return useMutation({
    mutationKey: ['mark-task-as-done'],
    mutationFn: markTaskAsDoneFn,
    ...options,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-task-by-id'] });
      queryClient.invalidateQueries({ queryKey: ['get-tasks-for-date'] });
      queryClient.invalidateQueries({
        queryKey: ['get-unscheduled-tasks'],
      });
      queryClient.invalidateQueries({ queryKey: ['get-all-tasks'] });
      setTriggerSync();
      options?.onSuccess?.();
    },
  });
};

export const useEditTaskMutation = (options?: {
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const editTaskFn = async (taskData: UpdateTaskPayload) => {
    await editTask(taskData);
  };

  const queryClient = useQueryClient();
  const { setTriggerSync } = useSyncStore();

  return useMutation({
    mutationKey: ['edit-task'],
    mutationFn: editTaskFn,
    ...options,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-task-by-id'] });
      queryClient.invalidateQueries({ queryKey: ['get-tasks-for-date'] });
      queryClient.invalidateQueries({
        queryKey: ['get-unscheduled-tasks'],
      });
      queryClient.invalidateQueries({ queryKey: ['get-all-tasks'] });
      setTriggerSync();
      options?.onSuccess?.();
    },
  });
};

export const useGetTasksForDate = (date: Date) => {
  const getTasksForDateFn = async () => {
    return await getTasksForDate(date);
  };

  return useQuery({
    queryKey: ['get-tasks-for-date'],
    queryFn: getTasksForDateFn,
  });
};

export const useGetTaskById = (taskId: string) => {
  const getTasksForDateFn = async () => {
    return await getTaskById(taskId);
  };

  return useQuery({
    queryKey: ['get-task-by-id'],
    queryFn: getTasksForDateFn,
  });
};

export const useGetUnscheduledTasks = () => {
  const getUnscheduledTasksFn = async () => {
    return await getUnscheduledTasks();
  };

  return useQuery({
    queryKey: ['get-unscheduled-tasks'],
    queryFn: getUnscheduledTasksFn,
  });
};

export const useGetAllTasks = () => {
  const getAllTasksFn = async () => {
    return await getAllTasks();
  };

  return useQuery({
    queryKey: ['get-all-tasks'],
    queryFn: getAllTasksFn,
  });
};
