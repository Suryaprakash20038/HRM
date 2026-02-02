const mongoose = require('mongoose');

const letterTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['Interview Call', 'Next Round', 'Offer', 'Rejection', 'Selection', 'Appointment', 'Experience', 'Relieving', 'Universal'],
        required: true
    },
    subject: {
        type: String, // Email Subject
        required: true
    },
    bodyContent: {
        type: String, // HTML Body with placeholders
        required: true
    },
    variables: [{
        type: String // List of placeholders used e.g. ["candidate_name"]
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isLocked: {
        type: Boolean,
        default: false // If true, only Super Admin can edit
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    pdfUrl: {
        type: String // Secure URL (Legacy / Backup)
    },
    localPath: {
        type: String // Local file path for direct access (Primary)
    },
    publicId: {
        type: String
    },
    resourceType: {
        type: String // Cloudinary resource_type (raw, image, etc.)
    },
    isFixedPdf: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('LetterTemplate', letterTemplateSchema);
