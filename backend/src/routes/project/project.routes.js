const express = require('express');
const router = express.Router();
const projectController = require('../../controllers/project/project.controller');
const authMiddleware = require('../../middleware/auth.middleware');

const { validateProject } = require('../../validators/project.validator');
const checkRole = require('../../middleware/role.middleware');

router.use(authMiddleware);

// Department and employee routes
router.get('/departments/list', projectController.getDepartments);
router.get('/employees/department/:department', projectController.getEmployeesByDepartment);

// Employee project routes
router.get('/my-projects', projectController.getMyProjects);
router.patch('/:id/update-progress', projectController.updateProjectProgress);

// Module routes
const { upload, uploadToCloudinary } = require('../../middleware/upload.middleware');

router.post('/:id/modules', checkRole('admin', 'md', 'manager', 'teamlead'), upload.array('files'), uploadToCloudinary, projectController.addModule);
router.put('/:id/modules/:moduleId', checkRole('admin', 'md', 'manager', 'teamlead'), projectController.updateModule);
router.post('/:id/modules/:moduleId/files', checkRole('admin', 'md', 'manager', 'teamlead'), upload.array('files'), uploadToCloudinary, projectController.uploadModuleFile);

// Standard CRUD routes
router.get('/', checkRole('admin', 'md'), projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', checkRole('admin', 'md'), upload.array('files'), uploadToCloudinary, validateProject, projectController.createProject);
router.put('/:id', checkRole('admin', 'md', 'manager', 'teamlead'), upload.array('files'), uploadToCloudinary, projectController.updateProject);
router.delete('/:id', checkRole('admin', 'md'), projectController.deleteProject);

module.exports = router;

