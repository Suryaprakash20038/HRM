const express = require('express');
const router = express.Router();
const payrollController = require('../../controllers/payroll/payroll.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { validatePayroll } = require('../../validators/payroll.validator');
router.use(authMiddleware);

// Employee routes
router.get('/my-payslips', payrollController.getMyPayslips);

// Admin routes
router.get('/stats', payrollController.getPayrollStats);
router.get('/', payrollController.getAllPayroll);
router.post('/generate', validatePayroll, payrollController.generatePayroll);
router.get('/:id/slip', payrollController.getSalarySlip);
router.post('/:id/send-slip', payrollController.sendPayslip);
router.put('/:id', payrollController.updatePayroll);
router.delete('/:id', payrollController.deletePayroll);
module.exports = router;