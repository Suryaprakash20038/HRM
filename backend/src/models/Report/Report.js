const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reportType: {
        type: String,
        required: true,
        enum: ['Attendance', 'Leave', 'Payroll', 'Employee', 'Performance', 'Custom']
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    generatedDate: {
        type: Date,
        default: Date.now
    },
    dateRange: {
        startDate: Date,
        endDate: Date
    },
    filters: {
        type: mongoose.Schema.Types.Mixed
    },
    data: {
        type: mongoose.Schema.Types.Mixed
    },
    format: {
        type: String,
        enum: ['PDF', 'Excel', 'JSON'],
        default: 'PDF'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
