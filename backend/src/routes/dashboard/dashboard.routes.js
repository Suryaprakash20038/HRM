const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/dashboard/dashboard.controller');
const authMiddleware = require('../../middleware/auth.middleware');
router.use(authMiddleware);
router.get('/stats', dashboardController.getDashboardStats);
router.get('/activities', dashboardController.getRecentActivities);
module.exports = router;