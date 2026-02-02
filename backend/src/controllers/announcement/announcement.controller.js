const Announcement = require('../../models/Announcement/Announcement');
const Employee = require('../../models/Employee/Employee');
const { successResponse, errorResponse } = require('../../utils/response');

const logger = require('../../utils/logger');
const { sendNotification } = require('../../services/notification.service');
const User = require('../../models/User/User');

exports.getAllAnnouncements = async (req, res) => {
    try {
        const { priority, targetAudience, page = 1, limit = 10 } = req.query;
        const query = { isActive: true };

        if (priority) query.priority = priority;
        if (targetAudience) query.targetAudience = targetAudience;

        const announcements = await Announcement.find(query)
            .populate('createdBy', 'firstName lastName')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ publishDate: -1 });

        const total = await Announcement.countDocuments(query);

        return successResponse(res, {
            announcements,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        }, 'Announcements retrieved successfully');

    } catch (error) {
        logger.error('Get all announcements error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.getAnnouncementById = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id)
            .populate('createdBy', 'firstName lastName email');

        if (!announcement) {
            return errorResponse(res, 'Announcement not found', 404);
        }

        return successResponse(res, { announcement }, 'Announcement retrieved successfully');

    } catch (error) {
        logger.error('Get announcement by ID error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.createAnnouncement = async (req, res) => {
    try {
        let imageUrl = '';
        if (req.files && req.files['image'] && req.files['image'][0]) {
            imageUrl = req.files['image'][0].path;
        }

        const announcementData = { ...req.body, createdBy: req.user.id, imageUrl };
        const announcement = await Announcement.create(announcementData);

        logger.info(`New announcement created: ${announcement.title}`);

        // Notify Employees
        try {
            let targetUsers = [];
            if (announcementData.targetAudience === 'All') {
                targetUsers = await Employee.find({ userId: { $exists: true } }).select('userId');
            } else if (announcementData.targetAudience === 'Department' && announcementData.departments) {
                targetUsers = await Employee.find({
                    department: { $in: announcementData.departments },
                    userId: { $exists: true }
                }).select('userId');
            }

            for (const emp of targetUsers) {
                // Do not notify the creator (Admin)
                if (emp.userId && emp.userId.toString() === req.user.id.toString()) continue;

                await sendNotification({
                    userId: emp.userId,
                    title: 'New Announcement',
                    message: announcementData.title,
                    type: 'info',
                    link: '/employee/announcements'
                });
            }
        } catch (notifWarn) {
            logger.warn('Failed to send announcement notifications', notifWarn);
        }

        return successResponse(res, { announcement }, 'Announcement created successfully', 201);

    } catch (error) {
        logger.error('Create announcement error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.updateAnnouncement = async (req, res) => {
    try {
        let updateData = { ...req.body };
        if (req.files && req.files['image'] && req.files['image'][0]) {
            updateData.imageUrl = req.files['image'][0].path;
        }

        const announcement = await Announcement.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!announcement) {
            return errorResponse(res, 'Announcement not found', 404);
        }

        logger.info(`Announcement updated: ${announcement.title}`);

        return successResponse(res, { announcement }, 'Announcement updated successfully');

    } catch (error) {
        logger.error('Update announcement error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!announcement) {
            return errorResponse(res, 'Announcement not found', 404);
        }

        logger.info(`Announcement deactivated: ${announcement.title}`);

        return successResponse(res, { announcement }, 'Announcement deactivated successfully');

    } catch (error) {
        logger.error('Delete announcement error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.getEmployeeAnnouncements = async (req, res) => {
    try {
        let { department, page = 1, limit = 10 } = req.query;

        // 🛡️ Robust Fallback: Check department from DB if not provided
        if (!department && req.user) {
            const employee = await Employee.findOne({ userId: req.user.id });
            if (employee) {
                department = employee.department;
            }
        }

        // Build query to get announcements for 'All' or specific department
        const query = {
            isActive: true,
            $or: [
                { targetAudience: 'All' },
                { targetAudience: 'Department', departments: department }
            ]
        };

        const announcements = await Announcement.find(query)
            .populate('createdBy', 'firstName lastName')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ publishDate: -1 });

        const total = await Announcement.countDocuments(query);

        return successResponse(res, {
            announcements,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        }, 'Employee announcements retrieved successfully');

    } catch (error) {
        logger.error('Get employee announcements error:', error);
        return errorResponse(res, error.message, 500);
    }
};
