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
};

module.exports = initCronJobs;
