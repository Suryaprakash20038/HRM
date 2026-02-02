import api from './api';

const employeeService = {
    getAllEmployees: async (params) => {
        const response = await api.get('/employees', { params });
        return response.data.data;
    },

    getEmployeeStats: async () => {
        const response = await api.get('/employees/stats');
        return response.data.data;
    },

    getEmployeeById: async (id) => {
        const response = await api.get(`/employees/${id}`);
        return response.data.data.employee;
    },

    getMyProfile: async () => {
        const response = await api.get('/employees/me');
        return response.data.data.employee;
    },

    createEmployee: async (employeeData) => {
        const formData = new FormData();
        // Append email first to ensure it's available for multer middleware
        if (employeeData.email) {
            formData.append('email', employeeData.email);
        }

        Object.keys(employeeData).forEach(key => {
            if (key === 'email') return; // Skip email as it's already appended

            const value = employeeData[key];
            if (value instanceof File) {
                formData.append(key, value);
            } else if (value !== null && value !== undefined) {
                if (typeof value === 'object') {
                    if (key === 'emergencyContact') {
                        formData.append('emergencyContactName', value.name || '');
                        formData.append('emergencyContactPhone', value.phone || '');
                        formData.append('emergencyContactRelation', value.relation || '');
                    }
                    // Skip empty objects for documents
                    else if (Object.keys(value).length === 0) {
                        return;
                    }
                    else {
                        formData.append(key, value);
                    }
                } else {
                    formData.append(key, value);
                }
            }
        });

        const response = await api.post('/employees', formData);
        return response.data.data.employee;
    },

    updateEmployee: async (id, employeeData) => {
        // Check if there are any files to upload
        const hasFile = Object.values(employeeData).some(value => value instanceof File);

        if (hasFile) {
            const formData = new FormData();
            // Append email first to ensure it's available for multer middleware
            if (employeeData.email) {
                formData.append('email', employeeData.email);
            }

            Object.keys(employeeData).forEach(key => {
                if (key === 'email') return; // Skip email as it's already appended

                const value = employeeData[key];

                if (value instanceof File) {
                    formData.append(key, value);
                } else if (value !== null && value !== undefined) {
                    if (typeof value === 'object') {
                        if (key === 'emergencyContact') {
                            formData.append('emergencyContactName', value.name || '');
                            formData.append('emergencyContactPhone', value.phone || '');
                            formData.append('emergencyContactRelation', value.relation || '');
                        }
                        // Skip empty objects (like {} for documents)
                        else if (Object.keys(value).length === 0) {
                            return;
                        }
                        else {
                            formData.append(key, value);
                        }
                    } else {
                        formData.append(key, value);
                    }
                }
            });

            const response = await api.put(`/employees/${id}`, formData);
            return response.data.data.employee;
        } else {
            // JSON request: Clean data first
            const cleanData = { ...employeeData };

            // Flatten emergency contact if it exists as an object
            if (cleanData.emergencyContact) {
                cleanData.emergencyContactName = cleanData.emergencyContact.name;
                cleanData.emergencyContactPhone = cleanData.emergencyContact.phone;
                cleanData.emergencyContactRelation = cleanData.emergencyContact.relation;
                delete cleanData.emergencyContact;
            }

            // Remove empty objects for document fields
            const docFields = [
                'tenthMarksheet', 'twelfthMarksheet', 'degreeCertificate',
                'consolidatedMarksheet', 'provisionalCertificate', 'aadharCard',
                'panCard', 'resume'
            ];

            docFields.forEach(field => {
                if (cleanData[field] && typeof cleanData[field] === 'object' && Object.keys(cleanData[field]).length === 0) {
                    delete cleanData[field];
                }
            });

            const response = await api.put(`/employees/${id}`, cleanData);
            return response.data.data.employee;
        }
    },

    deleteEmployee: async (id) => {
        const response = await api.delete(`/employees/${id}`);
        return response.data;
    },

    uploadProfileImage: async (id, file) => {
        const formData = new FormData();
        formData.append('profileImage', file);
        const response = await api.post(`/employees/${id}/profile-image`, formData);
        return response.data.data;
    }
};

export default employeeService;
