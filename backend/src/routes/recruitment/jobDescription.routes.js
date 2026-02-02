const express = require('express');
const router = express.Router();
const jobDescriptionController = require('../../controllers/recruitment/jobDescription.controller');
const authMiddleware = require('../../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/', jobDescriptionController.createJobDescription);
// GET /?status=Active
router.get('/', jobDescriptionController.getAllJobDescriptions);
router.put('/:id', jobDescriptionController.updateJobDescription);
router.delete('/:id', jobDescriptionController.deleteJobDescription);

module.exports = router;
