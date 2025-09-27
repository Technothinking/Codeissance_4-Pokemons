import React from 'react';
import { useQuery } from 'react-query';
import { staffAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import { Link } from 'react-router-dom';

const StaffManagement = () => {
  const { data, isLoading, isError, error } = useQuery('staffList', staffAPI.getStaffList);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div className="text-red-600">Error: {error.message}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff Members</h1>
        <Link to="/staff-management/add">
          <Button>Add Staff Member</Button>
        </Link>
      </div>
      <ul className="divide-y divide-gray-200">
        {data?.data?.map((staff) => (
          <li key={staff._id} className="py-4 flex justify-between">
            <div>
              <p className="font-semibold">{staff.name}</p>
              <p className="text-sm text-gray-600">Roles: {staff.roles.join(', ')}</p>
            </div>
            <div>
              <Link to={`/staff-management/edit/${staff._id}`} className="text-indigo-600 hover:text-indigo-400">
                Edit
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StaffManagement;
