const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date
    },
    duration: {
        type: Number, // in minutes
        default: 0
    }
}, { _id: false });

const timeLogSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    shift: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shift' // Snapshot of the shift they were on that day
    },
    shiftSnapshot: {
        startTime: String,
        endTime: String,
        graceTime: Number,
        breakDuration: { type: Number, default: 0 } // Snapshot of break duration
    },
    sessions: [sessionSchema],
    grossWorkingHours: { // Total duration from sessions
        type: Number,
        default: 0
    },
    netWorkingHours: { // Gross - Break Deduction
        type: Number,
        default: 0
    },
    overtimeHours: { // Anything above 8 hours (or shift duration)
        type: Number,
        default: 0
    },
    attendanceStatus: {
        type: String,
        enum: ['Present', 'Half Day', 'Absent', 'Early Checkout'],
        default: 'Absent'
    },
    statusFlags: {
        properCheckIn: { type: Boolean, default: false },
        properCheckOut: { type: Boolean, default: false },
        autoLogout: { type: Boolean, default: false }, // System auto-closed session
        lateLogin: { type: Boolean, default: false },
        lateLoginReason: { type: String, default: '' },
        isLateLoginApproved: { type: Boolean, default: false },
        hasPermission: { type: Boolean, default: false }, // User Permission Claim
        earlyLogout: { type: Boolean, default: false },
        lateLogout: { type: Boolean, default: false } // Stayed later than shift end?
    }
}, {
    timestamps: true
});

// Middleware to calculate durations and flags on save
timeLogSchema.pre('save', function (next) {
    if (this.sessions && this.sessions.length > 0) {
        let totalMinutes = 0;
        this.sessions.forEach(session => {
            if (session.checkIn && session.checkOut) {
                const diff = new Date(session.checkOut) - new Date(session.checkIn);
                const minutes = Math.floor(diff / 60000);
                session.duration = minutes;
                totalMinutes += minutes;
            } else {
                session.duration = 0;
            }
        });

        // 1. Gross Hours
        this.grossWorkingHours = parseFloat((totalMinutes / 60).toFixed(2));

        // 2. Break Deduction
        const breakMins = (this.shiftSnapshot && this.shiftSnapshot.breakDuration) ? this.shiftSnapshot.breakDuration : 0;

        // 3. Net Hours
        // Only deduct break if they actually worked enough to cover it? 
        // Or strictly deduct? User rule: "Break time deduction". usually implies strict deduction or deduction if work crosses break time.
        // Simplified: Net = Total - Break (if Total > Break)
        let netMinutes = totalMinutes;
        if (totalMinutes > breakMins) {
            netMinutes = totalMinutes - breakMins;
        }
        this.netWorkingHours = parseFloat((netMinutes / 60).toFixed(2));

        // 4. Overtime Calculation (Threshold: 8 hours = 480 mins)
        // User Rule: "Daily required working hours: 8 hours"
        const requiredMins = 8 * 60;
        if (netMinutes > requiredMins) {
            this.overtimeHours = parseFloat(((netMinutes - requiredMins) / 60).toFixed(2));
        } else {
            this.overtimeHours = 0;
        }

        // 5. Determine Status
        if (this.netWorkingHours >= 8) {
            this.attendanceStatus = 'Present';
        } else if (this.netWorkingHours >= 6) {
            this.attendanceStatus = 'Early Checkout';
        } else if (this.netWorkingHours > 0) {
            this.attendanceStatus = 'Half Day';
        } else {
            this.attendanceStatus = 'Absent';
        }

    } else {
        this.grossWorkingHours = 0;
        this.netWorkingHours = 0;
        this.overtimeHours = 0;
        this.attendanceStatus = 'Absent';
    }
    next();
});

timeLogSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('TimeLog', timeLogSchema);
