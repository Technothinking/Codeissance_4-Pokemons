import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-indigo-700 text-white px-6 py-4 flex justify-between items-center shadow">
        <div className="font-bold text-lg">WorkforcePro</div>
        <nav className="space-x-4">
          {user?.role === 'business_owner' && (
            <>
              <Link to="/" className="hover:underline">Dashboard</Link>
              <Link to="/business-setup" className="hover:underline">Business Setup</Link>
              <Link to="/staff-management" className="hover:underline">Staff</Link>
              <Link to="/schedule-dashboard" className="hover:underline">Schedules</Link>
            </>
          )}
          {user?.role === 'staff' && (
            <Link to="/staff-portal" className="hover:underline">Staff Portal</Link>
          )}
          <button onClick={handleLogout} className="ml-4 underline">Logout</button>
        </nav>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
      <footer className="bg-gray-200 text-center py-2 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} WorkforcePro
      </footer>
    </div>
  );
};

export default Layout;
