import api from './api';

const timeLogService = {
    checkIn: async (data) => {
        const response = await api.post('/time-logs/check-in', data);
        return response.data;
    },
    checkOut: async (data) => {
        const response = await api.post('/time-logs/check-out', data);
        return response.data;
    },
    getMyLogs: async (params) => {
        const response = await api.get('/time-logs/my-logs', { params });
        return response.data;
    },
    getAllLogs: async (params) => {
        const response = await api.get('/time-logs/all-logs', { params });
        return response.data;
    },
    requestRegularisation: async (data) => {
        const response = await api.post('/time-logs/regularise', data);
        return response.data;
    },
    getRegularisationRequests: async () => {
        const response = await api.get('/time-logs/regularise/requests');
        return response.data;
    },
    getSummary: async (params) => {
        const response = await api.get('/time-logs/summary', { params });
        return response.data;
    }
};

export default timeLogService;
