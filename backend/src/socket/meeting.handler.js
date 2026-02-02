const Meeting = require('../models/Meeting/Meeting');

module.exports = (socket, io) => {
    // When a user joins a meeting room
    socket.on('join_meeting', async ({ roomId }) => {
        try {
            // Join the socket room
            socket.join(roomId);
            console.log(`User ${socket.userId} joined meeting room: ${roomId}`);

            // Notify others in the room
            socket.to(roomId).emit('participant_joined', {
                userId: socket.userId,
                userName: `${socket.user.firstName} ${socket.user.lastName}`,
                userAvatar: socket.user.profilePicture,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Error joining meeting:', error);
            socket.emit('error', { message: 'Failed to join meeting' });
        }
    });

    // When a user leaves a meeting room
    socket.on('leave_meeting', ({ roomId }) => {
        try {
            socket.leave(roomId);
            console.log(`User ${socket.userId} left meeting room: ${roomId}`);

            // Notify others
            socket.to(roomId).emit('participant_left', {
                userId: socket.userId,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Error leaving meeting:', error);
        }
    });

    // Meeting started event (host triggers)
    socket.on('meeting_started', ({ roomId }) => {
        socket.to(roomId).emit('meeting_active', { roomId });
    });

    // Meeting ended event (host triggers)
    socket.on('meeting_ended', ({ roomId }) => {
        socket.to(roomId).emit('meeting_ended', { roomId });
    });
};
