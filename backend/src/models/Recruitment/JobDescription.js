const mongoose = require('mongoose');

const jobDescriptionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    role: {
        type: String,
        required: true,
        trim: true
    },
    requiredSkills: [{
        type: String,
        trim: true
    }],
    experience: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Draft'],
        default: 'Active'
    },
    description: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Assuming there is a User model for admins
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('JobDescription', jobDescriptionSchema);
