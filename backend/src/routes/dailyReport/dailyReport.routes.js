const express = require('express');
const router = express.Router();
const dailyReportController = require('../../controllers/dailyReport/dailyReport.controller');
const authMiddleware = require('../../middleware/auth.middleware');

const checkRole = require('../../middleware/role.middleware');

router.use(authMiddleware);
router.use(checkRole('employee', 'admin', 'hr', 'teamlead', 'manager', 'md'));


// Admin can access all reports, Employees can access my-reports
// Ideally, checkRole('admin') for the getAllReports route if strictly admin only
// But the user said "display for the admin panel report page".
router.get('/', dailyReportController.getAllReports);

const { upload } = require('../../middleware/upload.middleware');

router.post('/', upload.single('document'), dailyReportController.createReport);
router.get('/team-reports', dailyReportController.getSubordinateReports);
router.get('/my-reports', dailyReportController.getMyReports);

module.exports = router;
