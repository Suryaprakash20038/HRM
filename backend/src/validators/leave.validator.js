const { body } = require('express-validator');
const validate = require('../middleware/validation.middleware');

const validateLeave = [
    body('employee')
        .notEmpty().withMessage('Employee ID is required'),

    body('leaveType')
        .notEmpty().withMessage('Leave type is required'),

    body('startDate')
        .notEmpty().withMessage('Start date is required')
        .isISO8601().withMessage('Invalid start date format'),

    body('endDate')
        .notEmpty().withMessage('End date is required')
        .isISO8601().withMessage('Invalid end date format'),

    body('reason')
        .trim()
        .notEmpty().withMessage('Reason is required')
        .isLength({ min: 3 }).withMessage('Reason must be at least 3 characters'),

    validate
];

module.exports = {
    validateLeave
};
