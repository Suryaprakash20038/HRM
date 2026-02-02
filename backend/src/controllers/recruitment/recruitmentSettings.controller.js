const RecruitmentSettings = require('../../models/Recruitment/RecruitmentSettings');
const { successResponse, errorResponse } = require('../../utils/response');
const logger = require('../../utils/logger');
const recruitmentService = require('../../services/recruitment.service');

exports.getSettings = async (req, res) => {
    try {
        const settings = await RecruitmentSettings.getSettings();
        return successResponse(res, settings, 'Settings retrieved successfully');
    } catch (error) {
        logger.error('Get Recruitment Settings Error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const updates = req.body;
        const settings = await RecruitmentSettings.getSettings();

        // Update fields
        // Update fields
        if (updates.googleSpreadsheetId !== undefined) {
            // Support full URL by extracting ID
            const urlPattern = /\/d\/([a-zA-Z0-9-_]+)/;
            const match = updates.googleSpreadsheetId.match(urlPattern);
            settings.googleSpreadsheetId = match ? match[1] : updates.googleSpreadsheetId;
        }
        if (updates.syncFrequencyMinutes !== undefined) settings.syncFrequencyMinutes = updates.syncFrequencyMinutes;
        if (updates.isAutoSyncEnabled !== undefined) settings.isAutoSyncEnabled = updates.isAutoSyncEnabled;

        await settings.save();

        return successResponse(res, settings, 'Settings updated successfully');
    } catch (error) {
        logger.error('Update Recruitment Settings Error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.triggerManualSync = async (req, res) => {
    try {
        const settings = await RecruitmentSettings.getSettings();
        let spreadsheetId = req.body.googleSpreadsheetId || settings.googleSpreadsheetId;

        // Support full URL extraction if provided in body
        if (req.body.googleSpreadsheetId) {
            const urlPattern = /\/d\/([a-zA-Z0-9-_]+)/;
            const match = req.body.googleSpreadsheetId.match(urlPattern);
            if (match) spreadsheetId = match[1];
        }

        if (!spreadsheetId) {
            return errorResponse(res, 'Google Spreadsheet ID is not configured.', 400);
        }

        // Trigger Sync
        logger.info('Manual Sync Triggered with Spreadsheet ID:', spreadsheetId);
        const result = await recruitmentService.syncCandidates(spreadsheetId);

        // Update last sync time (only if we used the stored settings ID, or just update it anyway? 
        // Let's update it anyway as a record of activity)
        settings.lastSyncTime = new Date();
        await settings.save();

        return successResponse(res, result, 'Manual sync completed successfully');
    } catch (error) {
        logger.error('Manual Sync Error:', error);
        return errorResponse(res, error.message, 500);
    }
};
