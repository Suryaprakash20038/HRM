import api from './api';

export const leaveService = {
    // Apply for leave
    applyLeave: (data) => {
        return api.post('/leave/apply', data);
    },

    // Get leaves (can be filtered by status, employeeId, page, limit)
    getLeaves: (params) => {
        return api.get('/leave', { params });
    },

    // Approve leave
    approveLeave: (id, data) => {
        return api.put(`/leave/${id}/approve`, data);
    },

    // Reject leave
    rejectLeave: (id, data) => {
        return api.put(`/leave/${id}/reject`, data);
    },

    // Get leave balance
    getLeaveBalance: (employeeId) => {
        return api.get(`/leave/balance/${employeeId}`);
    }
};
