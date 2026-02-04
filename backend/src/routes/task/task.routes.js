const express = require('express');
const router = express.Router();
const taskController = require('../../controllers/task/task.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const checkRole = require('../../middleware/role.middleware');
const { upload } = require('../../middleware/upload.middleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// ADMIN ROUTES
// Get all tasks with filtering, search, and pagination
router.get('/', checkRole('admin', 'md'), taskController.getAllTasks);

// Get task statistics for dashboard
router.get('/statistics', checkRole('admin', 'md'), taskController.getTaskStatistics);

// EMPLOYEE ROUTES
// Get tasks assigned to current employee (no ID needed, derived from token)
router.get('/my-tasks', taskController.getMyTasks);

// Get single task by ID - Accessible to all (if assigned)
router.get('/:id', taskController.getTaskById);

// Create new task - Admin/MD
router.post('/', checkRole('admin', 'md'), taskController.createTask);

// Update task - Admin/MD
router.put('/:id', checkRole('admin', 'md'), taskController.updateTask);

// Delete task - Admin/MD
router.delete('/:id', checkRole('admin', 'md'), taskController.deleteTask);

// EMPLOYEE ROUTES


// Update task progress
router.put('/:id/update-progress', taskController.updateProgress);

// Update task result (Success, Failed, Delayed, etc.)
router.put('/:id/result', taskController.updateTaskResult);

// Add comment to task
router.post('/:id/comment', taskController.addComment);

// Add time log to task
router.post('/:id/time-log', taskController.addTimeLog);

// Upload task attachments (handled separately)
router.post('/:id/upload', upload.array('files', 5), async (req, res) => {
    try {
        const Task = require('../../models/Task/Task');
        const Employee = require('../../models/Employee/Employee');
        const { successResponse, errorResponse } = require('../../utils/response');

        const taskId = req.params.id;
        const files = req.files;

        if (!files || files.length === 0) {
            return errorResponse(res, 'No files uploaded', 400);
        }

        // Find the employee profile
        const employee = await Employee.findOne({ userId: req.user.id });
        if (!employee) {
            return errorResponse(res, 'Employee profile not found', 404);
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return errorResponse(res, 'Task not found', 404);
        }

        // Process uploaded files
        const attachments = files.map(file => ({
            fileName: file.originalname,
            fileUrl: file.path || file.location, // Cloudinary or local path
            fileType: file.mimetype,
            fileSize: file.size,
            uploadedBy: employee._id
        }));

        // Add attachments to task
        task.attachments.push(...attachments);

        // Add activity log
        task.activityLog.push({
            action: 'Attachments Added',
            performedBy: employee._id,
            details: `${files.length} file(s) uploaded`
        });

        await task.save();

        const updatedTask = await Task.findById(taskId)
            .populate('attachments.uploadedBy', 'firstName lastName');

        return successResponse(res, {
            task: updatedTask,
            uploadedFiles: attachments
        }, 'Files uploaded successfully');

    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
