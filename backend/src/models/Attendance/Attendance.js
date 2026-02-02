const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date
    },
    totalHours: {
        type: Number,
        default: 0
    },
    overtime: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Late', 'Half-day', 'On Leave', 'Early Checkout'],
        default: 'Present'
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

attendanceSchema.pre('save', function (next) {
    if (this.checkOut && this.checkIn) {
        const diff = this.checkOut - this.checkIn;
        this.totalHours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
    }
    next();
});

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
