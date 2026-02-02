const Notification = require('../models/Notification/Notification');
const { successResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

exports.getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        // Fetch last 20 UNREAD notifications, newest first
        const notifications = await Notification.find({ userId, isRead: false })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        // Count unread
        const unreadCount = await Notification.countDocuments({ userId, isRead: false });

        return successResponse(res, { notifications, unreadCount }, 'Notifications retrieved');
    } catch (error) {
        logger.error('Get notifications error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await Notification.updateMany({ userId, isRead: false }, { isRead: true });
        return successResponse(res, null, 'Notifications cleared');
    } catch (error) {
        logger.error('Mark read error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.markOneRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        return successResponse(res, null, 'Notification marked read');
    } catch (error) {
        logger.error('Mark one read error:', error);
        return errorResponse(res, error.message, 500);
    }
};
