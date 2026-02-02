const SocialMediaLog = require('../../models/SocialMediaLog/SocialMediaLog');
const { successResponse, errorResponse } = require('../../utils/response');
const logger = require('../../utils/logger');

exports.createLog = async (req, res) => {
    try {
        const logData = { ...req.body, employee: req.user.employeeId }; // Assuming req.user has employeeId

        if (req.file) {
            logData.postImage = req.file.path;
        }

        const log = await SocialMediaLog.create(logData);
        logger.info(`Social media log created by: ${req.user.employeeId}`);
        return successResponse(res, { log }, 'Log created successfully', 201);
    } catch (error) {
        logger.error('Create social media log error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.getMyLogs = async (req, res) => {
    try {
        const logs = await SocialMediaLog.find({ employee: req.user.employeeId }).sort({ createdAt: -1 });
        return successResponse(res, { logs }, 'Logs retrieved successfully');
    } catch (error) {
        logger.error('Get my logs error:', error);
        return errorResponse(res, error.message, 500);
    }
};
