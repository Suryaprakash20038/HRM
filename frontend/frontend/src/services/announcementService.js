import api from './api';

const announcementService = {
    getAllAnnouncements: async (params) => {
        const response = await api.get('/announcements', { params });
        return response.data.data;
    },

    getEmployeeAnnouncements: async (params) => {
        const response = await api.get('/announcements/employee/my-announcements', { params });
        return response.data.data;
    },

    getAnnouncementById: async (id) => {
        const response = await api.get(`/announcements/${id}`);
        return response.data.data;
    },

    createAnnouncement: async (data) => {
        const response = await api.post('/announcements', data);
        return response.data.data;
    },

    updateAnnouncement: async (id, data) => {
        const response = await api.put(`/announcements/${id}`, data);
        return response.data.data;
    },

    deleteAnnouncement: async (id) => {
        const response = await api.delete(`/announcements/${id}`);
        return response.data.data;
    }
};

export default announcementService;
