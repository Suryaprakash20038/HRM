import api from './api';

// Create Task (Team Lead)
export const createTask = async (formData) => {
    const response = await api.post('/tasks', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

// Get Tasks
export const getTasks = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/tasks?${params}`);
    return response.data;
};

// Get My Tasks (Employee)
export const getMyTasks = async () => {
    const response = await api.get('/tasks?myTasks=true');
    return response.data;
};

// Update Task Status
export const updateTaskStatus = async (taskId, statusData) => {
    const response = await api.patch(`/tasks/${taskId}/status`, statusData);
    return response.data;
};

// Get Tasks by Project
export const getTasksByProject = async (projectId) => {
    const response = await api.get(`/tasks?projectId=${projectId}`);
    return response.data;
};

// Get Tasks by Module
export const getTasksByModule = async (moduleId) => {
    const response = await api.get(`/tasks?moduleId=${moduleId}`);
    return response.data;
};

// Delete Task
export const deleteTask = async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
};

// Utility functions
export const isOverdue = (task) => {
    if (!task.dueDate || task.status === 'Completed') return false;
    return new Date(task.dueDate) < new Date();
};

export const getTaskTypeIcon = (type) => {
    const icons = {
        'Bug': '🐛',
        'Feature': '✨',
        'Task': '📋',
        'Improvement': '🛠️'
    };
    return icons[type] || '📋';
};

export const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

// Update Progress
export const updateProgress = async (taskId, progressData) => {
    // Mapping to status update for now as backend doesn't have progressPercent
    const response = await api.patch(`/tasks/${taskId}/status`, {
        status: progressData.progressPercent === 100 ? 'Completed' : 'In Progress',
        comment: progressData.comment
    });
    return response.data;
};

// Update Task Result
export const updateTaskResult = async (taskId, resultData) => {
    const response = await api.patch(`/tasks/${taskId}/status`, {
        status: resultData.taskResult === 'Success' ? 'Completed' : 'On Hold',
        comment: resultData.employeeNotes || resultData.delayReason
    });
    return response.data;
};

export default {
    createTask,
    getTasks,
    getMyTasks,
    updateTaskStatus,
    getTasksByProject,
    getTasksByModule,
    deleteTask,
    isOverdue,
    getTaskTypeIcon,
    formatDate,
    updateProgress,
    updateTaskResult
};


