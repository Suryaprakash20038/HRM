const express = require('express');
const router = express.Router();
const analyticsController = require('../../../controllers/Analytics controller/Analytics/analytics.controller');
const authMiddleware = require('../../../middleware/auth.middleware');

// Apply Auth Middleware (Ensure only authorized users access this)
router.use(authMiddleware);

// Analytics Routes
router.get('/workforce', analyticsController.getWorkforceInsights);
router.get('/attendance', analyticsController.getAttendanceAnalytics);
router.get('/leave', analyticsController.getLeaveAnalytics);
router.get('/performance', analyticsController.getPerformanceAnalytics);
router.get('/payroll', analyticsController.getPayrollAnalytics);
router.get('/tickets', analyticsController.getTicketsAnalytics);
router.get('/recruitment', analyticsController.getRecruitmentAnalytics);
router.get('/attrition', analyticsController.getAttritionAnalytics);

module.exports = router;
