const Conversation = require('../models/Chat/Conversation');
const Message = require('../models/Chat/Message');
const User = require('../models/User/User');

class ConversationService {
    // Get all conversations for a user
    async getUserConversations(userId, options = {}) {
        const { page = 1, limit = 20, type } = options;
        const skip = (page - 1) * limit;

        const query = {
            'participants.userId': userId,
            isActive: true
        };

        if (type) {
            query.type = type;
        }

        const conversations = await Conversation.find(query)
            .sort({ lastMessageAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('participants.userId', 'firstName lastName email profilePicture role department isOnline lastSeen')
            .populate('createdBy', 'firstName lastName email profilePicture')
            .lean();

        // Get last message for each conversation
        const conversationsWithLastMessage = await Promise.all(
            conversations.map(async (conv) => {
                const lastMessage = await Message.findOne({
                    conversationId: conv._id,
                    isDeleted: false
                })
                    .sort({ createdAt: -1 })
                    .populate('senderId', 'firstName lastName')
                    .lean();

                // Get unread count for this user
                const participant = conv.participants.find(
                    p => p.userId && p.userId._id.toString() === userId.toString()
                );

                return {
                    ...conv,
                    lastMessage,
                    unreadCount: participant?.unreadCount || 0
                };
            })
        );

        const total = await Conversation.countDocuments(query);

        return {
            conversations: conversationsWithLastMessage,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    // Get conversation by ID
    async getConversationById(conversationId, userId) {
        const conversation = await Conversation.findOne({
            _id: conversationId,
            'participants.userId': userId,
            isActive: true
        })
            .populate('participants.userId', 'firstName lastName email profilePicture role department isOnline lastSeen')
            .populate('createdBy', 'firstName lastName');

        if (!conversation) {
            console.error(`GetConv: Not found or denied. ConvId: ${conversationId}, userId: ${userId}`);
            throw new Error('Conversation not found or access denied');
        }

        return conversation;
    }

    // Create direct conversation
    async createDirectConversation(user1Id, user2Id) {
        // Validate that both users exist
        const user1 = await User.findById(user1Id);
        const user2 = await User.findById(user2Id);

        if (!user1) {
            throw new Error('Current user not found');
        }

        if (!user2) {
            throw new Error('Selected user not found. Please ensure the user exists in the system.');
        }

        // Check if conversation already exists
        const existing = await Conversation.findOrCreateDirect(user1Id, user2Id);

        return await existing.populate('participants.userId', 'firstName lastName email profilePicture role department isOnline lastSeen');
    }

    // Create group conversation
    async createGroupConversation(data, createdById) {
        const { name, description, participantIds, avatar } = data;

        if (!name || !participantIds || participantIds.length < 2) {
            throw new Error('Group name and at least 2 participants are required');
        }

        // Add creator to participants if not already included
        const uniqueParticipants = [...new Set([createdById, ...participantIds])];

        const participants = uniqueParticipants.map((userId, index) => ({
            userId,
            role: userId.toString() === createdById.toString() ? 'admin' : 'member'
        }));

        const conversation = await Conversation.create({
            type: 'group',
            name,
            description,
            avatar,
            participants,
            createdBy: createdById,
            isActive: true
        });

        return await conversation.populate('participants.userId', 'firstName lastName email profilePicture role department isOnline lastSeen');
    }

    // Update conversation
    async updateConversation(conversationId, userId, updates) {
        const conversation = await Conversation.findOne({
            _id: conversationId,
            'participants.userId': userId,
            isActive: true
        });

        if (!conversation) {
            throw new Error('Conversation not found or access denied');
        }

        // Check if user is admin for group conversations
        if (conversation.type === 'group') {
            const participant = conversation.getParticipant(userId);
            if (participant.role !== 'admin') {
                throw new Error('Only admins can update group conversations');
            }
        }

        const allowedUpdates = ['name', 'description', 'avatar'];
        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                conversation[key] = updates[key];
            }
        });

        await conversation.save();
        return conversation;
    }

    // Add participants to group
    async addParticipants(conversationId, userId, participantIds) {
        const conversation = await Conversation.findOne({
            _id: conversationId,
            'participants.userId': userId,
            isActive: true
        });

        if (!conversation) {
            throw new Error('Conversation not found or access denied');
        }

        if (conversation.type !== 'group') {
            throw new Error('Can only add participants to group conversations');
        }

        // Check if user is admin
        const participant = conversation.getParticipant(userId);
        if (participant.role !== 'admin') {
            throw new Error('Only admins can add participants');
        }

        // Add new participants
        participantIds.forEach(participantId => {
            conversation.addParticipant(participantId, 'member');
        });

        await conversation.save();
        return await conversation.populate('participants.userId', 'firstName lastName email profilePicture role department isOnline lastSeen');
    }

    // Make participant admin
    async makeParticipantAdmin(conversationId, requesterId, targetUserId) {
        const conversation = await Conversation.findOne({
            _id: conversationId,
            'participants.userId': requesterId,
            isActive: true
        });

        if (!conversation) {
            throw new Error('Conversation not found or access denied');
        }

        if (conversation.type !== 'group') {
            throw new Error('Can only promote participants in group conversations');
        }

        // Check if requester is admin
        const requester = conversation.getParticipant(requesterId);
        if (requester.role !== 'admin') {
            throw new Error('Only admins can promote other members');
        }

        // Check if target is in the group
        const target = conversation.getParticipant(targetUserId);
        if (!target) {
            throw new Error('User is not a member of this group');
        }

        if (target.role === 'admin') {
            return conversation; // Already an admin
        }

        target.role = 'admin';
        await conversation.save();

        return await conversation.populate('participants.userId', 'firstName lastName email profilePicture role department isOnline lastSeen');
    }

    // Remove participant from group
    async removeParticipant(conversationId, userId, participantIdToRemove) {
        const conversation = await Conversation.findOne({
            _id: conversationId,
            'participants.userId': userId,
            isActive: true
        });

        if (!conversation) {
            throw new Error('Conversation not found or access denied');
        }

        if (conversation.type !== 'group') {
            throw new Error('Can only remove participants from group conversations');
        }

        // Check if user is admin or removing themselves
        const participant = conversation.getParticipant(userId);
        if (participant.role !== 'admin' && userId.toString() !== participantIdToRemove.toString()) {
            throw new Error('Only admins can remove other participants');
        }

        conversation.removeParticipant(participantIdToRemove);
        await conversation.save();

        return conversation;
    }

    // Mark conversation as read
    async markAsRead(conversationId, userId, messageId) {
        const conversation = await Conversation.findOne({
            _id: conversationId,
            'participants.userId': userId
        });

        if (!conversation) {
            throw new Error('Conversation not found');
        }

        const participantIndex = conversation.participants.findIndex(
            p => p.userId.toString() === userId.toString()
        );

        if (participantIndex !== -1) {
            conversation.participants[participantIndex].lastReadMessageId = messageId;
            conversation.participants[participantIndex].unreadCount = 0;
            await conversation.save();
        }

        return conversation;
    }

    // Increment unread count for participants
    async incrementUnreadCount(conversationId, excludeUserId) {
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return;
        }

        conversation.participants.forEach(participant => {
            if (participant.userId.toString() !== excludeUserId.toString()) {
                participant.unreadCount = (participant.unreadCount || 0) + 1;
            }
        });

        conversation.lastMessageAt = new Date();
        await conversation.save();
    }

    // Delete conversation
    async deleteConversation(conversationId, userId) {
        const conversation = await Conversation.findOne({
            _id: conversationId,
            'participants.userId': userId
        });

        if (!conversation) {
            throw new Error('Conversation not found or access denied');
        }

        // For direct conversations, just mark as inactive
        if (conversation.type === 'direct') {
            conversation.isActive = false;
            await conversation.save();
        } else {
            // For groups, check if user is admin
            const participant = conversation.getParticipant(userId);
            if (participant.role !== 'admin') {
                throw new Error('Only admins can delete group conversations');
            }
            conversation.isActive = false;
            await conversation.save();
        }

        return { message: 'Conversation deleted successfully' };
    }

    // Search conversations
    async searchConversations(userId, searchQuery) {
        const conversations = await Conversation.find({
            'participants.userId': userId,
            isActive: true,
            $or: [
                { name: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } }
            ]
        })
            .sort({ lastMessageAt: -1 })
            .limit(20)
            .populate('participants.userId', 'firstName lastName email profilePicture')
            .lean();

        return conversations;
    }
}

module.exports = new ConversationService();
