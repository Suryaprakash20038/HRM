const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['direct', 'group', 'department'],
        required: true,
        default: 'direct'
    },
    name: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    avatar: {
        type: String
    },
    participants: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['admin', 'member'],
            default: 'member'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        lastReadMessageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message'
        },
        unreadCount: {
            type: Number,
            default: 0
        },
        isMuted: {
            type: Boolean,
            default: false
        },
        mutedUntil: {
            type: Date
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    metadata: {
        department: String,
        isPinned: Boolean,
        tags: [String]
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for performance
conversationSchema.index({ 'participants.userId': 1, lastMessageAt: -1 });
conversationSchema.index({ type: 1, isActive: 1 });
conversationSchema.index({ 'metadata.department': 1 });

// Virtual for participant count
conversationSchema.virtual('participantCount').get(function () {
    return this.participants.length;
});

// Method to check if user is participant
conversationSchema.methods.isParticipant = function (userId) {
    return this.participants.some(p => p.userId.toString() === userId.toString());
};

// Method to get participant
conversationSchema.methods.getParticipant = function (userId) {
    return this.participants.find(p => p.userId.toString() === userId.toString());
};

// Method to add participant
conversationSchema.methods.addParticipant = function (userId, role = 'member') {
    if (!this.isParticipant(userId)) {
        this.participants.push({
            userId,
            role,
            joinedAt: new Date(),
            unreadCount: 0
        });
    }
    return this;
};

// Method to remove participant
conversationSchema.methods.removeParticipant = function (userId) {
    this.participants = this.participants.filter(
        p => p.userId.toString() !== userId.toString()
    );
    return this;
};

// Static method to find or create direct conversation
conversationSchema.statics.findOrCreateDirect = async function (user1Id, user2Id) {
    // Find existing direct conversation
    let conversation = await this.findOne({
        type: 'direct',
        isActive: true,
        'participants.userId': { $all: [user1Id, user2Id] },
        $expr: { $eq: [{ $size: '$participants' }, 2] }
    });

    if (!conversation) {
        // Create new direct conversation
        conversation = await this.create({
            type: 'direct',
            participants: [
                { userId: user1Id, role: 'member' },
                { userId: user2Id, role: 'member' }
            ],
            createdBy: user1Id,
            isActive: true
        });
    }

    return conversation;
};

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
