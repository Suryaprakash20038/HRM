import api from './api';

const shiftService = {
    getAllShifts: async () => {
        const response = await api.get('/shifts');
        return response.data.data;
    },

    createShift: async (shiftData) => {
        const response = await api.post('/shifts', shiftData);
        return response.data.data.shift;
    },

    updateShift: async (id, shiftData) => {
        const response = await api.put(`/shifts/${id}`, shiftData);
        return response.data.data.shift;
    },

    deleteShift: async (id) => {
        const response = await api.delete(`/shifts/${id}`);
        return response.data;
    },

    // Roster / Schedule
    getSchedule: async (params) => {
        // params: { startDate, endDate, department, employeeId }
        const response = await api.get('/shifts/schedule', { params });
        return response.data.data.schedules;
    },

    assignSchedule: async (data) => {
        // data: { employeeIds, shiftId, startDate, endDate, startTime, endTime, type, isManual }
        const response = await api.post('/shifts/schedule', data);
        return response.data;
    },

    deleteSchedule: async (id) => {
        const response = await api.delete(`/shifts/schedule/${id}`);
        return response.data;
    },

    updateSchedule: async (id, data) => {
        const response = await api.put(`/shifts/schedule/${id}`, data);
        return response.data;
    },

    getStats: async (params) => {
        // params: { startDate, endDate, employeeId }
        const response = await api.get('/shifts/stats', { params });
        return response.data.data.stats;
    },

    getMyTodayShift: async () => {
        const response = await api.get('/shifts/my-shift');
        return response.data.data;
    },

    getMyWeeklySchedule: async () => {
        const response = await api.get('/shifts/my-weekly-schedule');
        return response.data.data;
    }
};

export default shiftService;
