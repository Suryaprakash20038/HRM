const Report = require('../../models/Report/Report');
const Employee = require('../../models/Employee/Employee');
const Attendance = require('../../models/Attendance/Attendance');
const Leave = require('../../models/Leave/Leave');
const Payroll = require('../../models/Payroll/Payroll');
const { successResponse, errorResponse } = require('../../utils/response');
const logger = require('../../utils/logger');

exports.generateReport = async (req, res) => {
    try {
        const { reportType, dateRange, filters, format } = req.body;

        let data = {};

        switch (reportType) {
            case 'Attendance':
                data = await Attendance.find({
                    date: {
                        $gte: new Date(dateRange.startDate),
                        $lte: new Date(dateRange.endDate)
                    },
                    ...filters
                }).populate('employee', 'firstName lastName employeeId');
                break;

            case 'Leave':
                data = await Leave.find({
                    startDate: {
                        $gte: new Date(dateRange.startDate),
                        $lte: new Date(dateRange.endDate)
                    },
                    ...filters
                }).populate('employee', 'firstName lastName employeeId');
                break;

            case 'Payroll':
                data = await Payroll.find(filters)
                    .populate('employee', 'firstName lastName employeeId');
                break;

            case 'Employee':
                data = await Employee.find(filters);
                break;

            default:
                return errorResponse(res, 'Invalid report type', 400);
        }

        const report = await Report.create({
            reportType,
            generatedBy: req.user.id,
            dateRange,
            filters,
            data,
            format: format || 'PDF'
        });

        logger.info(`Report generated: ${reportType}`);

        return successResponse(res, { report }, 'Report generated successfully', 201);

    } catch (error) {
        logger.error('Generate report error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.getAllReports = async (req, res) => {
    try {
        const { reportType, page = 1, limit = 10 } = req.query;
        const query = {};

        if (reportType) query.reportType = reportType;

        const reports = await Report.find(query)
            .populate('generatedBy', 'firstName lastName')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ generatedDate: -1 });

        const total = await Report.countDocuments(query);

        return successResponse(res, {
            reports,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        }, 'Reports retrieved successfully');

    } catch (error) {
        logger.error('Get all reports error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.getReportById = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate('generatedBy', 'firstName lastName email');

        if (!report) {
            return errorResponse(res, 'Report not found', 404);
        }

        return successResponse(res, { report }, 'Report retrieved successfully');

    } catch (error) {
        logger.error('Get report by ID error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.deleteReport = async (req, res) => {
    try {
        const report = await Report.findByIdAndDelete(req.params.id);

        if (!report) {
            return errorResponse(res, 'Report not found', 404);
        }

        logger.info(`Report deleted: ${report.reportType}`);

        return successResponse(res, null, 'Report deleted successfully');

    } catch (error) {
        logger.error('Delete report error:', error);
        return errorResponse(res, error.message, 500);
    }
};
