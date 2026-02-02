import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import chatService from '../services/chatService';
import { io } from 'socket.io-client';

const ChatContext = createContext();

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState(new Map());
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Ref to track active conversation inside socket listeners (closure fix)
    const activeConversationRef = React.useRef(activeConversation);

    useEffect(() => {
        activeConversationRef.current = activeConversation;
    }, [activeConversation]);

    // Initialize socket connection
    useEffect(() => {
        if (!user) return;

        const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
        const newSocket = io(SOCKET_URL, {
            auth: {
                token: localStorage.getItem('token')
            },
            transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
            console.log('Socket connected');
            setConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setConnected(false);
        });

        // Listen for new messages
        newSocket.on('new_message', ({ message }) => {
            console.log('Socket: new_message received', message);

            // Robust check for conversation ID match
            const msgConvId = typeof message.conversationId === 'object'
                ? message.conversationId._id
                : message.conversationId;

            const currentActive = activeConversationRef.current;

            if (currentActive && msgConvId === currentActive._id) {
                setMessages(prev => {
                    // Prevent duplicates
                    if (prev.some(m => m._id === message._id)) return prev;
                    return [...prev, message];
                });
            }
            // Update conversation list
            fetchConversations();
        });

        // Listen for message updates
        newSocket.on('message_updated', ({ message }) => {
            setMessages(prev => prev.map(msg =>
                msg._id === message._id ? message : msg
            ));
        });

        // Listen for message deletions
        newSocket.on('message_deleted', ({ messageId }) => {
            setMessages(prev => prev.filter(msg => msg._id !== messageId));
        });

        // Listen for typing indicators
        newSocket.on('user_typing', ({ conversationId, userId, userName }) => {
            setTypingUsers(prev => {
                const newMap = new Map(prev);
                if (!newMap.has(conversationId)) {
                    newMap.set(conversationId, new Set());
                }
                newMap.get(conversationId).add(userName);
                return newMap;
            });
        });

        newSocket.on('user_stop_typing', ({ conversationId, userId }) => {
            setTypingUsers(prev => {
                const newMap = new Map(prev);
                if (newMap.has(conversationId)) {
                    const users = newMap.get(conversationId);
                    users.delete(userId);
                    if (users.size === 0) {
                        newMap.delete(conversationId);
                    }
                }
                return newMap;
            });
        });

        // Listen for online users
        newSocket.on('users_online', (users) => {
            setOnlineUsers(new Set(users));
        });

        // Listen for reaction updates
        newSocket.on('reaction_added', ({ messageId, reactions }) => {
            setMessages(prev => prev.map(msg =>
                msg._id === messageId ? { ...msg, reactions } : msg
            ));
        });

        newSocket.on('reaction_removed', ({ messageId, reactions }) => {
            setMessages(prev => prev.map(msg =>
                msg._id === messageId ? { ...msg, reactions } : msg
            ));
        });

        // Listen for in-app notifications
        newSocket.on('new_notification', (notification) => {
            console.log('Socket: new_notification received', notification);
            const toastOptions = {
                duration: 6000,
                position: 'top-right',
                style: {
                    borderRadius: '12px',
                    background: '#fff',
                    color: '#333',
                    borderLeft: `5px solid ${notification.type === 'success' ? '#10b981' : notification.type === 'error' ? '#ef4444' : '#663399'}`
                }
            };

            const content = (
                <div onClick={() => window.location.href = notification.link || '#'}>
                    <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{notification.title}</div>
                    <div style={{ fontSize: '13px', opacity: 0.9 }}>{notification.message}</div>
                </div>
            );

            if (notification.type === 'success') toast.success(content, toastOptions);
            else if (notification.type === 'error') toast.error(content, toastOptions);
            else toast.success(content, { ...toastOptions, icon: '🔔' });
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [user]);

    // Fetch conversations
    const fetchConversations = useCallback(async () => {
        try {
            setLoading(true);
            const result = await chatService.getConversations();
            if (result.success) {
                setConversations(result.data.conversations || []);
            }
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch messages for a conversation
    const fetchMessages = useCallback(async (conversationId) => {
        try {
            setLoading(true);
            const result = await chatService.getMessages(conversationId);
            if (result.success) {
                setMessages(result.data.messages || []);
            }
        } catch (err) {
            console.error('Failed to fetch messages:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Send a message
    const sendMessage = useCallback(async (conversationId, content, type = 'text', fileUrl = null) => {
        try {
            const result = await chatService.sendMessage(conversationId, content, type, fileUrl);
            if (result.success) {
                // Message will be added via socket event
                return result.data.message;
            }
        } catch (err) {
            console.error('Failed to send message:', err);
            setError(err.message);
            throw err;
        }
    }, []);

    // Create conversation
    const createConversation = useCallback(async (data) => {
        try {
            const result = await chatService.createConversation(data);
            if (result.success) {
                await fetchConversations();
                return result.data.conversation;
            }
        } catch (err) {
            console.error('Failed to create conversation:', err);
            setError(err.message);
            throw err;
        }
    }, [fetchConversations]);

    // Create direct conversation
    const createDirectConversation = useCallback(async (userId) => {
        return createConversation({ participantIds: [userId], type: 'direct' });
    }, [createConversation]);

    // Create group conversation
    const createGroupConversation = useCallback(async (groupData) => {
        return createConversation({ ...groupData, type: 'group' });
    }, [createConversation]);

    // Delete conversation
    const deleteConversation = useCallback(async (conversationId) => {
        try {
            const result = await chatService.deleteConversation(conversationId);
            if (result.success) {
                setConversations(prev => prev.filter(c => c._id !== conversationId));
                if (activeConversation?._id === conversationId) {
                    setActiveConversation(null);
                    setMessages([]);
                }
            }
        } catch (err) {
            console.error('Failed to delete conversation:', err);
            setError(err.message);
            throw err;
        }
    }, [activeConversation]);

    // Mark conversation as read
    const markAsRead = useCallback(async (conversationId) => {
        try {
            await chatService.markAsRead(conversationId);
            // Update unread count locally or re-fetch
            fetchConversations();
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    }, [fetchConversations]);

    // Emit typing indicator
    const emitTyping = useCallback((conversationId) => {
        if (socket && connected) {
            socket.emit('typing', { conversationId });
        }
    }, [socket, connected]);

    // Emit stop typing
    const emitStopTyping = useCallback((conversationId) => {
        if (socket && connected) {
            socket.emit('stop_typing', { conversationId });
        }
    }, [socket, connected]);

    // Load conversations on mount
    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user, fetchConversations]);

    // Load messages when active conversation changes
    useEffect(() => {
        if (activeConversation) {
            fetchMessages(activeConversation._id);
            markAsRead(activeConversation._id);
        } else {
            setMessages([]);
        }
    }, [activeConversation, fetchMessages, markAsRead]);

    // Join conversation rooms
    useEffect(() => {
        if (socket && connected && conversations.length > 0) {
            conversations.forEach(conv => {
                socket.emit('join_conversation', conv._id);
            });
        }
    }, [socket, connected, conversations.length]); // Only re-join if count changes or reconnect


    const totalUnreadCount = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);

    const value = {
        socket,
        connected,
        conversations,
        totalUnreadCount,
        activeConversation,
        setActiveConversation,
        messages,
        typingUsers,
        onlineUsers,
        loading,
        error,
        fetchConversations,
        fetchMessages,
        sendMessage,
        createConversation,
        createDirectConversation,
        createGroupConversation,
        deleteConversation,
        markAsRead,
        emitTyping,
        emitStopTyping
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
