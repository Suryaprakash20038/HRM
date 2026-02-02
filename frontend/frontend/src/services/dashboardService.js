import api from './api';

const dashboardService = {
    getStats: async () => {
        const response = await api.get('/dashboard/stats');
        return response.data.data.stats;
    },

    getRecentActivities: async () => {
        const response = await api.get('/dashboard/activities');
        return response.data.data.activities;
    }
};

export default dashboardService;
