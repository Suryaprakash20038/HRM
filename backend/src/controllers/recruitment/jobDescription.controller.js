const JobDescription = require('../../models/Recruitment/JobDescription');
const { successResponse, errorResponse } = require('../../utils/response');
const logger = require('../../utils/logger');

exports.createJobDescription = async (req, res) => {
    try {
        const jd = await JobDescription.create(req.body);
        return successResponse(res, { jd }, 'Job Description created successfully', 201);
    } catch (error) {
        logger.error('Create JD error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.getAllJobDescriptions = async (req, res) => {
    try {
        const query = {};
        if (req.query.status) query.status = req.query.status;

        const jds = await JobDescription.find(query).sort({ createdAt: -1 });
        return successResponse(res, { jds }, 'Job Descriptions retrieved successfully');
    } catch (error) {
        logger.error('Get JDs error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.updateJobDescription = async (req, res) => {
    try {
        const jd = await JobDescription.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!jd) return errorResponse(res, 'Job Description not found', 404);
        return successResponse(res, { jd }, 'Job Description updated successfully');
    } catch (error) {
        logger.error('Update JD error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.deleteJobDescription = async (req, res) => {
    try {
        const jd = await JobDescription.findByIdAndDelete(req.params.id);
        if (!jd) return errorResponse(res, 'Job Description not found', 404);
        return successResponse(res, null, 'Job Description deleted successfully');
    } catch (error) {
        logger.error('Delete JD error:', error);
        return errorResponse(res, error.message, 500);
    }
};
