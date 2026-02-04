const express = require('express');
const router = express.Router();
const accountsController = require('../../controllers/accounts/accounts.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const checkRole = require('../../middleware/role.middleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);
router.use(checkRole('admin', 'md'));

// ==================== INCOME ROUTES ====================
router.post('/income', accountsController.createIncome);
router.get('/income', accountsController.getAllIncome);
router.get('/income/:id', accountsController.getIncomeById);
router.put('/income/:id', accountsController.updateIncome);
router.delete('/income/:id', accountsController.deleteIncome);

// ==================== EXPENSE ROUTES ====================
router.post('/expense', accountsController.createExpense);
router.get('/expense', accountsController.getAllExpense);
router.get('/expense/:id', accountsController.getExpenseById);
router.put('/expense/:id', accountsController.updateExpense);
router.delete('/expense/:id', accountsController.deleteExpense);

// ==================== SUMMARY & REPORTS ====================
router.get('/summary', accountsController.getSummary);
router.get('/monthly-report', accountsController.getMonthlyReport);

module.exports = router;
