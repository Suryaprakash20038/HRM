const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('../auth/auth.routes');
const dashboardRoutes = require('../dashboard/dashboard.routes');
const employeeRoutes = require('../employee/employee.routes');
const attendanceRoutes = require('../attendance/attendance.routes');
const leaveRoutes = require('../leave/leave.routes');
const payrollRoutes = require('../payroll/payroll.routes');
const projectRoutes = require('../project/project.routes');
const taskRoutes = require('../task/task.routes');

const holidayRoutes = require('../holiday/holiday.routes');
const shiftRoutes = require('../shift/shift.routes');
const socialMediaRoutes = require('../socialMedia/socialMedia.routes');
const statusRoutes = require('../status/status.routes');
const announcementRoutes = require('../announcement/announcement.routes');
const mediaRoutes = require('../media/media.routes');
const reportRoutes = require('../report/report.routes');

const dailyReportRoutes = require('../dailyReport/dailyReport.routes');
const accountsRoutes = require('../accounts/accounts.routes');
const resignationRoutes = require('../resignation/resignation.routes');
const notificationRoutes = require('../notification.routes');
const ticketRoutes = require('../ticket/ticket.routes');
const recruitmentRoutes = require('../recruitment/recruitment.routes');
const candidateRoutes = require('../recruitment/candidate.routes');
const timeLogRoutes = require('../timeMgmt/timeLog.routes');
const jobDescriptionRoutes = require('../recruitment/jobDescription.routes'); // Added
const analyticsRoutes = require('../Analytics routes/Analytics/analytics.routes');
const chatRoutes = require('../chat/chat.routes');
const meetingRoutes = require('../meeting/meeting.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/employees', employeeRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/leave', leaveRoutes);
router.use('/payroll', payrollRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);

router.use('/holidays', holidayRoutes);
router.use('/shifts', shiftRoutes);

router.use('/status', statusRoutes);
router.use('/announcements', announcementRoutes);
router.use('/media', mediaRoutes);
router.use('/reports', reportRoutes);
router.use('/daily-reports', dailyReportRoutes);
router.use('/accounts', accountsRoutes);
router.use('/chat', chatRoutes);
router.use('/resignation', resignationRoutes);
router.use('/tickets', ticketRoutes);
router.use('/time-logs', timeLogRoutes);
router.use('/recruitment', recruitmentRoutes);
router.use('/candidates', candidateRoutes);
router.use('/job-descriptions', jobDescriptionRoutes);
router.use('/recruitment-settings', require('../recruitment/recruitmentSettings.routes')); // Added
router.use('/analytics', analyticsRoutes);
router.use('/meetings', meetingRoutes);

module.exports = router;
