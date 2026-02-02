const mongoose = require('mongoose');

const recruitmentSettingsSchema = new mongoose.Schema({
    googleSpreadsheetId: {
        type: String,
        default: ''
    },
    syncFrequencyMinutes: {
        type: Number,
        default: 60 // Run every 60 minutes by default
    },
    lastSyncTime: {
        type: Date
    },
    isAutoSyncEnabled: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Ensure only one document exists
recruitmentSettingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

module.exports = mongoose.model('RecruitmentSettings', recruitmentSettingsSchema);
