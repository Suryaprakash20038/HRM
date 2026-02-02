const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
    shiftName: {
        type: String,
        required: [true, 'Shift name is required'],
        trim: true
    },
    startTime: {
        type: String,
        required: [true, 'Start time is required']
    },
    endTime: {
        type: String,
        required: [true, 'End time is required']
    },
    breakDuration: {
        type: Number,
        default: 0
    },
    graceTime: {
        type: Number,
        default: 15 // in minutes
    },
    assignedEmployees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    }],
    shiftType: {
        type: String,
        enum: ['Day', 'Morning', 'Evening', 'Night', 'Rotational', 'Other'],
        default: 'Day'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Shift', shiftSchema);
