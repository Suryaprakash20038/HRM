const mongoose = require('mongoose');

const dailyReportSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    title: { // Task/Report Title
        type: String,
        required: true
    },
    project: {
        type: String,
        required: true
    },
    department: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'In Progress', 'Overdue', 'Not Started'],
        default: 'Pending'
    },
    estHours: {
        type: Number,
        default: 0
    },
    actualHours: {
        type: Number,
        default: 0
    },
    startTime: Date,
    endTime: Date,
    remarks: {
        type: String
    },
    submissionTiming: {
        type: String,
        default: 'Regular Update'
    },
    taskDetails: {
        type: String,
        trim: true
    },
    uploadUrl: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DailyReport', dailyReportSchema);
