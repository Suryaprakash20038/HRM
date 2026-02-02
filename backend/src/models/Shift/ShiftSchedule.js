const mongoose = require('mongoose');

const shiftScheduleSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    shift: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shift',
        default: null
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'Regular'
    },
    isDoubleShift: {
        type: Boolean,
        default: false
    },
    employeeName: String, // Denormalized for simpler queries
    department: String    // Denormalized for simpler queries
}, {
    timestamps: true
});

// Index for efficient querying of an employee's schedule
shiftScheduleSchema.index({ employee: 1, date: 1 });

module.exports = mongoose.model('ShiftSchedule', shiftScheduleSchema);
