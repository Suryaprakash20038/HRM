const mongoose = require('mongoose');
require('dotenv').config();

const recruitmentSettingsSchema = new mongoose.Schema({
    googleSpreadsheetId: { type: String, default: '' },
    syncFrequencyMinutes: { type: Number, default: 60 },
    lastSyncTime: { type: Date, default: null },
    isAutoSyncEnabled: { type: Boolean, default: false }
}, { timestamps: true });

const RecruitmentSettings = mongoose.model('RecruitmentSettings', recruitmentSettingsSchema);

const checkSettings = async () => {
    try {
        const uri = 'mongodb+srv://HRD:surya2003@cluster0.nguvijg.mongodb.net/?appName=Cluster0';
        await mongoose.connect(uri);

        let settings = await RecruitmentSettings.findOne();
        if (!settings) {
            console.log('No settings found.');
        } else {
            console.log('--- Current Settings ---');
            console.log(`Auto Sync Enabled: ${settings.isAutoSyncEnabled}`);
            console.log(`Sync Frequency: ${settings.syncFrequencyMinutes} minutes`);
            console.log(`Last Sync Time: ${settings.lastSyncTime}`);
            console.log(`Current Time:   ${new Date()}`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkSettings();
