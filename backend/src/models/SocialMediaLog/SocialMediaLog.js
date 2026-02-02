const mongoose = require('mongoose');

const socialMediaLogSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    platform: {
        type: String,
        required: true,
        enum: ['Facebook', 'Instagram', 'LinkedIn', 'Twitter', 'YouTube', 'Other']
    },
    postLink: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    postImage: {
        type: String // URL/Path to uploaded image
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SocialMediaLog', socialMediaLogSchema);
