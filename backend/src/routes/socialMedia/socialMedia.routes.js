const express = require('express');
const router = express.Router();
const socialMediaController = require('../../controllers/socialMedia/socialMedia.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { upload: uploadMiddleware } = require('../../middleware/upload.middleware');

const checkRole = require('../../middleware/role.middleware');

router.use(authMiddleware);
router.use(checkRole('employee', 'admin'));

router.post('/', uploadMiddleware.single('postImage'), socialMediaController.createLog);
router.get('/my-logs', socialMediaController.getMyLogs);

module.exports = router;
