import api from './api';

// ==================== INCOME SERVICES ====================

export const createIncome = async (incomeData) => {
    try {
        const response = await api.post('/accounts/income', incomeData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getAllIncome = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.category) params.append('category', filters.category);
        if (filters.month) params.append('month', filters.month);
        if (filters.year) params.append('year', filters.year);

        const response = await api.get(`/accounts/income?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getIncomeById = async (id) => {
    try {
        const response = await api.get(`/accounts/income/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateIncome = async (id, incomeData) => {
    try {
        const response = await api.put(`/accounts/income/${id}`, incomeData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteIncome = async (id) => {
    try {
        const response = await api.delete(`/accounts/income/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// ==================== EXPENSE SERVICES ====================

export const createExpense = async (expenseData) => {
    try {
        const response = await api.post('/accounts/expense', expenseData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getAllExpense = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.category) params.append('category', filters.category);
        if (filters.month) params.append('month', filters.month);
        if (filters.year) params.append('year', filters.year);

        const response = await api.get(`/accounts/expense?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getExpenseById = async (id) => {
    try {
        const response = await api.get(`/accounts/expense/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateExpense = async (id, expenseData) => {
    try {
        const response = await api.put(`/accounts/expense/${id}`, expenseData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteExpense = async (id) => {
    try {
        const response = await api.delete(`/accounts/expense/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// ==================== SUMMARY & REPORTS ====================

export const getSummary = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.month) params.append('month', filters.month);
        if (filters.year) params.append('year', filters.year);

        const response = await api.get(`/accounts/summary?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getMonthlyReport = async (year) => {
    try {
        const params = year ? `?year=${year}` : '';
        const response = await api.get(`/accounts/monthly-report${params}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
