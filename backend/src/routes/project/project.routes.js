const express = require('express');
const router = express.Router();
const projectController = require('../../controllers/project/project.controller');
const authMiddleware = require('../../middleware/auth.middleware');

const { validateProject } = require('../../validators/project.validator');

router.use(authMiddleware);

// Department and employee routes
router.get('/departments/list', projectController.getDepartments);
router.get('/employees/department/:department', projectController.getEmployeesByDepartment);

// Employee project routes
router.get('/my-projects', projectController.getMyProjects);
router.patch('/:id/update-progress', projectController.updateProjectProgress);

// Module routes
const { upload, uploadToCloudinary } = require('../../middleware/upload.middleware');

router.post('/:id/modules', upload.array('files'), uploadToCloudinary, projectController.addModule);
router.put('/:id/modules/:moduleId', projectController.updateModule);
router.post('/:id/modules/:moduleId/files', upload.array('files'), uploadToCloudinary, projectController.uploadModuleFile);

// Standard CRUD routes
router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', validateProject, projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;

