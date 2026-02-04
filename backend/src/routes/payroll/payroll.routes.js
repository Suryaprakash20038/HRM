const express = require('express');
const router = express.Router();
const payrollController = require('../../controllers/payroll/payroll.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { validatePayroll } = require('../../validators/payroll.validator');
const checkRole = require('../../middleware/role.middleware');
router.use(authMiddleware);

// Employee routes
router.get('/my-payslips', payrollController.getMyPayslips);

// Admin routes
router.get('/stats', checkRole('admin', 'hr', 'md'), payrollController.getPayrollStats);
router.get('/', checkRole('admin', 'hr', 'md'), payrollController.getAllPayroll);
router.post('/generate', checkRole('admin', 'hr', 'md'), validatePayroll, payrollController.generatePayroll);
router.get('/:id/slip', checkRole('admin', 'hr', 'md'), payrollController.getSalarySlip); // Or allow if own slip? But endpoint is /:id/slip. Typically safe to block unless logic inside checks user.
router.post('/:id/send-slip', checkRole('admin', 'hr', 'md'), payrollController.sendPayslip);
router.put('/:id', checkRole('admin', 'hr', 'md'), payrollController.updatePayroll);
router.delete('/:id', checkRole('admin', 'hr', 'md'), payrollController.deletePayroll);
module.exports = router;