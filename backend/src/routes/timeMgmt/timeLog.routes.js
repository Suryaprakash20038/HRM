const express = require('express');
const router = express.Router();
const timeLogController = require('../../controllers/timeMgmt/timeLog.controller');
const authMiddleware = require('../../middleware/auth.middleware');

console.log('Loading Time Log Routes...'); // Debug Log

router.use(authMiddleware);

router.post('/check-in', timeLogController.checkIn);
router.post('/check-out', timeLogController.checkOut);
router.get('/my-logs', timeLogController.getEmployeeTimeLogs);
router.get('/all-logs', timeLogController.getAllTimeLogs);

// Regularisation
router.post('/regularise', timeLogController.requestRegularisation);
router.get('/regularise/requests', timeLogController.getRegularisationRequests); // Maps to pending/history
router.put('/regularise/status', timeLogController.updateRegularisationStatus); // Maps to approve/reject

// Summary
router.get('/summary', timeLogController.getAttendanceSummary);

module.exports = router;
