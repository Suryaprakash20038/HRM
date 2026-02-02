import api from './api';

const dailyReportService = {
    createReport: async (reportData) => {
        const response = await api.post('/daily-reports', reportData);
        return response.data.data.report;
    },

    getMyReports: async () => {
        const response = await api.get('/daily-reports/my-reports');
        return response.data.data.reports;
    },

    getAllReports: async (filters = {}) => {
        const query = new URLSearchParams(filters).toString();
        const response = await api.get(`/daily-reports?${query}`);
        return response.data.data.reports;
    }
};

export default dailyReportService;
