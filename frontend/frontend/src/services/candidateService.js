import api from './api';

const candidateService = {
    getAllCandidates: async () => {
        const response = await api.get('/candidates');
        return response.data.data.candidates;
    },

    createCandidate: async (candidateData) => {
        const response = await api.post('/candidates', candidateData);
        return response.data.data.candidate;
    },

    updateCandidate: async (id, candidateData) => {
        const response = await api.put(`/candidates/${id}`, candidateData);
        return response.data.data.candidate;
    },

    deleteCandidate: async (id) => {
        await api.delete(`/candidates/${id}`);
        return id;
    },

    sendOfferLetter: async (id, data) => {
        const response = await api.post(`/candidates/${id}/offer`, data);
        return response.data;
    },

    syncCandidates: async (spreadsheetId) => {
        const response = await api.post('/candidates/sync/google', { spreadsheetId });
        return response.data;
    },

    getAllTemplates: async () => {
        const response = await api.get('/recruitment-settings/templates');
        return response.data.data;
    }
};

export default candidateService;
