import {
  createRoutine,
  CreateRoutinePayload,
  getAllRoutines,
  deleteRoutine,
  getRoutineById,
  editRoutine,
  UpdateRoutinePayload,
  generateTasksFromRoutine,
} from '@/db';
import { useSyncStore } from '@/store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useCreateRoutineMutation = (options?: {
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const createTaskFn = async (payload: CreateRoutinePayload) => {
    await createRoutine(payload);
  };

  const queryClient = useQueryClient();
  const { setTriggerSync } = useSyncStore();

  return useMutation({
    mutationKey: ['create-routine-task'],
    mutationFn: createTaskFn,
    ...options,
    onError: () => {
      options?.onError?.();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-routine-tasks'] });
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

export const useEditRoutineMutation = (options?: {
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const editRoutineFn = async (payload: UpdateRoutinePayload) => {
    await editRoutine(payload);
  };

  const { setTriggerSync } = useSyncStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['edit-routine-task'],
    mutationFn: editRoutineFn,
    ...options,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-routine-tasks'] });
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

export const useGetAllRoutines = () => {
  const getAllTasksFn = async () => {
    return await getAllRoutines();
  };

  return useQuery({
    queryKey: ['get-all-routine-tasks'],
    queryFn: getAllTasksFn,
  });
};

export const useDeleteRoutineMutation = (options?: {
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const deleteRoutineFn = async (taskId: string) => {
    await deleteRoutine(taskId);
  };

  const queryClient = useQueryClient();
  const { setTriggerSync } = useSyncStore();

  return useMutation({
    mutationKey: ['delete-routine-task'],
    mutationFn: deleteRoutineFn,
    ...options,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-routine-tasks'] });
      setTriggerSync();
      options?.onSuccess?.();
    },
  });
};

export const useGetRoutineById = (routineId: string) => {
  const getRoutineByIdFn = async () => {
    return await getRoutineById(routineId);
  };

  return useQuery({
    queryKey: ['get-routine-by-id'],
    queryFn: getRoutineByIdFn,
  });
};

export const useGenerateTasksFromRoutine = (options?: {
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const generateTasks = async () => {
    await generateTasksFromRoutine();
  };

  const queryClient = useQueryClient();
  const { setTriggerSync } = useSyncStore();

  return useMutation({
    mutationKey: ['generate-tasks-from-routine'],
    mutationFn: generateTasks,
    ...options,
    onSuccess: () => {
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
