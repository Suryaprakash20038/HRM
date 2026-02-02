const Task = require('../../models/Task/Task');
const Employee = require('../../models/Employee/Employee');
const User = require('../../models/User/User');
const { successResponse, errorResponse } = require('../../utils/response');
const logger = require('../../utils/logger');
const { sendNotification } = require('../../services/notification.service');

// ADMIN ROUTES

// Get all tasks with advanced filtering
exports.getAllTasks = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            priority,
            department,
            assignedTo,
            relatedProject,
            taskType,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query = {};

        // Apply filters
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (department) query.department = department;
        if (assignedTo) query.assignedTo = assignedTo;
        if (relatedProject) query.relatedProject = relatedProject;
        if (taskType) query.taskType = taskType;

        // Search by title or description
        if (search) {
            query.$or = [
                { taskTitle: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const tasks = await Task.find(query)
            .populate('assignedTo', 'firstName lastName email profileImage department position')
            .populate('assignedBy', 'firstName lastName email profileImage')
            .populate('createdBy', 'firstName lastName')
            .populate('relatedProject', 'projectName status')
            .populate('members', 'firstName lastName email profileImage')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(sort);

        const total = await Task.countDocuments(query);

        // Calculate statistics
        const stats = await Task.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalTasks: { $sum: 1 },
                    completedTasks: {
                        $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
                    },
                    inProgressTasks: {
                        $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] }
                    },
                    overdueTasks: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $lt: ['$dueDate', new Date()] },
                                        { $ne: ['$status', 'Completed'] },
                                        { $ne: ['$status', 'Cancelled'] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        return successResponse(res, {
            tasks,
            pagination: {
                totalPages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                total,
                limit: parseInt(limit)
            },
            statistics: stats[0] || {
                totalTasks: 0,
                completedTasks: 0,
                inProgressTasks: 0,
                overdueTasks: 0
            }
        }, 'Tasks retrieved successfully');

    } catch (error) {
        logger.error('Get all tasks error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// Get single task by ID
exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignedTo', 'firstName lastName email profileImage department position phone')
            .populate('assignedBy', 'firstName lastName email profileImage')
            .populate('createdBy', 'firstName lastName email')
            .populate('lastUpdatedBy', 'firstName lastName email')
            .populate('relatedProject', 'projectName status description deadline')
            .populate('members', 'firstName lastName email profileImage department position')
            .populate('timeLogs.loggedBy', 'firstName lastName')
            .populate('attachments.uploadedBy', 'firstName lastName')
            .populate('selfProgressUpdates.updatedBy', 'firstName lastName')
            .populate('comments.commentedBy', 'firstName lastName profileImage')
            .populate('activityLog.performedBy', 'firstName lastName');

        if (!task) {
            return errorResponse(res, 'Task not found', 404);
        }

        return successResponse(res, { task }, 'Task retrieved successfully');

    } catch (error) {
        logger.error('Get task by ID error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// Create new task
exports.createTask = async (req, res) => {
    try {
        const {
            taskTitle,
            description,
            taskType,
            priority,
            status,
            assignedTo,
            department,
            members,
            startDate,
            dueDate,
            estimatedHours,
            relatedProject,
            progressPercent
        } = req.body;

        console.log('Create Task Request:', { assignedTo, department, members }); // Debug log

        // Get current user
        const user = await User.findById(req.user.id);
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        // Handle assignedTo as array or single value
        const assignedToIds = Array.isArray(assignedTo) ? assignedTo : [assignedTo];

        if (!assignedToIds || assignedToIds.length === 0 || assignedToIds[0] === '') {
            return errorResponse(res, 'At least one employee must be assigned to the task', 400);
        }

        // Validate all assignedTo employees exist and belong to department
        const assignedToEmployees = await Employee.find({ _id: { $in: assignedToIds } });

        if (assignedToEmployees.length !== assignedToIds.length) {
            return errorResponse(res, 'One or more assigned employees not found', 404);
        }

        const invalidEmployees = assignedToEmployees.filter(emp => emp.department !== department);
        if (invalidEmployees.length > 0) {
            return errorResponse(res, 'All assigned employees must belong to the selected department', 400);
        }

        // Validate members belong to department
        if (members && members.length > 0) {
            const memberEmployees = await Employee.find({ _id: { $in: members } });
            const invalidMembers = memberEmployees.filter(emp => emp.department !== department);
            if (invalidMembers.length > 0) {
                return errorResponse(res, 'All members must belong to the selected department', 400);
            }
        }

        // Use first employee as primary assignedTo (for backward compatibility)
        const primaryAssignedTo = assignedToIds[0];

        const taskData = {
            taskTitle,
            description,
            taskType,
            priority,
            status: status || 'To Do',
            assignedBy: user._id, // User ID
            assignedTo: primaryAssignedTo, // Employee ID
            department,
            members: members || [],
            startDate,
            dueDate,
            estimatedHours: estimatedHours || 0,
            relatedProject: relatedProject || null,
            isStandaloneTask: !relatedProject,
            progressPercent: progressPercent || 0,
            createdBy: user._id, // User ID
            activityLog: [{
                action: 'Task Created',
                performedBy: user._id, // User ID
                details: `Task "${taskTitle}" created by ${user.firstName} ${user.lastName} and assigned to ${assignedToEmployees.map(e => `${e.firstName} ${e.lastName}`).join(', ')}`
            }]
        };

        const task = await Task.create(taskData);

        const populatedTask = await Task.findById(task._id)
            .populate('assignedTo', 'firstName lastName email userId')
            .populate('assignedBy', 'firstName lastName email')
            .populate('relatedProject', 'projectName');

        // Notify Assigned Employee
        if (populatedTask.assignedTo) {
            const emp = populatedTask.assignedTo;
            // assignedTo is a single Employee object due to schema definition
            if (emp.userId) {
                await sendNotification({
                    userId: emp.userId,
                    title: 'New Task Assigned',
                    message: `You have been assigned a new task: ${task.taskTitle}`,
                    type: 'info',
                    link: '/employee/tasks'
                });
            }
        }
        // Notify Members
        if (members && members.length > 0) {
            const memberEmps = await Employee.find({ _id: { $in: members } });
            for (const m of memberEmps) {
                if (m.userId) {
                    await sendNotification({
                        userId: m.userId,
                        title: 'New Task Assignment',
                        message: `You have been added to task: ${task.taskTitle}`,
                        type: 'info',
                        link: '/employee/tasks'
                    });
                }
            }
        }

        logger.info(`New task created: ${task.taskTitle} by ${user.firstName}`);

        return successResponse(res, { task: populatedTask }, 'Task created successfully', 201);

    } catch (error) {
        console.error('Create task error:', error); // Debug log
        logger.error('Create task error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// Update task
exports.updateTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const updates = req.body;

        // Get current user
        const user = await User.findById(req.user.id);
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        const existingTask = await Task.findById(taskId);
        if (!existingTask) {
            return errorResponse(res, 'Task not found', 404);
        }

        // If department or assignedTo is being updated, validate
        if (updates.department || updates.assignedTo) {
            const dept = updates.department || existingTask.department;
            const assignedTo = updates.assignedTo || existingTask.assignedTo;

            const assignedEmployee = await Employee.findById(assignedTo);
            if (assignedEmployee && assignedEmployee.department !== dept) {
                return errorResponse(res, 'Cannot assign task to employee outside selected department', 400);
            }
        }

        // Track what changed for activity log
        const changes = [];
        if (updates.status && updates.status !== existingTask.status) {
            changes.push(`Status changed from ${existingTask.status} to ${updates.status}`);
        }
        if (updates.priority && updates.priority !== existingTask.priority) {
            changes.push(`Priority changed from ${existingTask.priority} to ${updates.priority}`);
        }

        updates.lastUpdatedBy = user._id;

        // Add activity log entry
        if (changes.length > 0) {
            if (!updates.activityLog) {
                updates.activityLog = existingTask.activityLog || [];
            }
            updates.activityLog.push({
                action: 'Task Updated',
                performedBy: user._id,
                details: changes.join(', ')
            });
        }

        const task = await Task.findByIdAndUpdate(
            taskId,
            updates,
            { new: true, runValidators: true }
        )
            .populate('assignedTo', 'firstName lastName email userId')
            .populate('assignedBy', 'firstName lastName email')
            .populate('relatedProject', 'projectName');

        // Notify Assigned Employee of Update
        if (task.assignedTo && task.assignedTo.userId && task.assignedTo.userId.toString() !== user._id.toString()) {
            await sendNotification({
                userId: task.assignedTo.userId,
                title: 'Task Updated',
                message: `Task '${task.taskTitle}' has been updated.`,
                type: 'info',
                link: '/employee/tasks'
            });
        }

        logger.info(`Task updated: ${task.taskTitle} by ${user.firstName}`);

        return successResponse(res, { task }, 'Task updated successfully');

    } catch (error) {
        logger.error('Update task error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// Delete task
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return errorResponse(res, 'Task not found', 404);
        }

        logger.info(`Task deleted: ${task.taskTitle}`);

        return successResponse(res, null, 'Task deleted successfully');

    } catch (error) {
        logger.error('Delete task error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// EMPLOYEE ROUTES

// Get tasks assigned to employee
// Get tasks assigned to employee
exports.getMyTasks = async (req, res) => {
    try {
        // Resolve Employee ID from logged-in user
        // Resolve Employee ID from logged-in user
        let employee;

        // 1. Try finding by employeeId from token
        if (req.user.employeeId) {
            employee = await Employee.findById(req.user.employeeId);
        }

        // 2. If not found, try finding by userId (link in DB)
        if (!employee) {
            employee = await Employee.findOne({ userId: req.user.id });
        }

        // 3. Fallback: Try finding by email
        if (!employee) {
            const user = await User.findById(req.user.id);
            if (user && user.email) {
                employee = await Employee.findOne({ email: user.email });
            }
        }

        if (!employee) {
            // If still no employee found, we can't find tasks assigned to them
            // unless we look for 'assignedTo' = user._id (which we might support if tasks are assigned to Users directly)
            // But Task schema expects assignedTo to be Employee (mostly).
            // However, let's play safe and return empty list or check User ID too?
            // Task.assignedTo is ref Employee.
            return successResponse(res, {
                tasks: [],
                pagination: { total: 0, currentPage: 1, totalPages: 0 },
                statistics: { total: 0, completed: 0, inProgress: 0, overdue: 0 }
            }, 'No employee profile found for user, returning empty tasks');
        }

        const employeeId = employee._id;

        const { status, priority, page = 1, limit = 10 } = req.query;

        const query = {
            $or: [
                { assignedTo: employeeId },
                { members: employeeId }
            ]
        };

        if (status) query.status = status;
        if (priority) query.priority = priority;

        console.log('GetMyTasks Query:', JSON.stringify(query));
        console.log('Looking for tasks for Employee ID:', employeeId);

        const tasks = await Task.find(query)
            .populate('assignedBy', 'firstName lastName email profileImage')
            .populate('relatedProject', 'projectName status')
            .populate('members', 'firstName lastName profileImage')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ dueDate: 1 });

        console.log(`GetMyTasks: Found ${tasks.length} tasks for Employee ID ${employeeId}`);

        const total = await Task.countDocuments(query);

        // Get employee's task statistics
        const stats = await Task.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    completed: {
                        $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
                    },
                    inProgress: {
                        $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] }
                    },
                    overdue: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $lt: ['$dueDate', new Date()] },
                                        { $ne: ['$status', 'Completed'] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        return successResponse(res, {
            tasks,
            pagination: {
                total,
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit)
            },
            statistics: stats[0] || { total: 0, completed: 0, inProgress: 0, overdue: 0 }
        }, 'Employee tasks retrieved successfully');

    } catch (error) {
        logger.error('Get my tasks error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// Update task progress (Employee)
exports.updateProgress = async (req, res) => {
    try {
        const { progressPercent, comment } = req.body;
        const taskId = req.params.id;

        // Find the employee profile
        const employee = await Employee.findOne({ userId: req.user.id });
        if (!employee) {
            return errorResponse(res, 'Employee profile not found', 404);
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return errorResponse(res, 'Task not found', 404);
        }

        // Verify employee is assigned to this task
        if (task.assignedTo.toString() !== employee._id.toString() &&
            !task.members.some(m => m.toString() === employee._id.toString())) {
            return errorResponse(res, 'You are not authorized to update this task', 403);
        }

        // Update progress
        task.progressPercent = progressPercent;

        // Add progress update comment
        if (comment) {
            task.selfProgressUpdates.push({
                comment,
                progress: progressPercent,
                updatedBy: employee._id
            });
        }

        // Add activity log
        task.activityLog.push({
            action: 'Progress Updated',
            performedBy: employee._id,
            details: `Progress updated to ${progressPercent}%`
        });

        // Auto-update status based on progress
        if (progressPercent === 100 && task.status !== 'Completed') {
            task.status = 'Completed';
            task.completedAt = new Date();
            task.taskResult = 'Success';
        } else if (progressPercent > 0 && task.status === 'To Do') {
            task.status = 'In Progress';
        }

        task.lastUpdatedBy = employee._id;
        await task.save();

        const updatedTask = await Task.findById(taskId)
            .populate('assignedTo', 'firstName lastName')
            .populate('selfProgressUpdates.updatedBy', 'firstName lastName')
            .populate('assignedBy', 'firstName lastName'); // Ensure we get creator to notify

        // Notify Task Creator/Assigner (Admin)
        if (updatedTask.assignedBy) {
            // assignedBy is User.
            const adminId = updatedTask.assignedBy._id || updatedTask.assignedBy;
            if (adminId.toString() !== req.user.id) {
                const targetUser = await User.findById(adminId);
                const targetLink = (targetUser && (targetUser.role === 'employee' || targetUser.role === 'Employee'))
                    ? '/employee/tasks'
                    : `/tasks/${taskId}`;

                await sendNotification({
                    userId: adminId,
                    title: 'Task Progress Updated',
                    message: `Task '${updatedTask.taskTitle}' progress updated to ${progressPercent}% by ${employee.firstName}.`,
                    type: 'info',
                    link: targetLink
                });
            }
        }

        logger.info(`Task progress updated: ${task.taskTitle} - ${progressPercent}%`);

        return successResponse(res, { task: updatedTask }, 'Progress updated successfully');

    } catch (error) {
        logger.error('Update progress error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// Update task result (Employee)
exports.updateTaskResult = async (req, res) => {
    try {
        const { taskResult, delayReason, employeeNotes } = req.body;
        const taskId = req.params.id;

        // Find the employee profile
        const employee = await Employee.findOne({ userId: req.user.id });
        if (!employee) {
            return errorResponse(res, 'Employee profile not found', 404);
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return errorResponse(res, 'Task not found', 404);
        }

        // Verify employee is assigned to this task
        if (task.assignedTo.toString() !== employee._id.toString()) {
            return errorResponse(res, 'You are not authorized to update this task', 403);
        }

        // Validate delay reason if result is Delayed
        if (taskResult === 'Delayed' && !delayReason) {
            return errorResponse(res, 'Delay reason is required when marking task as delayed', 400);
        }

        task.taskResult = taskResult;
        if (delayReason) task.delayReason = delayReason;
        if (employeeNotes) task.employeeNotes = employeeNotes;

        // Update status based on result
        if (taskResult === 'Success') {
            task.status = 'Completed';
            task.completedAt = new Date();
            task.progressPercent = 100;
        } else if (taskResult === 'Failed') {
            task.status = 'Cancelled';
        }

        // Add activity log
        task.activityLog.push({
            action: 'Task Result Updated',
            performedBy: employee._id,
            details: `Task marked as ${taskResult}${delayReason ? ': ' + delayReason : ''}`
        });

        task.lastUpdatedBy = employee._id;
        await task.save();

        const updatedTask = await Task.findById(taskId)
            .populate('assignedTo', 'firstName lastName')
            .populate('assignedBy', 'firstName lastName');

        // Notify Task Creator/Assigner (Admin)
        if (updatedTask.assignedBy) {
            const adminId = updatedTask.assignedBy._id || updatedTask.assignedBy;
            if (adminId.toString() !== req.user.id) {
                const targetUser = await User.findById(adminId);
                const targetLink = (targetUser && (targetUser.role === 'employee' || targetUser.role === 'Employee'))
                    ? '/employee/tasks'
                    : `/tasks/${taskId}`;

                await sendNotification({
                    userId: adminId,
                    title: 'Task Result Updated',
                    message: `Task '${updatedTask.taskTitle}' marked as ${taskResult} by ${employee.firstName}.`,
                    type: 'info',
                    link: targetLink
                });
            }
        }

        logger.info(`Task result updated: ${task.taskTitle} - ${taskResult}`);

        return successResponse(res, { task: updatedTask }, 'Task result updated successfully');

    } catch (error) {
        logger.error('Update task result error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// Add comment to task
exports.addComment = async (req, res) => {
    try {
        const { comment } = req.body;
        const taskId = req.params.id;

        if (!comment || comment.trim() === '') {
            return errorResponse(res, 'Comment cannot be empty', 400);
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

        task.comments.push({
            comment: comment.trim(),
            commentedBy: employee._id
        });

        await task.save();

        const updatedTask = await Task.findById(taskId)
            .populate('comments.commentedBy', 'firstName lastName profileImage');

        logger.info(`Comment added to task: ${task.taskTitle}`);

        return successResponse(res, {
            task: updatedTask,
            newComment: updatedTask.comments[updatedTask.comments.length - 1]
        }, 'Comment added successfully');

    } catch (error) {
        logger.error('Add comment error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// Add time log
exports.addTimeLog = async (req, res) => {
    try {
        const { startTime, endTime, description } = req.body;
        const taskId = req.params.id;

        // Find the employee profile
        const employee = await Employee.findOne({ userId: req.user.id });
        if (!employee) {
            return errorResponse(res, 'Employee profile not found', 404);
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return errorResponse(res, 'Task not found', 404);
        }

        // Calculate duration in minutes
        let duration = 0;
        if (startTime && endTime) {
            const start = new Date(startTime);
            const end = new Date(endTime);
            duration = Math.round((end - start) / (1000 * 60)); // Convert to minutes
        }

        task.timeLogs.push({
            startTime,
            endTime,
            duration,
            loggedBy: employee._id,
            description
        });

        // Update actual hours
        const totalMinutes = task.timeLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
        task.actualHours = Math.round((totalMinutes / 60) * 10) / 10; // Round to 1 decimal

        await task.save();

        const updatedTask = await Task.findById(taskId)
            .populate('timeLogs.loggedBy', 'firstName lastName');

        logger.info(`Time log added to task: ${task.taskTitle}`);

        return successResponse(res, { task: updatedTask }, 'Time log added successfully');

    } catch (error) {
        logger.error('Add time log error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// Get task statistics for dashboard
exports.getTaskStatistics = async (req, res) => {
    try {
        const { department, employeeId } = req.query;

        const matchQuery = {};
        if (department) matchQuery.department = department;
        if (employeeId) matchQuery.assignedTo = employeeId;

        const stats = await Task.aggregate([
            { $match: matchQuery },
            {
                $facet: {
                    byStatus: [
                        {
                            $group: {
                                _id: '$status',
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    byPriority: [
                        {
                            $group: {
                                _id: '$priority',
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    byTaskType: [
                        {
                            $group: {
                                _id: '$taskType',
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    overall: [
                        {
                            $group: {
                                _id: null,
                                total: { $sum: 1 },
                                avgProgress: { $avg: '$progressPercent' },
                                avgEstimatedHours: { $avg: '$estimatedHours' },
                                avgActualHours: { $avg: '$actualHours' }
                            }
                        }
                    ]
                }
            }
        ]);

        return successResponse(res, { statistics: stats[0] }, 'Statistics retrieved successfully');

    } catch (error) {
        logger.error('Get task statistics error:', error);
        return errorResponse(res, error.message, 500);
    }
};
