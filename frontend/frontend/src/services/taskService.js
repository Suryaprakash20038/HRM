import api from './api';

// Get all tasks with filters
export const getAllTasks = async (params = {}) => {
    try {
        const response = await api.get('/tasks', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Get task by ID
export const getTaskById = async (taskId) => {
    try {
        const response = await api.get(`/tasks/${taskId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Create new task
export const createTask = async (taskData) => {
    try {
        const response = await api.post('/tasks', taskData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Update task
export const updateTask = async (taskId, taskData) => {
    try {
        const response = await api.put(`/tasks/${taskId}`, taskData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Delete task
export const deleteTask = async (taskId) => {
    try {
        const response = await api.delete(`/tasks/${taskId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Get task statistics
export const getTaskStatistics = async (params = {}) => {
    try {
        const response = await api.get('/tasks/statistics', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// EMPLOYEE SERVICES

// Get tasks assigned to employee
export const getMyTasks = async (params = {}) => {
    try {
        const response = await api.get('/tasks/my-tasks', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Update task progress
export const updateProgress = async (taskId, progressData) => {
    try {
        const response = await api.put(`/tasks/${taskId}/update-progress`, progressData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Update task result
export const updateTaskResult = async (taskId, resultData) => {
    try {
        const response = await api.put(`/tasks/${taskId}/result`, resultData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Add comment to task
export const addComment = async (taskId, comment) => {
    try {
        const response = await api.post(`/tasks/${taskId}/comment`, { comment });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Add time log
export const addTimeLog = async (taskId, timeLogData) => {
    try {
        const response = await api.post(`/tasks/${taskId}/time-log`, timeLogData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Upload attachments
export const uploadAttachments = async (taskId, files) => {
    try {
        const formData = new FormData();

        // Append each file to FormData
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        const response = await api.post(`/tasks/${taskId}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// UTILITY FUNCTIONS

// Get priority color
export const getPriorityColor = (priority) => {
    const colors = {
        'Low': 'bg-blue-100 text-blue-800',
        'Medium': 'bg-yellow-100 text-yellow-800',
        'High': 'bg-orange-100 text-orange-800',
        'Urgent': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
};

// Get status color
export const getStatusColor = (status) => {
    const colors = {
        'To Do': 'bg-gray-100 text-gray-800',
        'In Progress': 'bg-blue-100 text-blue-800',
        'Review': 'bg-purple-100 text-purple-800',
        'Completed': 'bg-green-100 text-green-800',
        'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
};

// Get task type icon
export const getTaskTypeIcon = (taskType) => {
    const icons = {
        'Feature': '✨',
        'Bug': '🐛',
        'Improvement': '⚡',
        'Research': '🔍',
        'Meeting': '📅',
        'Admin': '⚙️',
        'Testing': '🧪',
        'Documentation': '📝',
        'Other': '📌'
    };
    return icons[taskType] || '📌';
};

// Format date
export const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// Check if task is overdue
export const isOverdue = (task) => {
    if (task.status === 'Completed' || task.status === 'Cancelled') {
        return false;
    }
    return new Date() > new Date(task.dueDate);
};

// Calculate days remaining
export const getDaysRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

const taskService = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    getTaskStatistics,
    getMyTasks,
    updateProgress,
    updateTaskResult,
    addComment,
    addTimeLog,
    uploadAttachments,
    getPriorityColor,
    getStatusColor,
    getTaskTypeIcon,
    formatDate,
    isOverdue,
    getDaysRemaining
};

export default taskService;
