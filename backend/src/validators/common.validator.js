const { body, param } = require('express-validator');
const validate = require('../middleware/validation.middleware');

const validateId = [
    param('id')
        .isMongoId().withMessage('Invalid ID format'),

    validate
];

const validatePagination = [
    body('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

    body('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

    validate
];

module.exports = {
    validateId,
    validatePagination
};
