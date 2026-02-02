const mongoose = require('mongoose');

const recruitmentSchema = new mongoose.Schema({
    jobTitle: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true
    },
    department: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    jobType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Intern'],
        default: 'Full-time'
    },
    description: {
        type: String,
        required: true
    },
    requirements: {
        type: String,
        required: true
    },
    salary: {
        type: String
    },
    postedDate: {
        type: Date,
        default: Date.now
    },
    deadline: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Open', 'Closed'],
        default: 'Open'
    },
    applicants: [{
        applicantName: String,
        email: String,
        phone: String,
        resume: String,
        applicationDate: {
            type: Date,
            default: Date.now
        },
        applicationStatus: {
            type: String,
            enum: ['Applied', 'Shortlisted', 'Interviewed', 'Hired', 'Rejected'],
            default: 'Applied'
        }
    }],
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Recruitment', recruitmentSchema);
