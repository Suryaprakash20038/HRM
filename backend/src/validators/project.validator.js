const { body } = require('express-validator');
const validate = require('../middleware/validation.middleware');

const validateProject = [
    body('projectName')
        .trim()
        .notEmpty().withMessage('Project name is required'),

    body('department')
        .notEmpty().withMessage('Department is required'),

    body('manager')
        .notEmpty().withMessage('Manager is required'),

    body('teamLead')
        .notEmpty().withMessage('Team Lead is required'),

    body('startDate')
        .notEmpty().withMessage('Start date is required')
        .isISO8601().withMessage('Invalid start date format'),

    body('deadline')
        .notEmpty().withMessage('Deadline is required')
        .isISO8601().withMessage('Invalid deadline format'),

    body('status')
        .optional()
        .isIn(['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'])
        .withMessage('Invalid status'),

    body('progress')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('Progress must be between 0 and 100'),

    validate
];

module.exports = {
    validateProject
};
