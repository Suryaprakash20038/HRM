const { body, param, query, validationResult } = require('express-validator');

// Validation middleware for creating task
exports.validateCreateTask = [
    body('taskTitle')
        .trim()
        .notEmpty()
        .withMessage('Task title is required')
        .isLength({ min: 3, max: 200 })
        .withMessage('Task title must be between 3 and 200 characters'),

    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ min: 10 })
        .withMessage('Description must be at least 10 characters'),

    body('taskType')
        .optional()
        .isIn(['Feature', 'Bug', 'Improvement', 'Research', 'Meeting', 'Admin', 'Testing', 'Documentation', 'Other'])
        .withMessage('Invalid task type'),

    body('priority')
        .optional()
        .isIn(['Low', 'Medium', 'High', 'Urgent'])
        .withMessage('Invalid priority'),

    body('status')
        .optional()
        .isIn(['To Do', 'In Progress', 'Review', 'Completed', 'Cancelled'])
        .withMessage('Invalid status'),

    body('assignedTo')
        .notEmpty()
        .withMessage('Assigned to is required')
        .isMongoId()
        .withMessage('Invalid employee ID'),

    body('department')
        .trim()
        .notEmpty()
        .withMessage('Department is required'),

    body('members')
        .optional()
        .isArray()
        .withMessage('Members must be an array'),

    body('members.*')
        .optional()
        .isMongoId()
        .withMessage('Invalid member ID'),

    body('startDate')
        .notEmpty()
        .withMessage('Start date is required')
        .isISO8601()
        .withMessage('Invalid start date format'),

    body('dueDate')
        .notEmpty()
        .withMessage('Due date is required')
        .isISO8601()
        .withMessage('Invalid due date format')
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.startDate)) {
                throw new Error('Due date must be after start date');
            }
            return true;
        }),

    body('estimatedHours')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Estimated hours must be a positive number'),

    body('relatedProject')
        .optional()
        .isMongoId()
        .withMessage('Invalid project ID'),

    body('progressPercent')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('Progress must be between 0 and 100'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        next();
    }
];

// Validation middleware for updating task
exports.validateUpdateTask = [
    param('id')
        .isMongoId()
        .withMessage('Invalid task ID'),

    body('taskTitle')
        .optional()
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Task title must be between 3 and 200 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ min: 10 })
        .withMessage('Description must be at least 10 characters'),

    body('taskType')
        .optional()
        .isIn(['Feature', 'Bug', 'Improvement', 'Research', 'Meeting', 'Admin', 'Testing', 'Documentation', 'Other'])
        .withMessage('Invalid task type'),

    body('priority')
        .optional()
        .isIn(['Low', 'Medium', 'High', 'Urgent'])
        .withMessage('Invalid priority'),

    body('status')
        .optional()
        .isIn(['To Do', 'In Progress', 'Review', 'Completed', 'Cancelled'])
        .withMessage('Invalid status'),

    body('assignedTo')
        .optional()
        .isMongoId()
        .withMessage('Invalid employee ID'),

    body('progressPercent')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('Progress must be between 0 and 100'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        next();
    }
];

// Validation middleware for updating progress
exports.validateUpdateProgress = [
    param('id')
        .isMongoId()
        .withMessage('Invalid task ID'),

    body('progressPercent')
        .notEmpty()
        .withMessage('Progress percentage is required')
        .isInt({ min: 0, max: 100 })
        .withMessage('Progress must be between 0 and 100'),

    body('comment')
        .optional()
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('Comment must be between 1 and 500 characters'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        next();
    }
];

// Validation middleware for updating task result
exports.validateUpdateResult = [
    param('id')
        .isMongoId()
        .withMessage('Invalid task ID'),

    body('taskResult')
        .notEmpty()
        .withMessage('Task result is required')
        .isIn(['Pending', 'Success', 'Failed', 'Reassigned', 'Delayed'])
        .withMessage('Invalid task result'),

    body('delayReason')
        .if(body('taskResult').equals('Delayed'))
        .notEmpty()
        .withMessage('Delay reason is required when task is delayed')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Delay reason must be between 10 and 500 characters'),

    body('employeeNotes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Employee notes must not exceed 1000 characters'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        next();
    }
];

// Validation middleware for adding comment
exports.validateAddComment = [
    param('id')
        .isMongoId()
        .withMessage('Invalid task ID'),

    body('comment')
        .trim()
        .notEmpty()
        .withMessage('Comment is required')
        .isLength({ min: 1, max: 1000 })
        .withMessage('Comment must be between 1 and 1000 characters'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        next();
    }
];

// Validation middleware for adding time log
exports.validateAddTimeLog = [
    param('id')
        .isMongoId()
        .withMessage('Invalid task ID'),

    body('startTime')
        .notEmpty()
        .withMessage('Start time is required')
        .isISO8601()
        .withMessage('Invalid start time format'),

    body('endTime')
        .optional()
        .isISO8601()
        .withMessage('Invalid end time format')
        .custom((value, { req }) => {
            if (value && new Date(value) <= new Date(req.body.startTime)) {
                throw new Error('End time must be after start time');
            }
            return true;
        }),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        next();
    }
];
