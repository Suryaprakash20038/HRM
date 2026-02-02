const mongoose = require('mongoose');
const recruitmentService = require('./src/services/recruitment.service');
const RecruitmentSettings = require('./src/models/Recruitment/RecruitmentSettings');
const googleService = require('./src/services/google.service');
const logger = require('./src/utils/logger');
require('dotenv').config();

// Mock Logger to see output in console
logger.info = console.log;
logger.error = console.error;
logger.warn = console.warn;

const runDebug = async () => {
    try {
        const uri = 'mongodb+srv://HRD:surya2003@cluster0.nguvijg.mongodb.net/?appName=Cluster0';
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const settings = await RecruitmentSettings.findOne();
        if (!settings || !settings.googleSpreadsheetId) {
            console.error('No Spreadsheet ID found in settings.');
            return;
        }

        console.log(`Syncing Sheet ID: ${settings.googleSpreadsheetId}`);

        // Manually fetch data to inspect headers
        try {
            const rows = await googleService.getSheetData(settings.googleSpreadsheetId, 'Form Responses 1!A1:Z');
            const headers = rows[0].map(h => h.toLowerCase().trim());
            console.log('--- SHEET HEADERS FOUND ---');
            console.log(headers);
            console.log('---------------------------');

            // Run the actual sync logic function
            const result = await recruitmentService.syncCandidates(settings.googleSpreadsheetId);
            console.log('Sync Result:', result);

        } catch (err) {
            console.error('Error during manual sync:', err);
        }

    } catch (error) {
        console.error('Fatal Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

runDebug();
