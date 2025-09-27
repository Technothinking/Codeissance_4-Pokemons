import React from 'react';
import { useQuery } from 'react-query';
import { businessAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { data, isLoading, isError, error } = useQuery('businessData', businessAPI.getBusiness);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div className="text-red-600">Error: {error.message}</div>;

  const business = data?.data;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome to {business?.name || 'Your Business'}</h1>
      <p>Use the sidebar to manage your staff, schedules, and business settings.</p>
      {/* Add dashboard cards/statistics here */}
    </div>
  );
};

export default Dashboard;
