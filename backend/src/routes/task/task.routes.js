const express = require('express');
const router = express.Router();
const taskController = require('../../controllers/task/task.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const checkRole = require('../../middleware/role.middleware');

const { upload, uploadToCloudinary } = require('../../middleware/upload.middleware');

router.use(authMiddleware);

// Create Task - Team Lead, Manager, Admin
router.post('/', checkRole('admin', 'md', 'manager', 'teamlead', 'employee'), upload.array('files'), uploadToCloudinary, taskController.createTask);


// Get Tasks - All (with filters)
router.get('/', taskController.getTasks);

// Update Status - All (including Employee)
router.patch('/:id/status', taskController.updateTaskStatus);

// Delete Task
router.delete('/:id', checkRole('admin', 'md', 'manager', 'teamlead', 'employee'), taskController.deleteTask);


module.exports = router;

