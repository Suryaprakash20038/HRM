const express = require('express');
const router = express.Router();
const statusController = require('../../controllers/status/status.controller');
const authMiddleware = require('../../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/employee/:employeeId', statusController.getEmployeeStatus);
router.put('/employee/:employeeId', statusController.updateEmployeeStatus);
router.get('/overview', statusController.getStatusOverview);

module.exports = router;
