const DailyReport = require('../../models/DailyReport/DailyReport');
const { successResponse, errorResponse } = require('../../utils/response');
const logger = require('../../utils/logger');
const Employee = require('../../models/Employee/Employee'); // Import Employee model
const User = require('../../models/User/User');
const { sendNotification } = require('../../services/notification.service');

exports.createReport = async (req, res) => {
    try {
        // Fetch employee details to get department
        const employee = await Employee.findOne({ _id: req.user.employeeId });
        if (!employee) {
            return errorResponse(res, 'Employee profile not found', 404);
        }

        const reportData = {
            ...req.body,
            employee: req.user.employeeId,
            department: employee.department // Auto-fill department
        };

        // Handle file upload
        if (req.file) {
            reportData.uploadUrl = req.file.path.replace(/\\/g, '/');
        }

        // Removed the "one per day" restriction to allow multiple task entries

        const report = await DailyReport.create(reportData);
        logger.info(`Daily report created by: ${req.user.employeeId}`);
        logger.info(`Daily report created by: ${req.user.employeeId}`);

        // Notify Admins
        try {
            const admins = await User.find({ role: { $in: ['admin', 'hr'] } });
            for (const admin of admins) {
                await sendNotification({
                    userId: admin._id,
                    title: 'New Daily Report',
                    message: `New daily report submitted by ${employee.firstName} ${employee.lastName}`,
                    type: 'info',
                    link: '/reports'
                });
            }
        } catch (err) {
            logger.warn('Failed to send daily report notification', err);
        }

        return successResponse(res, { report }, 'Report submitted successfully', 201);
    } catch (error) {
        logger.error('Create daily report error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.getMyReports = async (req, res) => {
    try {
        const reports = await DailyReport.find({ employee: req.user.employeeId }).sort({ createdAt: -1 });
        return successResponse(res, { reports }, 'Reports retrieved successfully');
    } catch (error) {
        logger.error('Get my reports error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.getAllReports = async (req, res) => {
    try {
        const { date, employee, status } = req.query;
        let query = {};

        if (date) {
            // Match date part
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            query.date = { $gte: start, $lte: end };
        }
        if (employee && employee !== 'all') query.employee = employee;
        if (status && status !== 'all') query.status = status;

        const reports = await DailyReport.find(query).populate('employee', 'firstName lastName profileImage department').sort({ date: -1 });
        return successResponse(res, { reports }, 'All reports retrieved successfully');
    } catch (error) {
        logger.error('Get all reports error:', error);
        return errorResponse(res, error.message, 500);
    }
};
