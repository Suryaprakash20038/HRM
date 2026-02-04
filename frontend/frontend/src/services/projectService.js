import api from './api';

// Get all projects
export const getAllProjects = async (params = {}) => {
    const response = await api.get('/projects', { params });
    return response.data;
};

// Get project by ID
export const getProjectById = async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
};

// Create project
export const createProject = async (projectData) => {
    let dataToSend = projectData;
    let config = {};

    // Check for root files (assuming wrappers with _tempFile or direct File objects)
    const hasFiles = projectData.files && projectData.files.some(f => f instanceof File || f._tempFile);

    if (hasFiles) {
        const formData = new FormData();
        Object.keys(projectData).forEach(key => {
            if (key === 'files') {
                projectData.files.forEach(file => {
                    if (file._tempFile) {
                        formData.append('files', file._tempFile);
                    } else if (file instanceof File) {
                        formData.append('files', file);
                    }
                    // If it's just a metadata object without file (from editing?), skip? 
                    // Create usually implies new files.
                });
            } else if (['modules', 'teamMembers', 'client'].includes(key)) {
                formData.append(key, JSON.stringify(projectData[key]));
            } else {
                // Convert numbers/nulls to string safely
                const val = projectData[key];
                formData.append(key, val === null || val === undefined ? '' : val);
            }
        });

        dataToSend = formData;
        config.headers = { 'Content-Type': 'multipart/form-data' };
    }

    const response = await api.post('/projects', dataToSend, config);
    return response.data;
};

// Update project
export const updateProject = async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
};

// Delete project
export const deleteProject = async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
};

// Get departments
export const getDepartments = async () => {
    const response = await api.get('/projects/departments/list');
    return response.data;
};

// Get employees by department
export const getEmployeesByDepartment = async (department) => {
    const response = await api.get(`/projects/employees/department/${department}`);
    return response.data;
};

// Get my projects (employee)
export const getMyProjects = async () => {
    const response = await api.get('/projects/my-projects');
    return response.data;
};

// Update project progress (employee)
export const updateProjectProgress = async (id, data) => {
    const response = await api.patch(`/projects/${id}/update-progress`, data);
    return response.data;
};

// Add module to project
export const addModule = async (id, moduleData) => {
    const config = {};
    if (moduleData instanceof FormData) {
        config.headers = { 'Content-Type': 'multipart/form-data' };
    }
    const response = await api.post(`/projects/${id}/modules`, moduleData, config);
    return response.data;
};

// Update module
export const updateModule = async (projectId, moduleId, moduleData) => {
    const response = await api.put(`/projects/${projectId}/modules/${moduleId}`, moduleData);
    return response.data;
};

// Upload file to module
export const uploadModuleFile = async (projectId, moduleId, fileData) => {
    const config = {};
    if (fileData instanceof FormData) {
        config.headers = { 'Content-Type': 'multipart/form-data' };
    }
    const response = await api.post(`/projects/${projectId}/modules/${moduleId}/files`, fileData, config);
    return response.data;
};

export default {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    getDepartments,
    getEmployeesByDepartment,
    getMyProjects,
    updateProjectProgress,
    addModule,
    updateModule,
    uploadModuleFile
};
