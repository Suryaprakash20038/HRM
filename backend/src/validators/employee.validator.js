const { body } = require('express-validator');
const validate = require('../middleware/validation.middleware');

const validateEmployee = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('First name is required'),

    body('lastName')
        .trim()
        .notEmpty().withMessage('Last name is required'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email'),

    body('phone')
        .notEmpty().withMessage('Phone number is required'),

    body('dateOfBirth')
        .notEmpty().withMessage('Date of birth is required')
        .isISO8601().withMessage('Please provide a valid date'),

    body('gender')
        .notEmpty().withMessage('Gender is required')
        .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),

    body('city')
        .notEmpty().withMessage('City is required'),

    body('state')
        .notEmpty().withMessage('State is required'),

    body('zipCode')
        .notEmpty().withMessage('Zip code is required'),

    body('department')
        .notEmpty().withMessage('Department is required'),

    body('position')
        .notEmpty().withMessage('Position is required'),

    body('workLocation')
        .notEmpty().withMessage('Work location is required'),

    body('basicSalary')
        .notEmpty().withMessage('Basic salary is required')
        .isNumeric().withMessage('Basic salary must be a number'),

    body('employmentType')
        .optional()
        .isIn(['Full-time', 'Part-time', 'Contract', 'Intern'])
        .withMessage('Employment type must be Full-time, Part-time, Contract, or Intern'),

    body('status')
        .optional()
        .isIn(['Probation', 'Confirmed', 'Resignation Submitted', 'Notice Period', 'Exit Process', 'Relieved', 'Terminated', 'Intern'])
        .withMessage('Invalid status'),

    body('emergencyContactName')
        .notEmpty().withMessage('Emergency contact name is required'),

    body('emergencyContactPhone')
        .notEmpty().withMessage('Emergency contact phone is required'),

    body('emergencyContactRelation')
        .notEmpty().withMessage('Emergency contact relation is required'),

    validate,
];

const validateEmployeeUpdate = [
    body('firstName').optional().trim().notEmpty().withMessage('First name is required'),
    body('lastName').optional().trim().notEmpty().withMessage('Last name is required'),
    body('email').optional().trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Please provide a valid email'),
    body('phone').optional().notEmpty().withMessage('Phone number is required'),
    body('dateOfBirth').optional().notEmpty().withMessage('Date of birth is required').isISO8601().withMessage('Please provide a valid date'),
    body('gender').optional().notEmpty().withMessage('Gender is required').isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
    body('city').optional().notEmpty().withMessage('City is required'),
    body('state').optional().notEmpty().withMessage('State is required'),
    body('zipCode').optional().notEmpty().withMessage('Zip code is required'),
    body('department').optional().notEmpty().withMessage('Department is required'),
    body('position').optional().notEmpty().withMessage('Position is required'),
    body('workLocation').optional().notEmpty().withMessage('Work location is required'),
    body('basicSalary').optional().notEmpty().withMessage('Basic salary is required').isNumeric().withMessage('Basic salary must be a number'),
    body('employmentType').optional().isIn(['Full-time', 'Part-time', 'Contract', 'Intern']).withMessage('Employment type must be Full-time, Part-time, Contract, or Intern'),
    body('status').optional().isIn(['Probation', 'Confirmed', 'Resignation Submitted', 'Notice Period', 'Exit Process', 'Relieved', 'Terminated', 'Intern']).withMessage('Invalid status'),
    body('domain').optional().trim(),
    body('emergencyContactName').optional().notEmpty().withMessage('Emergency contact name is required'),
    body('emergencyContactPhone').optional().notEmpty().withMessage('Emergency contact phone is required'),
    body('emergencyContactRelation').optional().notEmpty().withMessage('Emergency contact relation is required'),
    validate
];

module.exports = {
    validateEmployee,
    validateEmployeeUpdate
};
