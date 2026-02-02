const mongoose = require('mongoose');
require('dotenv').config();
const RecruitmentSettings = require('./src/models/Recruitment/RecruitmentSettings');

const inspect = async () => {
    try {
        const uri = 'mongodb+srv://HRD:surya2003@cluster0.nguvijg.mongodb.net/?appName=Cluster0';
        await mongoose.connect(uri);
        // console.log('Connected.'); // Reduce noise

        const settings = await RecruitmentSettings.findOne();
        if (settings) {
            console.log(`SpreadsheetID: '${settings.googleSpreadsheetId}'`);
            console.log(`AutoSync: ${settings.isAutoSyncEnabled}`);
            console.log(`Freq: ${settings.syncFrequencyMinutes}`);
        } else {
            console.log('No Settings Found');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

inspect();
