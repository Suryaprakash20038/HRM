const express = require('express');
const router = express.Router();
const meetingController = require('../../controllers/Meeting/meeting.controller');
const protect = require('../../middleware/auth.middleware');

// Protect all routes
router.use(protect);

router.post('/create', meetingController.createMeeting);
router.get('/', meetingController.getMeetings);
router.get('/:roomId/join', meetingController.joinMeeting);
router.patch('/:roomId/end', meetingController.endMeeting);

module.exports = router;
