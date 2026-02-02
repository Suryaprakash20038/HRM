import api from './api';

const payrollService = {
    getAllPayroll: async (params) => {
        try {
            const response = await api.get('/payroll', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getPayrollStats: async (params) => {
        try {
            const response = await api.get('/payroll/stats', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    generatePayroll: async (data) => {
        try {
            const response = await api.post('/payroll/generate', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updatePayroll: async (id, data) => {
        try {
            const response = await api.put(`/payroll/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deletePayroll: async (id) => {
        try {
            const response = await api.delete(`/payroll/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getSalarySlip: async (id) => {
        try {
            const response = await api.get(`/payroll/${id}/slip`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    sendPayslip: async (id) => {
        try {
            const response = await api.post(`/payroll/${id}/send-slip`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getMyPayslips: async (params) => {
        try {
            const response = await api.get('/payroll/my-payslips', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default payrollService;
