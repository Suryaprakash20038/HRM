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

router.post('/:id/modules', checkRole('admin', 'md', 'manager', 'teamlead', 'employee'), upload.array('files'), uploadToCloudinary, projectController.addModule);
router.put('/:id/modules/:moduleId', checkRole('admin', 'md', 'manager', 'teamlead', 'employee'), projectController.updateModule);
router.post('/:id/modules/:moduleId/files', checkRole('admin', 'md', 'manager', 'teamlead', 'employee'), upload.array('files'), uploadToCloudinary, projectController.uploadModuleFile);
router.delete('/:id/modules/:moduleId', checkRole('admin', 'md', 'manager', 'employee'), projectController.deleteModule);

// Requirement routes
router.post('/:id/requirements', checkRole('admin', 'md', 'manager', 'teamlead', 'employee'), upload.array('files'), uploadToCloudinary, projectController.addRequirement);
router.delete('/:id/requirements/:requirementId', checkRole('admin', 'md', 'manager', 'teamlead', 'employee'), projectController.deleteRequirement);


// Manager workflow routes (MUST be before /:id route)
router.get('/my-managed', checkRole('manager', 'admin', 'md', 'employee'), projectController.getMyManagedProjects);
router.patch('/:id/modules/:moduleId/assign-tl', checkRole('manager', 'admin', 'md', 'employee'), projectController.assignTeamLeadToModule);

// Team Lead workflow routes (MUST be before /:id route)
router.get('/my-modules', checkRole('teamlead', 'manager', 'admin', 'md', 'employee'), projectController.getMyModules);


// Standard CRUD routes
router.get('/', checkRole('admin', 'md'), projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', checkRole('admin', 'md'), upload.array('files'), uploadToCloudinary, validateProject, projectController.createProject);
router.put('/:id', checkRole('admin', 'md', 'manager', 'teamlead', 'employee'), upload.array('files'), uploadToCloudinary, projectController.updateProject);

router.delete('/:id', checkRole('admin', 'md'), projectController.deleteProject);

module.exports = router;


