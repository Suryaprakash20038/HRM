const logger = require('../utils/logger');
const Notification = require('../models/Notification/Notification');
const User = require('../models/User/User');
const Employee = require('../models/Employee/Employee'); // Needed for resolving userIds
const socketService = require('./socket.service');

// Send in-app notification (stored in DB)
const sendNotification = async ({ userId, title, message, type = 'info', link = null }) => {
    try {
        if (!userId) {
            logger.warn('Notification skipped: No userId provided');
            return { success: false, error: 'No userId provided' };
        }

        const notification = await Notification.create({
            userId,
            title,
            message,
            type,
            link
        });

        // Real-time notification via Socket.io
        socketService.emitToUser(userId, 'new_notification', notification);

        logger.info(`Notification sent to user ${userId}: ${title}`);

        return {
            success: true,
            notification
        };

    } catch (error) {
        logger.error('Notification error:', error);
        // Don't throw error to avoid blocking main flow
        return { success: false, error: error.message };
    }
};

// Notify all Admins
const notifyAdmins = async ({ title, message, type = 'info', link = null }) => {
    try {
        const admins = await User.find({ role: 'admin' }).select('_id');
        const notifications = admins.map(admin => ({
            userId: admin._id,
            title,
            message,
            type,
            link,
            isRead: false
        }));

        if (notifications.length > 0) {
            const savedNotifs = await Notification.insertMany(notifications);

            // Real-time notifications for each admin
            savedNotifs.forEach(notif => {
                socketService.emitToUser(notif.userId, 'new_notification', notif);
            });

            logger.info(`Notified ${notifications.length} admins: ${title}`);
        }
    } catch (error) {
        logger.error('Error notifying admins:', error);
    }
};


// Send leave notification
const sendLeaveNotification = async (leave, employee, action) => {
    return sendNotification({
        userId: employee.userId,
        title: `Leave Request ${action}`,
        message: `Your ${leave.leaveType} request from ${new Date(leave.startDate).toLocaleDateString()} has been ${action.toLowerCase()}.`,
        type: action === 'Approved' ? 'success' : action === 'Rejected' ? 'error' : 'info',
        link: '/employee/leave'
    });
};

// Send attendance notification
const sendAttendanceNotification = async (employee, action) => {
    return sendNotification({
        userId: employee.userId,
        title: `Attendance ${action}`,
        message: `You have successfully ${action.toLowerCase()} at ${new Date().toLocaleTimeString()}.`,
        type: 'success',
        link: '/employee/attendance'
    });
};

// Send task assignment notification
const sendTaskNotification = async (task, employee) => {
    return sendNotification({
        userId: employee.userId,
        title: 'New Task Assigned',
        message: `You have been assigned a new task: ${task.taskName}`,
        type: 'info',
        link: `/employee/tasks`
    });
};

// Send announcement notification
const sendAnnouncementNotification = async (announcement, employees) => {
    // Only target employees with valid userIds
    const validEmployees = employees.filter(e => e.userId);

    const notifications = validEmployees.map(employee => ({
        userId: employee.userId,
        title: announcement.title,
        message: announcement.title, // or truncate content
        type: announcement.priority === 'Urgent' ? 'warning' : 'info',
        link: '/employee/announcements',
        isRead: false
    }));

    if (notifications.length > 0) {
        await Notification.insertMany(notifications);
    }
};

// Send shift notification
const sendShiftNotification = async (employeeIds, startDate, endDate) => {
    try {
        // Find employees to get their User IDs
        const employees = await Employee.find({ _id: { $in: employeeIds } }).select('userId firstName email');

        const notifications = [];
        for (const emp of employees) {
            let targetUserId = emp.userId;

            // Fallback to email lookup if userId is missing (sanity check)
            if (!targetUserId && emp.email) {
                const user = await User.findOne({ email: emp.email }).select('_id');
                if (user) targetUserId = user._id;
            }

            if (targetUserId) {
                notifications.push({
                    userId: targetUserId,
                    title: 'New Shift Schedule',
                    message: `You have new shifts assigned from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}.`,
                    type: 'info',
                    link: '/employee/dashboard',
                    isRead: false
                });
            }
        }

        if (notifications.length > 0) {
            const savedNotifs = await Notification.insertMany(notifications);

            // Real-time notifications
            savedNotifs.forEach(notif => {
                socketService.emitToUser(notif.userId, 'new_notification', notif);
            });

            logger.info(`Notified ${notifications.length} employees of shift assignment`);
        }
    } catch (error) {
        logger.error('Error sending shift notifications:', error);
    }
};

// Send meeting notification
const sendMeetingNotification = async (meeting) => {
    try {
        const host = await User.findById(meeting.host).select('firstName lastName');
        const hostName = host ? `${host.firstName} ${host.lastName}` : 'Someone';

        const notifications = [];

        // If specific participants are invited
        if (meeting.participants && meeting.participants.length > 0) {
            meeting.participants.forEach(userId => {
                // Don't notify the host
                if (userId.toString() !== meeting.host.toString()) {
                    notifications.push({
                        userId,
                        title: 'New Meeting Invitation',
                        message: `${hostName} has invited you to a meeting: ${meeting.title}`,
                        type: 'info',
                        link: '/employee/meetings', // Corrected path
                        isRead: false
                    });
                }
            });
        } else if (meeting.allowedRoles && meeting.allowedRoles.length > 0) {
            // If no participants, notify all users with allowed roles
            const usersWithRoles = await User.find({ role: { $in: meeting.allowedRoles } }).select('_id');
            usersWithRoles.forEach(u => {
                if (u._id.toString() !== meeting.host.toString()) {
                    notifications.push({
                        userId: u._id,
                        title: 'New Meeting Scheduled',
                        message: `A new meeting '${meeting.title}' has been scheduled for ${meeting.allowedRoles.join(', ')}.`,
                        type: 'info',
                        link: '/employee/meetings',
                        isRead: false
                    });
                }
            });
        }

        if (notifications.length > 0) {
            const savedNotifs = await Notification.insertMany(notifications);

            // Real-time notifications
            savedNotifs.forEach(notif => {
                socketService.emitToUser(notif.userId, 'new_notification', notif);
            });

            logger.info(`Notified ${notifications.length} users of meeting: ${meeting.title}`);
        }
    } catch (error) {
        logger.error('Error sending meeting notifications:', error);
    }
};

module.exports = {
    sendNotification,
    notifyAdmins,
    sendLeaveNotification,
    sendAttendanceNotification,
    sendTaskNotification,
    sendAnnouncementNotification,
    sendShiftNotification,
    sendMeetingNotification
};
