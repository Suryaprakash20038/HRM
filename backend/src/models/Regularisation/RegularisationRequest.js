const mongoose = require('mongoose');

const regularisationRequestSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    timeLog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TimeLog'
    },
    date: {
        type: Date,
        required: true
    },
    originalCheckIn: Date,
    originalCheckOut: Date,
    newCheckIn: Date,
    newCheckOut: Date,
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    adminComment: String,
    actionBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('RegularisationRequest', regularisationRequestSchema);
