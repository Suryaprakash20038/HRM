const mongoose = require('mongoose');
require('dotenv').config();

const recruitmentSettingsSchema = new mongoose.Schema({
    googleSpreadsheetId: { type: String, default: '' },
    syncFrequencyMinutes: { type: Number, default: 60 },
    lastSyncTime: { type: Date, default: null },
    isAutoSyncEnabled: { type: Boolean, default: false }
}, { timestamps: true });

const RecruitmentSettings = mongoose.model('RecruitmentSettings', recruitmentSettingsSchema);

const fixFreq = async () => {
    try {
        const uri = 'mongodb+srv://HRD:surya2003@cluster0.nguvijg.mongodb.net/?appName=Cluster0';
        await mongoose.connect(uri);

        let settings = await RecruitmentSettings.findOne();
        if (!settings) {
            console.log('No settings found. Please save settings from UI first.');
        } else {
            console.log(`Current Frequency: ${settings.syncFrequencyMinutes}`);
            if (settings.syncFrequencyMinutes !== 0.5) {
                console.log('Updating frequency to 0.5 (30 seconds)...');
                settings.syncFrequencyMinutes = 0.5;
                settings.isAutoSyncEnabled = true;
                await settings.save();
                console.log('✅ Updated successfully! Auto-sync is ON.');
            } else {
                console.log('✅ Frequency is already 0.5');
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

fixFreq();
