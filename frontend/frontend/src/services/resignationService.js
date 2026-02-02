import api from './api';

const resignationService = {
    submitResignation: async (resignationData) => {
        // Expects { reason, requestedLWD, comments, resignationLetter: File }
        const formData = new FormData();
        formData.append('reason', resignationData.reason);
        formData.append('requestedLWD', resignationData.requestedLWD);
        formData.append('comments', resignationData.comments);

        if (resignationData.resignationLetter) {
            formData.append('resignationLetter', resignationData.resignationLetter);
        }

        const response = await api.post('/resignation/submit', formData);
        return response.data;
    },

    cancelResignation: async () => {
        const response = await api.post('/resignation/cancel');
        return response.data;
    },

    getManagerResignations: async () => {
        const response = await api.get('/resignation/manager/list');
        return response.data;
    },

    getTLResignations: async () => {
        const response = await api.get('/resignation/tl/list');
        return response.data;
    },

    approveResignationByTL: async (employeeId, comments) => {
        const response = await api.post('/resignation/tl/approve', { employeeId, comments });
        return response.data;
    },

    rejectResignationByTL: async (employeeId, rejectionReason) => {
        const response = await api.post('/resignation/tl/reject', { employeeId, rejectionReason });
        return response.data;
    },

    approveResignation: async (employeeId, lwd) => {
        const response = await api.post('/resignation/manager/approve', { employeeId, lwd });
        return response.data;
    },

    rejectResignation: async (employeeId, rejectionReason) => {
        const response = await api.post('/resignation/manager/reject', { employeeId, rejectionReason });
        return response.data;
    },

    getHRResignations: async () => {
        const response = await api.get('/resignation/hr/list');
        return response.data;
    },

    finalApproveResignation: async (data) => {
        // data: { employeeId, noticeDays, finalLWD, comments }
        const response = await api.post('/resignation/hr/approve', data);
        return response.data;
    },

    getExitEmployees: async () => {
        const response = await api.get('/resignation/hr/exit-list');
        return response.data;
    },

    updateExitClearance: async (data) => {
        const response = await api.post('/resignation/hr/clearance', data);
        return response.data;
    },

    relieveEmployee: async (employeeId) => {
        const response = await api.post('/resignation/hr/relieve', { employeeId });
        return response.data;
    }
};

export default resignationService;
