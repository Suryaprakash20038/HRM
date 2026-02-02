const messageService = require('../../services/message.service');

class MessageController {
    // Get messages for a conversation
    async getMessages(req, res) {
        try {
            const userId = req.user._id;
            const { id } = req.params;
            const { page, limit, before } = req.query;

            const result = await messageService.getMessages(id, userId, {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 50,
                before
            });

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Get messages error:', error);
            res.status(error.message.includes('access denied') ? 403 : 500).json({
                success: false,
                message: error.message || 'Failed to fetch messages'
            });
        }
    }

    // Send a message
    async sendMessage(req, res) {
        try {
            const userId = req.user._id;
            const { id } = req.params;
            const messageData = req.body;

            const message = await messageService.sendMessage(id, userId, messageData);

            // Emit socket event to conversation participants
            const io = req.app.get('io');
            if (io) {
                io.to(id).emit('new_message', { message });
            }

            res.status(201).json({
                success: true,
                data: { message }
            });
        } catch (error) {
            console.error('Send message error:', error);
            res.status(error.message.includes('access denied') ? 403 : 500).json({
                success: false,
                message: error.message || 'Failed to send message'
            });
        }
    }

    // Update a message
    async updateMessage(req, res) {
        try {
            const userId = req.user._id;
            const { id } = req.params;
            const updates = req.body;

            const message = await messageService.updateMessage(id, userId, updates);

            // Emit socket event
            const io = req.app.get('io');
            if (io) {
                io.to(message.conversationId.toString()).emit('message_updated', { message });
            }

            res.status(200).json({
                success: true,
                data: { message }
            });
        } catch (error) {
            console.error('Update message error:', error);
            res.status(error.message.includes('access denied') ? 403 : 500).json({
                success: false,
                message: error.message || 'Failed to update message'
            });
        }
    }

    // Delete a message
    async deleteMessage(req, res) {
        try {
            const userId = req.user._id;
            const { id } = req.params;

            const result = await messageService.deleteMessage(id, userId);

            // Emit socket event
            const io = req.app.get('io');
            if (io) {
                io.emit('message_deleted', { messageId: id });
            }

            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            console.error('Delete message error:', error);
            res.status(error.message.includes('access denied') ? 403 : 500).json({
                success: false,
                message: error.message || 'Failed to delete message'
            });
        }
    }

    // Add reaction to message
    async addReaction(req, res) {
        try {
            const userId = req.user._id;
            const { id } = req.params;
            const { emoji } = req.body;

            if (!emoji) {
                return res.status(400).json({
                    success: false,
                    message: 'Emoji is required'
                });
            }

            const message = await messageService.addReaction(id, userId, emoji);

            // Emit socket event
            const io = req.app.get('io');
            if (io) {
                io.to(message.conversationId.toString()).emit('reaction_added', {
                    messageId: id,
                    userId,
                    emoji,
                    reactions: message.reactions
                });
            }

            res.status(200).json({
                success: true,
                data: { message }
            });
        } catch (error) {
            console.error('Add reaction error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to add reaction'
            });
        }
    }

    // Remove reaction from message
    async removeReaction(req, res) {
        try {
            const userId = req.user._id;
            const { id, emoji } = req.params;

            const message = await messageService.removeReaction(id, userId, emoji);

            // Emit socket event
            const io = req.app.get('io');
            if (io) {
                io.to(message.conversationId.toString()).emit('reaction_removed', {
                    messageId: id,
                    userId,
                    emoji,
                    reactions: message.reactions
                });
            }

            res.status(200).json({
                success: true,
                data: { message }
            });
        } catch (error) {
            console.error('Remove reaction error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to remove reaction'
            });
        }
    }

    // Search messages
    async searchMessages(req, res) {
        try {
            const userId = req.user._id;
            const { id } = req.params;
            const { q } = req.query;

            if (!q) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required'
                });
            }

            const messages = await messageService.searchMessages(id, userId, q);

            res.status(200).json({
                success: true,
                data: { messages }
            });
        } catch (error) {
            console.error('Search messages error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to search messages'
            });
        }
    }

    // Mark all messages as read
    async markAllAsRead(req, res) {
        try {
            const userId = req.user._id;
            const { id } = req.params;

            await messageService.markAllAsRead(id, userId);

            res.status(200).json({
                success: true,
                message: 'All messages marked as read'
            });
        } catch (error) {
            console.error('Mark all as read error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to mark messages as read'
            });
        }
    }
}

module.exports = new MessageController();
