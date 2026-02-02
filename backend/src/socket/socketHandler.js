const authConfig = require('../config/auth');
const User = require('../models/User/User');
const meetingHandler = require('./meeting.handler');

const onlineUsers = new Map(); // userId -> Set(socketIds)

module.exports = (io) => {
    io.on('connection', async (socket) => {
        try {
            // Authentication
            const token = socket.handshake.auth.token;
            if (!token) {
                console.log('Socket connection rejected: No token');
                socket.disconnect();
                return;
            }

            let decoded;
            try {
                decoded = authConfig.verifyToken(token);
            } catch (err) {
                console.log('Socket connection rejected: Invalid token');
                socket.disconnect();
                return;
            }

            const userId = decoded.id;
            const user = await User.findById(userId).select('firstName lastName profilePicture');

            if (!user) {
                socket.disconnect();
                return;
            }

            // Add user to online list
            if (!onlineUsers.has(userId)) {
                onlineUsers.set(userId, new Set());
            }
            onlineUsers.get(userId).add(socket.id);

            // Join a personal room for direct notifications
            socket.join(userId);

            // Log connection
            console.log(`User connected: ${user.firstName} ${user.lastName} (${userId})`);

            // Broadcast online users
            io.emit('users_online', Array.from(onlineUsers.keys()));

            // Initialize meeting handlers
            // Attach user info to socket helper for handlers
            socket.user = user;
            socket.userId = userId;
            meetingHandler(socket, io);

            // Handle conversation events
            socket.on('join_conversation', (conversationId) => {
                socket.join(conversationId);
                console.log(`User ${userId} joined conversation ${conversationId}`);
            });

            socket.on('leave_conversation', (conversationId) => {
                socket.leave(conversationId);
                console.log(`User ${userId} left conversation ${conversationId}`);
            });

            socket.on('typing', ({ conversationId }) => {
                socket.to(conversationId).emit('user_typing', {
                    conversationId,
                    userId,
                    userName: `${user.firstName} ${user.lastName}`
                });
            });

            socket.on('stop_typing', ({ conversationId }) => {
                socket.to(conversationId).emit('user_stop_typing', {
                    conversationId,
                    userId
                });
            });

            // Handle disconnect
            socket.on('disconnect', () => {
                if (onlineUsers.has(userId)) {
                    const userSockets = onlineUsers.get(userId);
                    userSockets.delete(socket.id);

                    if (userSockets.size === 0) {
                        onlineUsers.delete(userId);
                        // Update everyone about user going offline
                        io.emit('users_online', Array.from(onlineUsers.keys()));
                    }
                }
                console.log(`User disconnected: ${userId}`);
            });

        } catch (error) {
            console.error('Socket connection error:', error);
            socket.disconnect();
        }
    });

    return io;
};
