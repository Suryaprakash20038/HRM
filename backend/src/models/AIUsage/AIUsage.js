const mongoose = require('mongoose');

const aiUsageSchema = new mongoose.Schema({
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true,
        unique: true,
        index: true
    },
    requestCount: {
        type: Number,
        default: 0
    },
    requests: [{
        timestamp: { type: Date, default: Date.now },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        intent: String,
        tokens: Number
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('AIUsage', aiUsageSchema);
