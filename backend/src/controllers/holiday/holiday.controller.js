const Holiday = require('../../models/Holiday/Holiday');
const { successResponse, errorResponse } = require('../../utils/response');
const logger = require('../../utils/logger');

exports.getAllHolidays = async (req, res) => {
    try {
        const { year, type } = req.query;
        const query = { isActive: true };

        if (type) query.type = type;

        if (year) {
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year, 11, 31);
            query.date = { $gte: startDate, $lte: endDate };
        }

        const holidays = await Holiday.find(query).sort({ date: 1 });

        return successResponse(res, { holidays }, 'Holidays retrieved successfully');

    } catch (error) {
        logger.error('Get all holidays error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.getHolidayById = async (req, res) => {
    try {
        const holiday = await Holiday.findById(req.params.id);

        if (!holiday) {
            return errorResponse(res, 'Holiday not found', 404);
        }

        return successResponse(res, { holiday }, 'Holiday retrieved successfully');

    } catch (error) {
        logger.error('Get holiday by ID error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.createHoliday = async (req, res) => {
    try {
        let imageUrl = '';
        if (req.files && req.files['image'] && req.files['image'][0]) {
            imageUrl = req.files['image'][0].path;
        }

        const holidayData = { ...req.body, imageUrl };
        const holiday = await Holiday.create(holidayData);

        logger.info(`New holiday created: ${holiday.holidayName}`);

        return successResponse(res, { holiday }, 'Holiday created successfully', 201);

    } catch (error) {
        logger.error('Create holiday error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.updateHoliday = async (req, res) => {
    try {
        let updateData = { ...req.body };
        if (req.files && req.files['image'] && req.files['image'][0]) {
            updateData.imageUrl = req.files['image'][0].path;
        }

        const holiday = await Holiday.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!holiday) {
            return errorResponse(res, 'Holiday not found', 404);
        }

        logger.info(`Holiday updated: ${holiday.holidayName}`);

        return successResponse(res, { holiday }, 'Holiday updated successfully');

    } catch (error) {
        logger.error('Update holiday error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.deleteHoliday = async (req, res) => {
    try {
        const holiday = await Holiday.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!holiday) {
            return errorResponse(res, 'Holiday not found', 404);
        }

        logger.info(`Holiday deactivated: ${holiday.holidayName}`);

        return successResponse(res, { holiday }, 'Holiday deactivated successfully');

    } catch (error) {
        logger.error('Delete holiday error:', error);
        return errorResponse(res, error.message, 500);
    }
};
