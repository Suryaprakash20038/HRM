import api from './api';

const mediaService = {
    createPost: async (data) => {
        // Check if data contains a file (image)
        const formData = new FormData();
        formData.append('platform', data.platform);
        formData.append('postLink', data.postLink);
        formData.append('description', data.description);

        if (data.image) {
            formData.append('image', data.image); // Append the file
        }

        const response = await api.post('/media', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getAllPosts: async () => {
        const response = await api.get('/media');
        return response.data;
    },

    getMyPosts: async () => {
        const response = await api.get('/media/my-posts');
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/media/stats');
        return response.data;
    },

    deletePost: async (id) => {
        const response = await api.delete(`/media/${id}`);
        return response.data;
    },

    deleteAllPosts: async () => {
        const response = await api.delete('/media/all/clear');
        return response.data;
    }
};

export default mediaService;
