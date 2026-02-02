import axios from 'axios';

const API_URL = 'http://localhost:5000/api/ai-assistant';

// Get auth token from localStorage
const getAuthToken = () => {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : '';
};

// Get all conversations
export const getConversations = async (page = 1, limit = 20) => {
    try {
        const response = await axios.get(`${API_URL}/conversations`, {
            params: { page, limit },
            headers: {
                'Authorization': getAuthToken()
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Get a specific conversation
export const getConversation = async (conversationId) => {
    try {
        const response = await axios.get(`${API_URL}/conversations/${conversationId}`, {
            headers: {
                'Authorization': getAuthToken()
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Create a new conversation
export const createConversation = async (title = 'New Conversation', initialMessage = null) => {
    try {
        const response = await axios.post(`${API_URL}/conversations`, {
            title,
            initialMessage
        }, {
            headers: {
                'Authorization': getAuthToken()
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Send a message in a conversation
export const sendMessage = async (conversationId, message) => {
    try {
        const response = await axios.post(`${API_URL}/conversations/${conversationId}/messages`, {
            message
        }, {
            headers: {
                'Authorization': getAuthToken()
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Update conversation (title, pin status, etc.)
export const updateConversation = async (conversationId, updates) => {
    try {
        const response = await axios.put(`${API_URL}/conversations/${conversationId}`, updates, {
            headers: {
                'Authorization': getAuthToken()
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Delete a conversation
export const deleteConversation = async (conversationId) => {
    try {
        const response = await axios.delete(`${API_URL}/conversations/${conversationId}`, {
            headers: {
                'Authorization': getAuthToken()
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Search conversations
export const searchConversations = async (query) => {
    try {
        const response = await axios.get(`${API_URL}/search`, {
            params: { q: query },
            headers: {
                'Authorization': getAuthToken()
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
