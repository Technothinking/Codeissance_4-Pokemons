import { useQuery, useMutation, useQueryClient } from 'react-query';
import { staffAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useStaffList = (businessId, pagination = { page: 1, limit: 20 }) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery(
    ['staffList', businessId, pagination],
    () => staffAPI.getStaffList(businessId, pagination),
    {
      keepPreviousData: true,
      staleTime: 3 * 60 * 1000, // Cache for 3 minutes
    }
  );

  const createStaffMutation = useMutation(staffAPI.createStaff, {
    onSuccess: () => {
      queryClient.invalidateQueries(['staffList', businessId]);
      toast.success('Staff member created');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create staff');
    },
  });

  const updateStaffMutation = useMutation(staffAPI.updateStaff, {
    onSuccess: () => {
      queryClient.invalidateQueries(['staffList', businessId]);
      toast.success('Staff updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update staff');
    },
  });

  const deleteStaffMutation = useMutation(staffAPI.deleteStaff, {
    onSuccess: () => {
      queryClient.invalidateQueries(['staffList', businessId]);
      toast.success('Staff member deleted');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete staff');
    },
  });

  return {
    staffList: data?.data || [],
    isLoading,
    isError,
    error,
    createStaff: createStaffMutation.mutateAsync,
    updateStaff: updateStaffMutation.mutateAsync,
    deleteStaff: deleteStaffMutation.mutateAsync,
  };
};
