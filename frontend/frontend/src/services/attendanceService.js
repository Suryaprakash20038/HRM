import api from './api';

const attendanceService = {
    getAttendance: async (params) => {
        const response = await api.get('/attendance', { params });
        return response.data.data;
    },

    checkIn: async (data) => {
        const response = await api.post('/attendance/check-in', data);
        return response.data.data;
    },

    checkOut: async (data) => {
        const response = await api.post('/attendance/check-out', data);
        return response.data.data;
    },

    markAttendance: async (data) => {
        const response = await api.post('/attendance/mark', data);
        return response.data.data;
    },

    getMonthlySummary: async (month, year) => {
        const response = await api.get('/attendance/summary', { params: { month, year } });
        return response.data.data;
    },

    getAttendanceStats: async (employeeId, month, year) => {
        const response = await api.get(`/attendance/stats/${employeeId}`, { params: { month, year } });
        return response.data.data;
    }
};

export default attendanceService;
