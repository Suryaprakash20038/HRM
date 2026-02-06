const express = require('express');
const router = express.Router();
const employeeController = require('../../controllers/employee/employee.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { upload: uploadMiddleware, uploadToCloudinary } = require('../../middleware/upload.middleware');
const { validateEmployee, validateEmployeeUpdate } = require('../../validators/employee.validator');
const checkRole = require('../../middleware/role.middleware');

router.use(authMiddleware);

router.get('/', checkRole('admin', 'hr', 'md'), employeeController.getAllEmployees);
router.get('/me', employeeController.getMyProfile);
router.get('/stats', checkRole('admin', 'hr', 'md'), employeeController.getEmployeeStats);
router.get('/:id', employeeController.getEmployeeById);

router.post('/', (req, res, next) => {
    uploadMiddleware.fields([
        { name: 'profileImage', maxCount: 1 },
        { name: 'tenthMarksheet', maxCount: 1 },
        { name: 'twelfthMarksheet', maxCount: 1 },
        { name: 'degreeCertificate', maxCount: 1 },
        { name: 'consolidatedMarksheet', maxCount: 1 },
        { name: 'provisionalCertificate', maxCount: 1 },
        { name: 'aadharCard', maxCount: 1 },
        { name: 'panCard', maxCount: 1 },
        { name: 'resume', maxCount: 1 }
    ])(req, res, (err) => {
        if (err) {
            console.error('File Upload Error:', err);
            return res.status(400).json({
                status: 'error',
                message: err.message || 'File upload failed'
            });
        }
        next();
    });
}, uploadToCloudinary, validateEmployee, checkRole('admin', 'hr', 'md'), employeeController.createEmployee);

router.put('/:id', (req, res, next) => {
    uploadMiddleware.fields([
        { name: 'profileImage', maxCount: 1 },
        { name: 'tenthMarksheet', maxCount: 1 },
        { name: 'twelfthMarksheet', maxCount: 1 },
        { name: 'degreeCertificate', maxCount: 1 },
        { name: 'consolidatedMarksheet', maxCount: 1 },
        { name: 'provisionalCertificate', maxCount: 1 },
        { name: 'aadharCard', maxCount: 1 },
        { name: 'panCard', maxCount: 1 },
        { name: 'resume', maxCount: 1 }
    ])(req, res, (err) => {
        if (err) {
            console.error('File Upload Error:', err);
            return res.status(400).json({
                status: 'error',
                message: err.message || 'File upload failed'
            });
        }
        next();
    });
}, uploadToCloudinary, validateEmployeeUpdate, checkRole('admin', 'hr', 'md'), employeeController.updateEmployee);

router.delete('/:id', checkRole('admin', 'hr', 'md'), employeeController.deleteEmployee);
router.post('/:id/profile-image', uploadMiddleware.single('profileImage'), employeeController.uploadProfileImage);
router.post('/:id/generate-letter', checkRole('admin', 'hr', 'md'), employeeController.generateLetter);
router.post('/:id/communication', checkRole('admin', 'hr', 'md'), employeeController.sendCommunication);

module.exports = router;