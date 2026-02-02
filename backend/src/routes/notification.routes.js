const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const protect = require('../middleware/auth.middleware');

router.get('/', protect, notificationController.getMyNotifications);
router.put('/read', protect, notificationController.markAsRead);
router.put('/:id/read', protect, notificationController.markOneRead);

module.exports = router;
