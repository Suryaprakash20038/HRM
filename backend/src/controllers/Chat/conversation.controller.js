const conversationService = require('../../services/conversation.service');

class ConversationController {
    // Get all conversations for logged-in user
    async getConversations(req, res) {
        try {
            const userId = req.user._id;
            const { page, limit, type } = req.query;

            const result = await conversationService.getUserConversations(userId, {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
                type
            });

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Get conversations error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch conversations'
            });
        }
    }

    // Get conversation by ID
    async getConversationById(req, res) {
        try {
            const userId = req.user._id;
            const { id } = req.params;

            const conversation = await conversationService.getConversationById(id, userId);

            res.status(200).json({
                success: true,
                data: { conversation }
            });
        } catch (error) {
            console.error('Get conversation error:', error);
            res.status(error.message.includes('not found') ? 404 : 500).json({
                success: false,
                message: error.message || 'Failed to fetch conversation'
            });
        }
    }

    // Create new conversation
    async createConversation(req, res) {
        try {
            console.log('CreateConversation - User:', req.user);
            console.log('CreateConversation - Body:', req.body);
            const userId = req.user._id || req.user.id; // Fallback to id if _id missing
            const { type, participantIds, name, description, avatar } = req.body;

            let conversation;

            if (type === 'direct') {
                if (!participantIds || participantIds.length !== 1) {
                    return res.status(400).json({
                        success: false,
                        message: 'Direct conversation requires exactly one other participant'
                    });
                }
                conversation = await conversationService.createDirectConversation(
                    userId,
                    participantIds[0]
                );
            } else if (type === 'group') {
                conversation = await conversationService.createGroupConversation(
                    { name, description, participantIds, avatar },
                    userId
                );
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid conversation type'
                });
            }

            const io = req.app.get('io');
            if (io && conversation.participants) {
                conversation.participants.forEach(participant => {
                    // Handle both populated and unpopulated userId
                    const pUserId = participant.userId?._id || participant.userId;

                    if (pUserId && pUserId.toString() !== userId.toString()) {
                        io.to(pUserId.toString()).emit('added_to_conversation', {
                            conversation,
                            addedBy: {
                                userId: req.user._id,
                                userName: `${req.user.firstName} ${req.user.lastName}`
                            }
                        });
                    }
                });
            }

            res.status(201).json({
                success: true,
                data: { conversation }
            });
        } catch (error) {
            console.error('Create conversation error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to create conversation'
            });
        }
    }

    // Update conversation
    async updateConversation(req, res) {
        try {
            const userId = req.user._id;
            const { id } = req.params;
            const updates = req.body;

            const conversation = await conversationService.updateConversation(id, userId, updates);

            // Emit socket event
            const io = req.app.get('io');
            if (io) {
                io.to(id).emit('conversation_updated', {
                    conversationId: id,
                    updates
                });
            }

            res.status(200).json({
                success: true,
                data: { conversation }
            });
        } catch (error) {
            console.error('Update conversation error:', error);
            res.status(error.message.includes('access denied') ? 403 : 500).json({
                success: false,
                message: error.message || 'Failed to update conversation'
            });
        }
    }

    // Add participants to conversation
    async addParticipants(req, res) {
        try {
            const userId = req.user._id;
            const { id } = req.params;
            const { userIds } = req.body;

            if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'User IDs are required'
                });
            }

            const conversation = await conversationService.addParticipants(id, userId, userIds);

            // Emit socket event to new participants
            const io = req.app.get('io');
            if (io) {
                userIds.forEach(newUserId => {
                    io.to(newUserId.toString()).emit('added_to_conversation', {
                        conversation,
                        addedBy: {
                            userId: req.user._id,
                            userName: `${req.user.firstName} ${req.user.lastName}`
                        }
                    });
                });
                // Also notify existing members about the update
                io.to(id).emit('conversation_updated', {
                    conversationId: id,
                    updates: { participants: conversation.participants }
                });
            }

            res.status(200).json({
                success: true,
                data: { conversation }
            });
        } catch (error) {
            console.error('Add participants error:', error);
            res.status(error.message.includes('access denied') ? 403 : 500).json({
                success: false,
                message: error.message || 'Failed to add participants'
            });
        }
    }

    // Make participant admin
    async makeParticipantAdmin(req, res) {
        try {
            const userId = req.user._id;
            const { id, userId: targetUserId } = req.params;

            const conversation = await conversationService.makeParticipantAdmin(id, userId, targetUserId);

            // Emit socket event
            const io = req.app.get('io');
            if (io) {
                io.to(id).emit('conversation_updated', {
                    conversationId: id,
                    updates: { participants: conversation.participants }
                });
            }

            res.status(200).json({
                success: true,
                data: { conversation }
            });
        } catch (error) {
            console.error('Make admin error:', error);
            res.status(error.message.includes('Only admins') ? 403 : 500).json({
                success: false,
                message: error.message || 'Failed to make participant admin'
            });
        }
    }

    // Remove participant from conversation
    async removeParticipant(req, res) {
        try {
            const userId = req.user._id;
            const { id, userId: participantId } = req.params;

            const conversation = await conversationService.removeParticipant(id, userId, participantId);

            // Emit socket event
            const io = req.app.get('io');
            if (io) {
                io.to(participantId).emit('removed_from_conversation', {
                    conversationId: id,
                    removedBy: {
                        userId: req.user._id,
                        userName: `${req.user.firstName} ${req.user.lastName}`
                    }
                });
            }

            res.status(200).json({
                success: true,
                data: { conversation }
            });
        } catch (error) {
            console.error('Remove participant error:', error);
            res.status(error.message.includes('access denied') ? 403 : 500).json({
                success: false,
                message: error.message || 'Failed to remove participant'
            });
        }
    }

    // Mark conversation as read
    async markAsRead(req, res) {
        try {
            const userId = req.user._id;
            const { id } = req.params;
            const { messageId } = req.body;

            await conversationService.markAsRead(id, userId, messageId);

            res.status(200).json({
                success: true,
                message: 'Conversation marked as read'
            });
        } catch (error) {
            console.error('Mark as read error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to mark as read'
            });
        }
    }

    // Delete conversation
    async deleteConversation(req, res) {
        try {
            const userId = req.user._id;
            const { id } = req.params;

            const result = await conversationService.deleteConversation(id, userId);

            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            console.error('Delete conversation error:', error);
            res.status(error.message.includes('access denied') ? 403 : 500).json({
                success: false,
                message: error.message || 'Failed to delete conversation'
            });
        }
    }

    // Search conversations
    async searchConversations(req, res) {
        try {
            const userId = req.user._id;
            const { q } = req.query;

            if (!q) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required'
                });
            }

            const conversations = await conversationService.searchConversations(userId, q);

            res.status(200).json({
                success: true,
                data: { conversations }
            });
        } catch (error) {
            console.error('Search conversations error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to search conversations'
            });
        }
    }
}

module.exports = new ConversationController();
