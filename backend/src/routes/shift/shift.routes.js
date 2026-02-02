const express = require('express');
const router = express.Router();
const shiftController = require('../../controllers/shift/shift.controller');
const authMiddleware = require('../../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', shiftController.getAllShifts);
router.get('/schedule', shiftController.getSchedule);
router.get('/my-shift', shiftController.getMyTodayShift); // New route for employee dashboard
router.get('/my-weekly-schedule', shiftController.getMyWeeklySchedule);
router.get('/stats', shiftController.getStats);
router.get('/:id', shiftController.getShiftById);
router.post('/', shiftController.createShift);
router.put('/:id', shiftController.updateShift);
router.delete('/:id', shiftController.deleteShift);
router.post('/assign', shiftController.assignShift); // Legacy link
router.post('/schedule', shiftController.assignSchedule);
router.delete('/schedule/:id', shiftController.deleteSchedule);
router.put('/schedule/:id', shiftController.updateSchedule);

module.exports = router;
