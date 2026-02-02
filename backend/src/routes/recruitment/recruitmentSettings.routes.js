const express = require('express');
const router = express.Router();
const controller = require('../../controllers/recruitment/recruitmentSettings.controller');
const brandingController = require('../../controllers/recruitment/companyBranding.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { upload, uploadToCloudinary } = require('../../middleware/upload.middleware');
const templateController = require('../../controllers/recruitment/letterTemplate.controller');

// Protect all routes
router.use(authMiddleware);

// General Settings
router.get('/', controller.getSettings);
router.put('/', controller.updateSettings);
router.post('/sync', controller.triggerManualSync);

// Branding Settings
router.get('/branding', brandingController.getBranding);
router.put('/branding',
    upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'signature', maxCount: 1 }, { name: 'letterPad', maxCount: 1 }]),
    uploadToCloudinary,
    brandingController.updateBranding
);

// Letter Templates
router.get('/templates', templateController.getAllTemplates);
router.post('/templates', templateController.createTemplate);
router.post('/templates/upload', upload.single('file'), templateController.uploadTemplate);
router.post('/templates/upload/direct', upload.single('file'), templateController.uploadAndSendDirect);
router.put('/templates/:id', templateController.updateTemplate);
router.get('/templates/:id/preview', templateController.previewTemplate);
router.delete('/templates/:id', templateController.deleteTemplate);

module.exports = router;
