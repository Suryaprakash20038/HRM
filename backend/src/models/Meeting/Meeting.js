const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    dailyRoomUrl: {
        type: String,
        trim: true
    },
    dailyRoomName: {
        type: String,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    allowedRoles: [{
        type: String,
        enum: ['Admin', 'HR', 'Employee', 'Manager', 'Team Lead'],
        default: ['Admin', 'HR', 'Employee', 'Manager', 'Team Lead']
    }],
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ['scheduled', 'active', 'ended'],
        default: 'active'
    },
    password: {
        type: String, // Optional password for the meeting
        select: false // Do not return by default
    },
    settings: {
        startWithAudioMuted: {
            type: Boolean,
            default: true
        },
        startWithVideoMuted: {
            type: Boolean,
            default: true
        },
        lobbyMode: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
});

// Index for faster queries
meetingSchema.index({ roomId: 1 });
meetingSchema.index({ status: 1 });
meetingSchema.index({ host: 1 });

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;
