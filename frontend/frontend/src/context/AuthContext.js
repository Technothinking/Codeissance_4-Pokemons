import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage if available
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const [isLoading, setIsLoading] = useState(false);

  // Keep authentication status synced with user presence
  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  // Login API call
  const login = async ({ email, password }) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, refreshToken, user: userData } = response.data.data;

      // Save tokens and user info to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  // Logout clears all auth info
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Registration API call
  const register = async (formData) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/register', formData);
      const { token, refreshToken, user: userData } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  // Update user business details in context and localStorage
  const updateBusiness = (newBusinessData) => {
    setUser((prevUser) => {
      const updatedUser = { ...prevUser, business: newBusinessData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        register,
        updateBusiness,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
