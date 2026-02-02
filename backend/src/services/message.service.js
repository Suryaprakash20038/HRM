const Message = require('../models/Chat/Message');
const Conversation = require('../models/Chat/Conversation');
const conversationService = require('./conversation.service');

class MessageService {
    // Get messages for a conversation
    async getMessages(conversationId, userId, options = {}) {
        const { page = 1, limit = 500, before } = options;

        // Verify user has access to conversation
        await conversationService.getConversationById(conversationId, userId);

        const query = {
            conversationId,
            isDeleted: false
        };

        // For pagination with "before" cursor
        if (before) {
            const beforeMessage = await Message.findById(before);
            if (beforeMessage) {
                query.createdAt = { $lt: beforeMessage.createdAt };
            }
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('senderId', 'firstName lastName profilePicture role')
            .populate('replyTo')
            .populate('mentions', 'firstName lastName')
            .populate('reactions.userId', 'firstName lastName')
            .lean();

        const total = await Message.countDocuments({ conversationId, isDeleted: false });

        return {
            messages: messages.reverse(), // Return oldest first
            pagination: {
                page,
                limit,
                total,
                hasMore: messages.length === limit
            }
        };
    }

    // Send a message
    async sendMessage(conversationId, senderId, messageData) {
        const { content, messageType = 'text', replyTo, mentions, attachments } = messageData;

        // Verify user has access to conversation
        const conversation = await conversationService.getConversationById(conversationId, senderId);

        // Create message
        const message = await Message.create({
            conversationId,
            senderId,
            messageType,
            content,
            replyTo,
            mentions,
            attachments,
            status: {
                sent: true,
                delivered: [],
                read: []
            }
        });

        // Update conversation's last message timestamp
        await conversationService.incrementUnreadCount(conversationId, senderId);

        // Populate sender info
        await message.populate('senderId', 'firstName lastName profilePicture role');
        if (replyTo) {
            await message.populate('replyTo');
        }
        if (mentions && mentions.length > 0) {
            await message.populate('mentions', 'firstName lastName');
        }

        return message;
    }

    // Update a message
    async updateMessage(messageId, userId, updates) {
        const message = await Message.findOne({
            _id: messageId,
            senderId: userId,
            isDeleted: false
        });

        if (!message) {
            throw new Error('Message not found or access denied');
        }

        // Only allow updating content
        if (updates.content) {
            message.content = updates.content;
            message.isEdited = true;
            message.editedAt = new Date();
            await message.save();
        }

        return message;
    }

    // Delete a message
    async deleteMessage(messageId, userId) {
        const message = await Message.findOne({
            _id: messageId,
            senderId: userId
        });

        if (!message) {
            throw new Error('Message not found or access denied');
        }

        message.isDeleted = true;
        message.deletedAt = new Date();
        message.deletedBy = userId;
        await message.save();

        return { message: 'Message deleted successfully' };
    }

    // Mark message as delivered
    async markAsDelivered(messageId, userId) {
        const message = await Message.findById(messageId);

        if (!message) {
            throw new Error('Message not found');
        }

        // Don't mark own messages as delivered
        if (message.senderId.toString() === userId.toString()) {
            return message;
        }

        message.markDelivered(userId);
        await message.save();

        return message;
    }

    // Mark message as read
    async markAsRead(messageId, userId) {
        const message = await Message.findById(messageId);

        if (!message) {
            throw new Error('Message not found');
        }

        // Don't mark own messages as read
        if (message.senderId.toString() === userId.toString()) {
            return message;
        }

        message.markRead(userId);
        await message.save();

        // Also update conversation's last read message
        await conversationService.markAsRead(message.conversationId, userId, messageId);

        return message;
    }

    // Add reaction to message
    async addReaction(messageId, userId, emoji) {
        const message = await Message.findById(messageId);

        if (!message) {
            throw new Error('Message not found');
        }

        message.addReaction(userId, emoji);
        await message.save();

        await message.populate('reactions.userId', 'firstName lastName');

        return message;
    }

    // Remove reaction from message
    async removeReaction(messageId, userId, emoji) {
        const message = await Message.findById(messageId);

        if (!message) {
            throw new Error('Message not found');
        }

        message.removeReaction(userId, emoji);
        await message.save();

        return message;
    }

    // Search messages in a conversation
    async searchMessages(conversationId, userId, searchQuery) {
        // Verify user has access to conversation
        await conversationService.getConversationById(conversationId, userId);

        const messages = await Message.find({
            conversationId,
            isDeleted: false,
            content: { $regex: searchQuery, $options: 'i' }
        })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('senderId', 'firstName lastName profilePicture')
            .lean();

        return messages;
    }

    // Get unread count for a conversation
    async getUnreadCount(conversationId, userId) {
        const conversation = await Conversation.findOne({
            _id: conversationId,
            'participants.userId': userId
        });

        if (!conversation) {
            return 0;
        }

        const participant = conversation.getParticipant(userId);
        const lastReadMessageId = participant?.lastReadMessageId;

        return await Message.getUnreadCount(conversationId, userId, lastReadMessageId);
    }

    // Mark all messages in conversation as read
    async markAllAsRead(conversationId, userId) {
        const messages = await Message.find({
            conversationId,
            senderId: { $ne: userId },
            isDeleted: false
        }).sort({ createdAt: -1 }).limit(1);

        if (messages.length > 0) {
            const lastMessage = messages[0];
            await conversationService.markAsRead(conversationId, userId, lastMessage._id);
        }

        return { message: 'All messages marked as read' };
    }
}

module.exports = new MessageService();
