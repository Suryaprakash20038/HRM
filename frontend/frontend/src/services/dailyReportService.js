
import api from './api';

export const createDailyReport = (formData) => {
    return api.post('/daily-reports', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const getMyReports = () => {
    return api.get('/daily-reports/my-reports');
};

export const getAllReports = (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/daily-reports?${params}`);
};

// NEW: Get Team Reports (for TL/Manager)
export const getTeamReports = (days = 7, search = '') => {
    return api.get(`/daily-reports/team-reports?days=${days}&search=${search}`);
};
