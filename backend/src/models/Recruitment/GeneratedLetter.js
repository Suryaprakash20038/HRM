const mongoose = require('mongoose');

const generatedLetterSchema = new mongoose.Schema({
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LetterTemplate',
        required: true
    },
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate'
    },
    letterType: {
        type: String,
        required: true
    },
    fieldsData: {
        type: Object, // Stores the dynamic data (Name, Role, Date, etc.)
        default: {}
    },
    generatedPath: {
        type: String, // Path to the saved PDF in uploads/generated/
        required: true
    },
    sentAt: {
        type: Date,
        default: Date.now
    },
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('GeneratedLetter', generatedLetterSchema);
