const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    experience: {
        type: Number,
        default: 0
    },
    linkedin: {
        type: String,
        trim: true
    },
    appliedFor: {
        type: String, // Role
        required: true
    },
    currentSalary: {
        type: Number
    },
    expectedSalary: {
        type: Number
    },
    source: {
        type: String,
        default: 'Job Portal'
    },
    referralName: {
        type: String
    },
    status: {
        type: String,
        enum: ['New', 'Screening', 'Interviewing', 'Selected', 'Rejected', 'JD Not Available'], // Added 'JD Not Available'
        default: 'New'
    },
    resume: {
        type: String // File name
    },
    resumeLink: {
        type: String, // Google Drive or external link
        trim: true
    },
    resumeBase64: {
        type: String // File content (Base64)
    },
    resumeDriveFileId: {
        type: String, // Unique Google Drive File ID
        sparse: true
    },
    // New Fields for ATS
    atsScore: {
        type: Number,
        default: 0
    },
    atsScoreBreakdown: {
        skillsMatch: { type: Number, default: 0 },
        experienceRelevance: { type: Number, default: 0 },
        domainMatch: { type: Number, default: 0 },
        projectScore: { type: Number, default: 0 },
        certificationScore: { type: Number, default: 0 }
    },
    isFresher: {
        type: Boolean,
        default: false
    },
    matchedSkills: [{
        type: String
    }],
    missingSkills: [{
        type: String
    }],
    extractedSkills: [{
        type: String
    }],
    extractedExperience: {
        type: Number, // Years extracted from resume text
        default: 0
    },
    projects: [{
        title: String,
        description: String
    }],
    certifications: [{
        name: String,
        issuer: String,
        year: String
    }],
    companies: [{
        name: String,
        role: String,
        duration: String, // e.g., "2 years"
        domain: String
    }],
    internships: [{
        company: String,
        domain: String,
        duration: String
    }],
    resumeText: {
        type: String, // Extracted text from resume for internal use
        select: false // Do not return by default
    },
    jobDescription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobDescription'
    },
    // Interview Details
    interviewDetails: {
        date: Date,
        time: String,
        mode: { type: String, enum: ['Online', 'Offline', 'Telephone'], default: 'Online' },
        link: String, // For Online
        location: String, // For Offline
        round: String // e.g. Technical, HR
    },
    // Offer Details
    offerDetails: {
        ctc: String,
        joiningDate: Date,
        sentAt: Date
    },
    // Appointment Details
    appointmentDetails: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
        ctc: String,
        joiningDate: Date
    },
    googleFormResponseId: {
        type: String, // Unique ID from Google Sheet/Form
        unique: true,
        sparse: true // Allow null for manually created candidates
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Candidate', candidateSchema);
