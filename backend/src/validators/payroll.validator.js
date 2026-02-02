const { body } = require('express-validator');
const validate = require('../middleware/validation.middleware');

const validatePayroll = [
    body('employeeId')
        .notEmpty().withMessage('Employee ID is required'),

    body('month')
        .isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),

    body('year')
        .isInt({ min: 2000, max: 2100 }).withMessage('Invalid year'),

    body('allowances')
        .optional()
        .isNumeric().withMessage('Allowances must be a number'),

    body('deductions')
        .optional()
        .isNumeric().withMessage('Deductions must be a number'),

    body('bonus')
        .optional()
        .isNumeric().withMessage('Bonus must be a number'),

    body('tax')
        .optional()
        .isNumeric().withMessage('Tax must be a number'),

    validate
];

module.exports = {
    validatePayroll
};
