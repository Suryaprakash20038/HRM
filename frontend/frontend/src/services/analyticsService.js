import api from './api';

const BASE_URL = '/analytics';

export const getWorkforceInsights = (params) => api.get(`${BASE_URL}/workforce`, { params });
export const getAttendanceAnalytics = (params) => api.get(`${BASE_URL}/attendance`, { params });
export const getLeaveAnalytics = (params) => api.get(`${BASE_URL}/leave`, { params });
export const getPerformanceAnalytics = (params) => api.get(`${BASE_URL}/performance`, { params });
export const getPayrollAnalytics = (params) => api.get(`${BASE_URL}/payroll`, { params });
export const getTicketsAnalytics = (params) => api.get(`${BASE_URL}/tickets`, { params });
export const getRecruitmentAnalytics = (params) => api.get(`${BASE_URL}/recruitment`, { params });
export const getAttritionAnalytics = (params) => api.get(`${BASE_URL}/attrition`, { params });
