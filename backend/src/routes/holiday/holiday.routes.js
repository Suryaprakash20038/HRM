const express = require('express');
const router = express.Router();
const holidayController = require('../../controllers/holiday/holiday.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { upload, uploadToCloudinary } = require('../../middleware/upload.middleware');

router.use(authMiddleware);

router.get('/', holidayController.getAllHolidays);
router.get('/:id', holidayController.getHolidayById);
router.post('/', upload.fields([{ name: 'image', maxCount: 1 }]), uploadToCloudinary, holidayController.createHoliday);
router.put('/:id', upload.fields([{ name: 'image', maxCount: 1 }]), uploadToCloudinary, holidayController.updateHoliday);
router.delete('/:id', holidayController.deleteHoliday);

module.exports = router;
