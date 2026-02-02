const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    status: {
        type: String,
        enum: ['Intern', 'Probation', 'Confirmed', 'Resignation Submitted', 'Notice Period', 'Relieved', 'Terminated'],
        required: true
    },
    email: {
        type: String,
        default: ''
    },
    changedAt: {
        type: Date,
        default: Date.now
    },
    reason: {
        type: String,
        trim: true
    },
    // Optional: Keep daily status if needed, but user focused on employment status
    workMode: {
        type: String,
        enum: ['Office', 'Remote', 'Field', 'Client Site'],
        default: 'Office'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Status', statusSchema);
