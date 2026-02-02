const express = require('express');
const router = express.Router();
const recruitmentController = require('../../controllers/recruitment/recruitment.controller');
const authMiddleware = require('../../middleware/auth.middleware');

router.get('/jobs', recruitmentController.getAllJobs);
router.get('/jobs/:id', recruitmentController.getJobById);
router.post('/jobs/:id/apply', recruitmentController.applyForJob);

router.use(authMiddleware);

router.post('/jobs', recruitmentController.createJob);
router.put('/jobs/:id', recruitmentController.updateJob);
router.delete('/jobs/:id', recruitmentController.deleteJob);
router.put('/jobs/:jobId/applicants/:applicantId/status', recruitmentController.updateApplicationStatus);

module.exports = router;
