import { useQuery, useMutation, useQueryClient } from 'react-query';
import { scheduleAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useSchedules = (businessId, pagination = { page: 1, limit: 10 }) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery(
    ['schedules', businessId, pagination],
    () => scheduleAPI.getSchedules(businessId, pagination),
    {
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    }
  );

  const createScheduleMutation = useMutation(scheduleAPI.createSchedule, {
    onSuccess: () => {
      queryClient.invalidateQueries(['schedules', businessId]);
      toast.success('Schedule created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create schedule');
    },
  });

  const updateScheduleMutation = useMutation(scheduleAPI.updateSchedule, {
    onSuccess: () => {
      queryClient.invalidateQueries(['schedules', businessId]);
      toast.success('Schedule updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update schedule');
    },
  });

  const deleteScheduleMutation = useMutation(scheduleAPI.deleteSchedule, {
    onSuccess: () => {
      queryClient.invalidateQueries(['schedules', businessId]);
      toast.success('Schedule deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete schedule');
    },
  });

  return {
    schedules: data?.data || [],
    isLoading,
    isError,
    error,
    createSchedule: createScheduleMutation.mutateAsync,
    updateSchedule: updateScheduleMutation.mutateAsync,
    deleteSchedule: deleteScheduleMutation.mutateAsync,
  };
};
