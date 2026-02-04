const express = require('express');
const router = express.Router();
const reportController = require('../../controllers/report/report.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const checkRole = require('../../middleware/role.middleware');

router.use(authMiddleware);
router.use(checkRole('admin', 'md'));

router.post('/generate', reportController.generateReport);
router.get('/', reportController.getAllReports);
router.get('/:id', reportController.getReportById);
router.delete('/:id', reportController.deleteReport);

module.exports = router;
