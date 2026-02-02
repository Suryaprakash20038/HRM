import api from './api';

const chatService = {
    // ===== USER ENDPOINTS =====
    searchUsers: async (query) => {
        const response = await api.get(`/chat/users/search?query=${query}`);
        return response.data;
    },

    getOnlineUsers: async () => {
        const response = await api.get('/chat/users/online');
        return response.data;
    },

    getAllUsers: async () => {
        const response = await api.get('/chat/users');
        return response.data;
    },

    // ===== CONVERSATION ENDPOINTS =====
    getConversations: async () => {
        const response = await api.get('/chat/conversations');
        return response.data;
    },

    createConversation: async (data) => {
        const response = await api.post('/chat/conversations', data);
        return response.data;
    },

    getConversationById: async (id) => {
        const response = await api.get(`/chat/conversations/${id}`);
        return response.data;
    },

    updateConversation: async (id, data) => {
        const response = await api.put(`/chat/conversations/${id}`, data);
        return response.data;
    },

    deleteConversation: async (id) => {
        const response = await api.delete(`/chat/conversations/${id}`);
        return response.data;
    },

    addParticipants: async (id, participants) => {
        const response = await api.post(`/chat/conversations/${id}/participants`, { participants });
        return response.data;
    },

    removeParticipant: async (id, userId) => {
        const response = await api.delete(`/chat/conversations/${id}/participants/${userId}`);
        return response.data;
    },

    makeParticipantAdmin: async (id, userId) => {
        const response = await api.put(`/chat/conversations/${id}/participants/${userId}/admin`);
        return response.data;
    },

    markAsRead: async (id) => {
        const response = await api.put(`/chat/conversations/${id}/read`);
        return response.data;
    },

    searchConversations: async (query) => {
        const response = await api.get(`/chat/conversations/search?query=${query}`);
        return response.data;
    },

    // ===== MESSAGE ENDPOINTS =====
    getMessages: async (conversationId) => {
        const response = await api.get(`/chat/conversations/${conversationId}/messages`);
        return response.data;
    },

    sendMessage: async (conversationId, content, type = 'text', fileUrl = null) => {
        const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
            content,
            type,
            fileUrl
        });
        return response.data;
    },

    updateMessage: async (messageId, content) => {
        const response = await api.put(`/chat/messages/${messageId}`, { content });
        return response.data;
    },

    deleteMessage: async (messageId) => {
        const response = await api.delete(`/chat/messages/${messageId}`);
        return response.data;
    },

    addReaction: async (messageId, emoji) => {
        const response = await api.post(`/chat/messages/${messageId}/reactions`, { emoji });
        return response.data;
    },

    removeReaction: async (messageId, emoji) => {
        const response = await api.delete(`/chat/messages/${messageId}/reactions/${emoji}`);
        return response.data;
    },

    searchMessages: async (conversationId, query) => {
        const response = await api.get(`/chat/conversations/${conversationId}/messages/search?query=${query}`);
        return response.data;
    },

    markAllMessagesAsRead: async (conversationId) => {
        const response = await api.put(`/chat/conversations/${conversationId}/messages/read-all`);
        return response.data;
    },

    // ===== UPLOAD ENDPOINT =====
    uploadFile: async (formData) => {
        const response = await api.post('/chat/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
};

export default chatService;
