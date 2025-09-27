import React from 'react';
import { useQuery } from 'react-query';
import { scheduleAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const StaffPortal = () => {
  const { data, isLoading, isError, error } = useQuery('mySchedules', scheduleAPI.getStaffSchedules);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div className="text-red-600">Error: {error.message}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Schedules</h1>
      {data?.data?.length === 0 ? (
        <p>No schedules available.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {data.data.map((schedule) => (
            <li key={schedule._id} className="py-3">
              <p className="font-semibold">{schedule.title}</p>
              <p className="text-sm text-gray-600">
                {new Date(schedule.weekStartDate).toLocaleDateString()} - {new Date(schedule.weekEndDate).toLocaleDateString()}
              </p>
              {/* Optionally list shifts */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StaffPortal;
