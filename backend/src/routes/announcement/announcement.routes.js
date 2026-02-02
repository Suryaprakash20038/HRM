const express = require('express');
const router = express.Router();
const announcementController = require('../../controllers/announcement/announcement.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { upload, uploadToCloudinary } = require('../../middleware/upload.middleware');

router.use(authMiddleware);

router.get('/', announcementController.getAllAnnouncements);
router.get('/employee/my-announcements', announcementController.getEmployeeAnnouncements);
router.get('/:id', announcementController.getAnnouncementById);
router.post('/', upload.fields([{ name: 'image', maxCount: 1 }]), uploadToCloudinary, announcementController.createAnnouncement);
router.put('/:id', upload.fields([{ name: 'image', maxCount: 1 }]), uploadToCloudinary, announcementController.updateAnnouncement);
router.delete('/:id', announcementController.deleteAnnouncement);

module.exports = router;
