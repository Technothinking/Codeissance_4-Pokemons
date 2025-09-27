import axios from 'axios';

// Create axios instance for API calls
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' }
});

// Add interceptors (auth tokens, error handling) here as desired

// Named exports of API functions for business, staff, and schedule resources
export const businessAPI = {
  getBusiness: () => apiClient.get('/business'),
  createOrUpdate: (data) => apiClient.post('/business', data),
  // Add more as needed
};

export const staffAPI = {
  getStaffList: (businessId, params) => apiClient.get(`/business/${businessId}/staff`, { params }),
  createStaff: (businessId, data) => apiClient.post(`/business/${businessId}/staff`, data),
  updateStaff: (staffId, data) => apiClient.put(`/staff/${staffId}`, data),
  deleteStaff: (staffId) => apiClient.delete(`/staff/${staffId}`),
  // Add more as needed
};

export const scheduleAPI = {
  getSchedules: (businessId, params) => apiClient.get(`/business/${businessId}/schedule`, { params }),
  createSchedule: (businessId, data) => apiClient.post(`/business/${businessId}/schedule`, data),
  updateSchedule: (scheduleId, data) => apiClient.put(`/schedule/${scheduleId}`, data),
  deleteSchedule: (scheduleId) => apiClient.delete(`/schedule/${scheduleId}`),
  // Add more as needed
};

// Default export for raw axios client if needed
export default apiClient;
