import api from './api';

const jobDescriptionService = {
    getAllJobDescriptions: async (status) => {
        const query = status ? `?status=${status}` : '';
        const response = await api.get(`/job-descriptions${query}`);
        return response.data.data.jds;
    },

    createJobDescription: async (data) => {
        const response = await api.post('/job-descriptions', data);
        return response.data.data.jd;
    },

    updateJobDescription: async (id, data) => {
        const response = await api.put(`/job-descriptions/${id}`, data);
        return response.data.data.jd;
    },

    deleteJobDescription: async (id) => {
        await api.delete(`/job-descriptions/${id}`);
        return id;
    }
};

export default jobDescriptionService;
