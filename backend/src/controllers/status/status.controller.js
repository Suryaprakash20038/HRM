const Status = require('../../models/Status/Status');
const { successResponse, errorResponse } = require('../../utils/response');
const logger = require('../../utils/logger');

exports.getEmployeeStatus = async (req, res) => {
    try {
        const status = await Status.findOne({ employee: req.params.employeeId })
            .populate('employee', 'firstName lastName employeeId');

        if (!status) {
            return errorResponse(res, 'Employee status not found', 404);
        }

        return successResponse(res, { status }, 'Employee status retrieved successfully');

    } catch (error) {
        logger.error('Get employee status error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.updateEmployeeStatus = async (req, res) => {
    try {
        const { currentStatus, workLocation, notes } = req.body;

        let status = await Status.findOne({ employee: req.params.employeeId });

        if (!status) {
            status = await Status.create({
                employee: req.params.employeeId,
                currentStatus,
                workLocation,
                notes
            });
        } else {
            status.currentStatus = currentStatus;
            status.workLocation = workLocation;
            status.notes = notes;
            status.lastUpdated = new Date();
            await status.save();
        }

        logger.info(`Employee status updated: ${req.params.employeeId}`);

        return successResponse(res, { status }, 'Employee status updated successfully');

    } catch (error) {
        logger.error('Update employee status error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.getStatusOverview = async (req, res) => {
    try {
        const statusOverview = await Status.aggregate([
            {
                $group: {
                    _id: '$currentStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        const workLocationOverview = await Status.aggregate([
            {
                $group: {
                    _id: '$workLocation',
                    count: { $sum: 1 }
                }
            }
        ]);

        return successResponse(res, {
            statusOverview,
            workLocationOverview
        }, 'Status overview retrieved successfully');

    } catch (error) {
        logger.error('Get status overview error:', error);
        return errorResponse(res, error.message, 500);
    }
};
