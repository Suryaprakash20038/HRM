const cron = require('node-cron');
const Employee = require('../models/Employee/Employee');
const logger = require('../utils/logger');

const initCronJobs = () => {
    // Run every day at midnight (00:00)
    cron.schedule('0 0 * * *', async () => {
        logger.info('Running cron job: Check Resignation Status');

        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Find employees in Notice Period whose final LWD has arrived or passed
            const employees = await Employee.find({
                status: 'Notice Period',
                'resignationData.finalLWD': { $lte: today }
            });

            for (const emp of employees) {
                emp.status = 'Exit Process';
                emp.resignationData.daysRemaining = 0;
                await emp.save();
                logger.info(`Employee ${emp.employeeId} - ${emp.firstName} ${emp.lastName} status updated to Relieved.`);
                // TODO: Send notification email to Employee and HR
            }
        } catch (error) {
            logger.error('Cron Job Error:', error);
        }
    });

    // Also run a job to update 'daysRemaining' for active notice periods
    cron.schedule('5 0 * * *', async () => {
        logger.info('Running cron job: Update Days Remaining');
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const employees = await Employee.find({ status: 'Notice Period' });

            for (const emp of employees) {
                if (emp.resignationData && emp.resignationData.finalLWD) {
                    const finalLWD = new Date(emp.resignationData.finalLWD);
                    finalLWD.setHours(0, 0, 0, 0);

                    const diffTime = finalLWD - today;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays >= 0) {
                        emp.resignationData.daysRemaining = diffDays;
                        await emp.save();
                    }
                }
            }
        } catch (error) {
            logger.error('Cron Job Error (Update Days):', error);
        }
    });
    // Run report reminder every 10 minutes
    cron.schedule('*/10 * * * *', async () => {
        logger.info('Running cron job: Report Update Reminder');
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Find active sessions (Checked In today, not Checked Out)
            const activeSessions = await require('../models/Attendance/Attendance').find({
                date: { $gte: today },
                checkOut: null,
                status: 'Present'
            }).populate({
                path: 'employee',
                select: 'userId firstName lastName'
            });

            const Notification = require('../models/Notification/Notification');

            for (const session of activeSessions) {
                if (!session.employee || !session.employee.userId) continue;

                const checkInTime = new Date(session.checkIn);
                const now = new Date();
                const diffMs = now - checkInTime;
                const hoursElapsed = diffMs / (1000 * 60 * 60);

                // Check if we are at a 2-hour interval (2h, 4h, 6h, 8h...)
                // Allow a window of 15 minutes to catch the cron cycle
                // e.g., 2.0 to 2.25 hours
                const twoHourInterval = 2;
                const remainder = hoursElapsed % twoHourInterval;

                // If within the first 15 mins of a 2-hour block (and not the very start 0-0.25)
                if (remainder < 0.25 && hoursElapsed > 1.0) {

                    // Check if we already sent a reminder in the last 30 minutes to avoid duplicates
                    const thirtyMinsAgo = new Date(now - 30 * 60 * 1000);

                    const existingNotification = await Notification.findOne({
                        userId: session.employee.userId,
                        type: 'warning',
                        title: 'Work Report Update Reminder',
                        createdAt: { $gte: thirtyMinsAgo }
                    });

                    if (!existingNotification) {
                        await Notification.create({
                            userId: session.employee.userId,
                            title: 'Work Report Update Reminder',
                            message: `It's been ${Math.floor(hoursElapsed)} hours since you checked in. Please update your work report.`,
                            type: 'warning',
                            isRead: false
                        });
                        logger.info(`Sent Report Reminder to ${session.employee.firstName}`);
                    }
                }
            }
        } catch (error) {
            logger.error('Cron Job Error (Report Reminder):', error);
        }
    });

    // Recruitment: Auto-Sync Candidates (Runs every 30 seconds to check if sync is due)
    cron.schedule('*/30 * * * * *', async () => {
        // logger.info('Running cron job: CRM Auto-Sync Check'); // verbose
        try {
            const RecruitmentSettings = require('../models/Recruitment/RecruitmentSettings');
            const recruitmentService = require('./recruitment.service');

            const settings = await RecruitmentSettings.getSettings();

            if (settings.isAutoSyncEnabled && settings.googleSpreadsheetId) {
                const now = new Date();
                const lastSync = settings.lastSyncTime ? new Date(settings.lastSyncTime) : new Date(0);

                // Frequency in Minutes (can be 0.5)
                const freqMinutes = settings.syncFrequencyMinutes || 60;
                const freqMs = freqMinutes * 60 * 1000;

                const diffMs = now - lastSync;
                const diffMinutes = diffMs / (1000 * 60);

                if (diffMs >= freqMs) {
                    logger.info(`Auto-Sync triggered. Last sync was ${(diffMs / 1000).toFixed(1)}s ago (Freq: ${freqMinutes}m)`);
                    await recruitmentService.syncCandidates(settings.googleSpreadsheetId);

                    settings.lastSyncTime = new Date();
                    await settings.save();
                } else {
                    logger.info(`Skipping Auto-Sync. Next sync in ${(freqMinutes - diffMinutes).toFixed(1)} minutes.`);
                }
            }
        } catch (error) {
            logger.error('Cron Job Error (Recruitment Sync):', error);
        }
    });
    // Birthday Wishes (Runs daily at 9:00 AM)
    cron.schedule('0 9 * * *', async () => {
        logger.info('Running cron job: Birthday Wishes');
        try {
            const Notification = require('../models/Notification/Notification');

            // 1. Cleanup Old Birthday Notifications (> 24 hours)
            const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
            await Notification.deleteMany({
                type: 'birthday',
                createdAt: { $lt: yesterday }
            });

            // 2. Find Employees with Birthday Today
            const today = new Date();
            const currentMonth = today.getMonth() + 1; // 1-12
            const currentDay = today.getDate(); // 1-31

            // Using aggregation to match day and month regardless of year
            const birthdayEmployees = await Employee.aggregate([
                {
                    $project: {
                        userId: 1,
                        firstName: 1,
                        lastName: 1,
                        isActive: 1,
                        month: { $month: "$dateOfBirth" },
                        day: { $dayOfMonth: "$dateOfBirth" }
                    }
                },
                {
                    $match: {
                        isActive: true,
                        month: currentMonth,
                        day: currentDay
                    }
                }
            ]);

            for (const emp of birthdayEmployees) {
                if (!emp.userId) continue;

                // Check duplicate for today (Notification)
                const startOfDay = new Date();
                startOfDay.setHours(0, 0, 0, 0);

                const existingWish = await Notification.findOne({
                    userId: emp.userId,
                    type: 'birthday',
                    createdAt: { $gte: startOfDay }
                });

                if (!existingWish) {
                    await Notification.create({
                        userId: emp.userId,
                        title: '🎉 Happy Birthday!',
                        message: `Happy Birthday, ${emp.firstName}! 🎂\nWishing you a fantastic day filled with joy, success, and happiness.\n\nBest Wishes,\nYour HRM Team`,
                        type: 'birthday',
                        isRead: false
                    });
                    logger.info(`Sent Birthday Notification to ${emp.firstName} ${emp.lastName}`);

                    // --- CHAT MESSAGE LOGIC ---
                    try {
                        const User = require('../models/User/User');
                        const Conversation = require('../models/Chat/Conversation');
                        const Message = require('../models/Chat/Message');

                        // Find System Admin or an HR to send the wish
                        // Use the first active admin found
                        const systemSender = await User.findOne({ role: 'admin', isActive: true });

                        if (systemSender) {
                            // Find/Create Conversation
                            let conversation = await Conversation.findOne({
                                type: 'direct',
                                'participants.userId': { $all: [systemSender._id, emp.userId] }
                            });

                            if (!conversation) {
                                conversation = await Conversation.create({
                                    type: 'direct',
                                    participants: [
                                        { userId: systemSender._id, role: 'member' },
                                        { userId: emp.userId, role: 'member' }
                                    ],
                                    createdBy: systemSender._id
                                });
                            }

                            // Check if message already sent today to avoid spam
                            const existingMsg = await Message.findOne({
                                conversationId: conversation._id,
                                messageType: 'text',
                                content: { $regex: 'Happy Birthday', $options: 'i' },
                                createdAt: { $gte: startOfDay }
                            });

                            if (!existingMsg) {
                                await Message.create({
                                    conversationId: conversation._id,
                                    senderId: systemSender._id,
                                    messageType: 'text',
                                    content: `🎉 Happy Birthday, ${emp.firstName}! 🎂\n\nWishing you a wonderful year ahead!\n- HRM Team`,
                                    status: { sent: true, delivered: [], read: [] }
                                });

                                // Update conversation lastMessageAt
                                await Conversation.findByIdAndUpdate(conversation._id, {
                                    lastMessageAt: new Date()
                                });

                                logger.info(`Sent Birthday Chat Message to ${emp.firstName}`);
                            }
                        }
                    } catch (chatError) {
                        logger.error(`Failed to send birthday chat to ${emp.firstName}:`, chatError);
                    }
                }
            }

        } catch (error) {
            logger.error('Cron Job Error (Birthday Wishes):', error);
        }
    });

    // ==========================================
    // 3. Perfect Attendance Encouragement
    // Runs on 1st of each month at 9:00 AM
    // ==========================================
    cron.schedule('0 9 1 * *', async () => {
        logger.info('Running cron job: Perfect Attendance Encouragement');
        try {
            const Attendance = require('../models/Attendance/Attendance');
            const Employee = require('../models/Employee/Employee');
            const Notification = require('../models/Notification/Notification');
            const User = require('../models/User/User');
            const Conversation = require('../models/Chat/Conversation');
            const Message = require('../models/Chat/Message');

            // Get previous month date range
            const now = new Date();
            const previousMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
            const previousYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

            const startDate = new Date(previousYear, previousMonth, 1);
            const endDate = new Date(previousYear, previousMonth + 1, 0, 23, 59, 59, 999);

            logger.info(`Checking attendance for ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);

            // Calculate total working days (Mon-Fri)
            let totalWorkingDays = 0;
            let d = new Date(startDate);
            while (d <= endDate) {
                const day = d.getDay();
                if (day !== 0 && day !== 6) { // Not Sunday or Saturday
                    totalWorkingDays++;
                }
                d.setDate(d.getDate() + 1);
            }

            logger.info(`Total working days in previous month: ${totalWorkingDays}`);

            // Get attendance stats per employee
            const attendanceStats = await Attendance.aggregate([
                {
                    $match: {
                        date: { $gte: startDate, $lte: endDate },
                        status: { $in: ['Present', 'Late'] } // Count Present and Late as attendance
                    }
                },
                {
                    $group: {
                        _id: "$employee",
                        presentDays: { $sum: 1 }
                    }
                }
            ]);

            logger.info(`Found ${attendanceStats.length} employees with attendance records`);

            // Find employees with 100% attendance
            const perfectAttendanceEmployees = [];
            for (const stat of attendanceStats) {
                if (stat.presentDays >= totalWorkingDays) {
                    const emp = await Employee.findById(stat._id).populate('userId');
                    if (emp && emp.userId && emp.isActive) {
                        perfectAttendanceEmployees.push({
                            employee: emp,
                            presentDays: stat.presentDays
                        });
                    }
                }
            }

            logger.info(`Found ${perfectAttendanceEmployees.length} employees with 100% attendance`);

            // Send encouragement to each employee
            for (const { employee, presentDays } of perfectAttendanceEmployees) {
                try {
                    // Create notification
                    await Notification.create({
                        userId: employee.userId._id,
                        title: '🏆 Perfect Attendance Achievement!',
                        message: `Congratulations, ${employee.firstName}! 🎉\n\nYou achieved 100% attendance last month (${presentDays}/${totalWorkingDays} days).\n\nYour dedication and commitment are truly appreciated. Keep up the excellent work!\n\n- HRM Team`,
                        type: 'perfect_attendance',
                        isRead: false
                    });

                    logger.info(`Sent perfect attendance notification to ${employee.firstName} ${employee.lastName}`);

                    // Send chat message
                    const systemSender = await User.findOne({ role: 'admin', isActive: true });
                    if (systemSender) {
                        let conversation = await Conversation.findOne({
                            type: 'direct',
                            'participants.userId': { $all: [systemSender._id, employee.userId._id] }
                        });

                        if (!conversation) {
                            conversation = await Conversation.create({
                                type: 'direct',
                                participants: [
                                    { userId: systemSender._id, role: 'member' },
                                    { userId: employee.userId._id, role: 'member' }
                                ],
                                createdBy: systemSender._id,
                                isActive: true
                            });
                        }

                        await Message.create({
                            conversationId: conversation._id,
                            senderId: systemSender._id,
                            messageType: 'text',
                            content: `🏆 Congratulations, ${employee.firstName}!\n\nYou achieved 100% attendance last month! Your dedication is truly inspiring. Keep up the excellent work!\n\n- HRM Team`,
                            status: { sent: true }
                        });

                        await Conversation.findByIdAndUpdate(conversation._id, { lastMessageAt: new Date() });
                        logger.info(`Sent perfect attendance chat message to ${employee.firstName}`);
                    }
                } catch (err) {
                    logger.error(`Failed to send perfect attendance encouragement to ${employee.firstName}:`, err);
                }
            }

            logger.info('Perfect Attendance Encouragement job completed');
        } catch (error) {
            logger.error('Cron Job Error (Perfect Attendance):', error);
        }
    });

};

module.exports = initCronJobs;
