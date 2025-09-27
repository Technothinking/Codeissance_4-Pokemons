import React from 'react';
import { useQuery } from 'react-query';
import { scheduleAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const ScheduleDashboard = () => {
  const { data, isLoading, isError, error } = useQuery('schedules', scheduleAPI.getSchedules);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div className="text-red-600">Error: {error.message}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Schedules</h1>
        <Link to="/schedule-dashboard/create">
          <Button>Create Schedule</Button>
        </Link>
      </div>
      <ul className="divide-y divide-gray-200">
        {data?.data?.map((schedule) => (
          <li key={schedule._id} className="py-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">{schedule.title}</p>
              <p className="text-sm text-gray-600">
                {new Date(schedule.weekStartDate).toLocaleDateString()} - {new Date(schedule.weekEndDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Link to={`/schedule-dashboard/view/${schedule._id}`} className="text-indigo-600 hover:text-indigo-400 mr-4">
                View
              </Link>
              {schedule.status !== 'published' && (
                <Link to={`/schedule-dashboard/edit/${schedule._id}`} className="text-indigo-600 hover:text-indigo-400">
                  Edit
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ScheduleDashboard;
 