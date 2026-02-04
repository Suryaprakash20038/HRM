const Task = require('../../models/Task/Task');
const Project = require('../../models/Project/Project');
const Employee = require('../../models/Employee/Employee');
const { successResponse, errorResponse } = require('../../utils/response');
const { sendNotification } = require('../../services/notification.service');

// Create Task (For Team Lead)
exports.createTask = async (req, res) => {
    try {
        console.log("Create Task Request Body:", req.body);
        console.log("Create Task Files:", req.files);

        const { project: projectId, module: moduleId, assignedTo, title } = req.body;

        // Fix for multiple assignedTo if sent with []
        let actualAssignedTo = assignedTo;
        if (!actualAssignedTo && req.body['assignedTo[]']) {
            actualAssignedTo = req.body['assignedTo[]'];
        }
        if (typeof actualAssignedTo === 'string') {
            actualAssignedTo = [actualAssignedTo];
        }

        const attachments = (req.files && Array.isArray(req.files)) ? req.files.map(file => ({
            fileName: file.originalname,
            fileUrl: file.path,
            uploadedAt: new Date()
        })) : [];

        // Add forwarded documents from requirement
        if (req.body.existingAttachments) {
            try {
                const existing = JSON.parse(req.body.existingAttachments);
                if (Array.isArray(existing)) {
                    attachments.push(...existing.map(f => ({ ...f, uploadedAt: new Date() })));
                }
            } catch (e) {
                console.error("Error parsing existingAttachments:", e);
            }
        }

        const taskData = {
            ...req.body,
            assignedTo: actualAssignedTo || req.body.assignedTo,
            attachments,
            assignedBy: req.user.employeeId || req.user.id
        };

        // Remove the array-style key if it exists to avoid mongoose validation issues
        delete taskData['assignedTo[]'];

        const task = await Task.create(taskData);

        // Notify Assigned Employees
        const notifyList = actualAssignedTo || [];
        if (notifyList.length > 0) {
            for (const empId of notifyList) {
                const employee = await Employee.findById(empId);
                if (employee && employee.userId) {
                    await sendNotification({
                        userId: employee.userId,
                        title: 'New Task Assigned',
                        message: `You have been assigned a new task: ${title}`,
                        type: 'info',
                        link: '/employee/tasks'
                    });
                }
            }
        }

        return successResponse(res, { task }, 'Task created successfully', 201);
    } catch (error) {
        console.error("Task Creation Error Details:", error);
        return errorResponse(res, error.message, 500);
    }
};

// Get Tasks (For Board)
exports.getTasks = async (req, res) => {
    try {
        const { projectId, moduleId, status, myTasks } = req.query;
        let query = {};

        if (projectId) query.project = projectId;
        if (moduleId) query.module = moduleId;
        if (status) query.status = status;

        // If requesting my tasks
        if (myTasks === 'true') {
            let employeeId = req.user.employeeId;
            if (!employeeId) {
                const employee = await Employee.findOne({ userId: req.user.id });
                employeeId = employee ? employee._id : req.user.id;
            }
            query.assignedTo = employeeId;
        }

        const tasks = await Task.find(query)
            .populate('assignedTo', 'firstName lastName profileImage position')
            .populate('assignedBy', 'firstName lastName')
            .populate('project', 'projectName requirements description deadline')
            .sort({ createdAt: -1 });

        return successResponse(res, { tasks }, 'Tasks fetched successfully');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

// Update Task Status (For Employee/TL)
exports.updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, comment } = req.body;

        const task = await Task.findById(id);
        if (!task) return errorResponse(res, 'Task not found', 404);

        // Security check: only assigned users or creator can update
        // const isAssigned = task.assignedTo.map(id => id.toString()).includes(req.user.id);
        // const isCreator = task.assignedBy.toString() === req.user.id;
        // if (!isAssigned && !isCreator && req.user.role !== 'admin') {
        //     return errorResponse(res, 'Unauthorized', 403);
        // }

        task.status = status;
        if (comment) {
            task.comments.push({
                user: req.user.id,
                text: comment
            });
        }

        await task.save();

        // Notify TL if completed
        if (status === 'Completed') {
            await sendNotification({
                userId: task.assignedBy,
                title: 'Task Completed',
                message: `Task ${task.title} marked as Completed`,
                type: 'success',
                link: `/projects/${task.project}`
            });
        }

        return successResponse(res, { task }, 'Task status updated');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

// Delete Task (For Team Lead/Manager/Admin)
exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findById(id);
        if (!task) {
            return errorResponse(res, 'Task not found', 404);
        }

        // Authorization: Admin, Manager, or the person who assigned it, or the Team Lead
        const userRole = (req.user.role || '').toLowerCase();
        const isAdmin = ['admin', 'md', 'superadmin'].includes(userRole);
        const employeeId = req.user.employeeId?.toString();
        const userId = req.user.id?.toString();

        const isAssigner = (task.assignedBy?.toString() === employeeId) || (task.assignedBy?.toString() === userId);

        if (!isAdmin && !isAssigner) {
            const project = await Project.findById(task.project);
            if (!project) return errorResponse(res, 'Associated project not found', 404);

            const isProjectManager = project.manager?.toString() === employeeId;
            const isProjectTL = project.teamLead?.toString() === employeeId;
            const isModuleTL = project.modules?.some(m =>
                m._id?.toString() === task.module?.toString() &&
                m.teamLead?.toString() === employeeId
            );

            if (!isProjectManager && !isProjectTL && !isModuleTL) {
                return errorResponse(res, 'You are not authorized to delete this task', 403);
            }
        }

        await Task.findByIdAndDelete(id);

        return successResponse(res, null, 'Task deleted successfully');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

