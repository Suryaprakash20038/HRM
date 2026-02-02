const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    platform: {
        type: String,
        enum: ['Facebook', 'Instagram', 'LinkedIn', 'Twitter', 'YouTube', 'Other'],
        required: true
    },
    postLink: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    image: {
        type: String // Path to uploaded image
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Media', mediaSchema);
