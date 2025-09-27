import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BusinessSetup from './pages/BusinessSetup';
import StaffManagement from './pages/StaffManagement';
import ScheduleDashboard from './pages/ScheduleDashboard';
import StaffPortal from './pages/StaffPortal';

// Styles
import './styles/index.css';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

// Protected Route component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

// Business Owner Route
const BusinessOwnerRoute = ({ children }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return user?.role === 'business_owner' ? children : <Navigate to="/staff-portal" />;
};

// Staff Route (for 'staff' role only)
const StaffRoute = ({ children }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return user?.role === 'staff' ? children : <Navigate to="/" />;
};

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <Router>
                    <div className="App">
                        <Toaster position="top-right" />
                        <Routes>
                            {/* Public routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Protected routes under main layout */}
                            <Route
                                path="/"
                                element={
                                    <ProtectedRoute>
                                        <Layout />
                                    </ProtectedRoute>
                                }
                            >
                                {/* Business Owner: dashboard and management */}
                                <Route
                                    index
                                    element={
                                        <BusinessOwnerRoute>
                                            <Dashboard />
                                        </BusinessOwnerRoute>
                                    }
                                />
                                <Route
                                    path="business-setup"
                                    element={
                                        <BusinessOwnerRoute>
                                            <BusinessSetup />
                                        </BusinessOwnerRoute>
                                    }
                                />
                                <Route
                                    path="staff-management"
                                    element={
                                        <BusinessOwnerRoute>
                                            <StaffManagement />
                                        </BusinessOwnerRoute>
                                    }
                                />
                                <Route
                                    path="schedule-dashboard"
                                    element={
                                        <BusinessOwnerRoute>
                                            <ScheduleDashboard />
                                        </BusinessOwnerRoute>
                                    }
                                />

                                {/* Staff Portal */}
                                <Route
                                    path="staff-portal/*"
                                    element={
                                        <StaffRoute>
                                            <StaffPortal />
                                        </StaffRoute>
                                    }
                                />
                            </Route>

                            {/* Fallback: redirect to dashboard or login */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </div>
                </Router>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
