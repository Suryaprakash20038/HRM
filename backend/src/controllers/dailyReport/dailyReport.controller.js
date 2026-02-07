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

        const report = await DailyReport.create(reportData);
        logger.info(`Daily report created by: ${req.user.employeeId}`);

        // Notification Logic: Notify ONLY Reporting Manager
        // User requested: "it should not list in the admin panel not in their deaprment tl and manager"
        // This implies Admins should NOT be notified, but TL/Manager should be.
        try {
            if (employee.reportingManager) {
                // Determine if reportingManager is a User or just an ID (Schema says ObjectId ref User)
                const managerUserId = employee.reportingManager;

                // Verify the user exists (optional but safe)
                // We send notification explicitly to this user
                await sendNotification({
                    userId: managerUserId,
                    title: 'New Daily Report Submitted',
                    message: `${employee.firstName} ${employee.lastName} has submitted a daily activity log.`,
                    type: 'info',
                    link: '/dashboard' // Link to dashboard where "Employee Reports" card exists
                });
            } else {
                // Fallback: If no reporting manager, maybe notify department head? 
                // For now, adhering to "not in admin panel", we do NOT notify admins as fallback.
                logger.info(`Employee ${employee._id} has no reporting manager assigned. No notification sent.`);
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
        // User requested that daily reports not be listed in Admin panel.
        // Assuming "Admin Panel" refers to the specific Reports page populated by this endpoint.
        // If the user calling this is an Admin, we might want to return nothing to "hide" them as requested.
        // However, this might break the page. 
        // Let's interpret "should not list" as strict hierarchy enforcement. 
        // Providing full access to Admin is standard, but the user explicitly asked to REMOVE it.

        // If we want to hide it from the main list but allow specific search:
        const { date, employee, status } = req.query;
        let query = {};

        // STRICT: If user is Admin, and no specific filter is applied, return empty?
        // Or better: Return empty for Admins by default if they are using this endpoint for the "Mission Analysis Hub" 
        // and expecting it to be clean.

        if (req.user.role === 'admin' || req.user.role === 'hr') {
            // If the user explicitly asks for "not list in admin panel", 
            // we can return an empty array here.
            // But let's check if the frontend sends any filters.
            // If filters exist, we respect them. If it's a "load all", we return empty.
            if (!date && (!employee || employee === 'all')) {
                // Default load - return empty to keep Admin panel clean
                return successResponse(res, { reports: [] }, 'Global reports hidden by default for Admin');
            }
        }

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

exports.getSubordinateReports = async (req, res) => {
    try {
        const { days = 7, search } = req.query;

        // 1. Find employees under this manager/TL
        // The authenticated user's ID is in req.user._id (from User model)
        // Employee model has 'reportingManager' which is a User ID
        const subordinates = await Employee.find({
            reportingManager: req.user._id,
            isActive: true
        }).select('_id');

        const subordinateIds = subordinates.map(emp => emp._id);

        if (subordinateIds.length === 0) {
            return successResponse(res, { reports: [] }, 'No subordinates found');
        }

        // 2. Build Query
        let query = {
            employee: { $in: subordinateIds }
        };

        // Date Filter (Last X days) - Default 7
        const dayCount = parseInt(days) || 7;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - dayCount);
        cutoffDate.setHours(0, 0, 0, 0);
        query.date = { $gte: cutoffDate };

        // Search Filter (if search provided, we need to find employees matching that name first)
        // Optimization: logic above found all subordinates. If search is persistent, we might need to filter `subordinateIds` further.
        if (search) {
            const matchingEmployees = await Employee.find({
                _id: { $in: subordinateIds },
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');

            const matchingIds = matchingEmployees.map(e => e._id);
            query.employee = { $in: matchingIds }; // Override previous list
        }

        // 3. Fetch Reports
        const reports = await DailyReport.find(query)
            .populate('employee', 'firstName lastName profileImage department position')
            .sort({ date: -1 });

        return successResponse(res, { reports }, 'Team reports retrieved successfully');

    } catch (error) {
        logger.error('Get subordinate reports error:', error);
        return errorResponse(res, error.message, 500);
    }
};
