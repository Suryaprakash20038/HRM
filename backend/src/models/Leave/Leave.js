const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    leaveType: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    totalDays: {
        type: Number,
        default: 0
    },
    reason: {
        type: String,
        required: [true, 'Reason is required'],
        trim: true
    },
    documentUrl: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    currentStage: {
        type: String,
        enum: ['TeamLead', 'Manager', 'HR', 'Completed'],
        default: 'TeamLead'
    },
    approvalChain: {
        teamLead: {
            status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
            date: Date,
            by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            comment: String
        },
        manager: {
            status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
            date: Date,
            by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            comment: String
        },
        hr: {
            status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
            date: Date,
            by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            comment: String
        }
    },
    rejectionReason: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

leaveSchema.pre('validate', function (next) {
    if (this.startDate && this.endDate) {
        const diff = this.endDate - this.startDate;
        this.totalDays = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    }
    next();
});

module.exports = mongoose.model('Leave', leaveSchema);
