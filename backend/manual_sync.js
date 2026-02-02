const mongoose = require('mongoose');
const dotenv = require('dotenv');
const recruitmentService = require('./src/services/recruitment.service');
const googleService = require('./src/services/google.service');
const RecruitmentSettings = require('./src/models/Recruitment/RecruitmentSettings');

dotenv.config();

const runSync = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('DB Connected.');

        const settings = await RecruitmentSettings.findOne();
        if (!settings || !settings.googleSpreadsheetId) {
            console.error('No Spreadsheet ID found in settings.');
            return;
        }

        console.log(`Starting Sync for Sheet: ${settings.googleSpreadsheetId}`);
        const result = await recruitmentService.syncCandidates(settings.googleSpreadsheetId);
        console.log('Sync Complete:', result);

    } catch (error) {
        console.error('Sync Error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

runSync();
