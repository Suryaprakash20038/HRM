const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    messageType: {
        type: String,
        enum: ['text', 'file', 'image', 'system'],
        default: 'text',
        required: true
    },
    content: {
        type: String,
        trim: true
    },
    attachments: [{
        fileUrl: {
            type: String,
            required: true
        },
        fileName: {
            type: String,
            required: true
        },
        fileType: {
            type: String,
            required: true
        },
        fileSize: {
            type: Number
        },
        thumbnailUrl: {
            type: String
        }
    }],
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    mentions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    reactions: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        emoji: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        sent: {
            type: Boolean,
            default: true
        },
        delivered: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            deliveredAt: {
                type: Date,
                default: Date.now
            }
        }],
        read: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            readAt: {
                type: Date,
                default: Date.now
            }
        }]
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes for performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ mentions: 1 });
messageSchema.index({ conversationId: 1, isDeleted: 1, createdAt: -1 });

// Virtual for checking if message is delivered to a user
messageSchema.methods.isDeliveredTo = function (userId) {
    return this.status.delivered.some(d => d.userId.toString() === userId.toString());
};

// Virtual for checking if message is read by a user
messageSchema.methods.isReadBy = function (userId) {
    return this.status.read.some(r => r.userId.toString() === userId.toString());
};

// Method to mark as delivered
messageSchema.methods.markDelivered = function (userId) {
    if (!this.isDeliveredTo(userId)) {
        this.status.delivered.push({
            userId,
            deliveredAt: new Date()
        });
    }
    return this;
};

// Method to mark as read
messageSchema.methods.markRead = function (userId) {
    if (!this.isReadBy(userId)) {
        this.status.read.push({
            userId,
            readAt: new Date()
        });
        // Also mark as delivered if not already
        this.markDelivered(userId);
    }
    return this;
};

// Method to add reaction
messageSchema.methods.addReaction = function (userId, emoji) {
    // Remove existing reaction from this user
    this.reactions = this.reactions.filter(
        r => r.userId.toString() !== userId.toString() || r.emoji !== emoji
    );

    // Add new reaction
    this.reactions.push({
        userId,
        emoji,
        createdAt: new Date()
    });

    return this;
};

// Method to remove reaction
messageSchema.methods.removeReaction = function (userId, emoji) {
    this.reactions = this.reactions.filter(
        r => !(r.userId.toString() === userId.toString() && r.emoji === emoji)
    );
    return this;
};

// Static method to get unread count for a user in a conversation
messageSchema.statics.getUnreadCount = async function (conversationId, userId, lastReadMessageId) {
    const query = {
        conversationId,
        senderId: { $ne: userId },
        isDeleted: false
    };

    if (lastReadMessageId) {
        const lastReadMessage = await this.findById(lastReadMessageId);
        if (lastReadMessage) {
            query.createdAt = { $gt: lastReadMessage.createdAt };
        }
    }

    return await this.countDocuments(query);
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
