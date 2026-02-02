const Income = require('../../models/Income/Income');
const Expense = require('../../models/Expense/Expense');

// ==================== INCOME CONTROLLERS ====================

// Create new income
exports.createIncome = async (req, res) => {
    try {
        const {
            title, amount, category, date, note, paymentMethod,
            upiId, bankName, accountNumber, ifscCode, chequeNumber, cardLastFourDigits, transactionId
        } = req.body;

        // Validation
        if (!title || !amount || !category || !date || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const income = await Income.create({
            title,
            amount,
            category,
            date,
            note,
            paymentMethod,
            upiId,
            bankName,
            accountNumber,
            ifscCode,
            chequeNumber,
            cardLastFourDigits,
            transactionId,
            createdBy: req.user.id
        });

        await income.populate('createdBy', 'firstName lastName email');

        res.status(201).json({
            success: true,
            message: 'Income created successfully',
            data: income
        });
    } catch (error) {
        console.error('Create income error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create income',
            error: error.message
        });
    }
};

// Get all income records
exports.getAllIncome = async (req, res) => {
    try {
        const { startDate, endDate, category, month, year } = req.query;

        // Build filter - show all income for now (can be filtered by user if needed)
        const filter = {};

        // Date range filter
        if (startDate && endDate) {
            filter.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Monthly filter
        if (month && year) {
            const monthNum = parseInt(month);
            const yearNum = parseInt(year);
            const startOfMonth = new Date(yearNum, monthNum - 1, 1);
            const endOfMonth = new Date(yearNum, monthNum, 0, 23, 59, 59);
            filter.date = {
                $gte: startOfMonth,
                $lte: endOfMonth
            };
        }

        // Yearly filter
        if (year && !month) {
            const yearNum = parseInt(year);
            const startOfYear = new Date(yearNum, 0, 1);
            const endOfYear = new Date(yearNum, 11, 31, 23, 59, 59);
            filter.date = {
                $gte: startOfYear,
                $lte: endOfYear
            };
        }

        // Category filter
        if (category) {
            filter.category = category;
        }

        const incomes = await Income.find(filter)
            .populate('createdBy', 'firstName lastName email')
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: incomes.length,
            data: incomes
        });
    } catch (error) {
        console.error('Get income error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch income records',
            error: error.message
        });
    }
};

// Get single income
exports.getIncomeById = async (req, res) => {
    try {
        const income = await Income.findById(req.params.id)
            .populate('createdBy', 'firstName lastName email');

        if (!income) {
            return res.status(404).json({
                success: false,
                message: 'Income not found'
            });
        }

        res.status(200).json({
            success: true,
            data: income
        });
    } catch (error) {
        console.error('Get income by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch income',
            error: error.message
        });
    }
};

// Update income
exports.updateIncome = async (req, res) => {
    try {
        const {
            title, amount, category, date, note, paymentMethod,
            upiId, bankName, accountNumber, ifscCode, chequeNumber, cardLastFourDigits, transactionId
        } = req.body;

        const income = await Income.findByIdAndUpdate(
            req.params.id,
            {
                title, amount, category, date, note, paymentMethod,
                upiId, bankName, accountNumber, ifscCode, chequeNumber, cardLastFourDigits, transactionId
            },
            { new: true, runValidators: true }
        ).populate('createdBy', 'firstName lastName email');

        if (!income) {
            return res.status(404).json({
                success: false,
                message: 'Income not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Income updated successfully',
            data: income
        });
    } catch (error) {
        console.error('Update income error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update income',
            error: error.message
        });
    }
};

// Delete income
exports.deleteIncome = async (req, res) => {
    try {
        const income = await Income.findByIdAndDelete(req.params.id);

        if (!income) {
            return res.status(404).json({
                success: false,
                message: 'Income not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Income deleted successfully'
        });
    } catch (error) {
        console.error('Delete income error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete income',
            error: error.message
        });
    }
};

// ==================== EXPENSE CONTROLLERS ====================

// Create new expense
exports.createExpense = async (req, res) => {
    try {
        const {
            title, amount, category, date, note, paymentMethod,
            upiId, bankName, accountNumber, ifscCode, chequeNumber, cardLastFourDigits, transactionId
        } = req.body;

        // Validation
        if (!title || !amount || !category || !date || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const expense = await Expense.create({
            title,
            amount,
            category,
            date,
            note,
            paymentMethod,
            upiId,
            bankName,
            accountNumber,
            ifscCode,
            chequeNumber,
            cardLastFourDigits,
            transactionId,
            createdBy: req.user.id
        });

        await expense.populate('createdBy', 'firstName lastName email');

        res.status(201).json({
            success: true,
            message: 'Expense created successfully',
            data: expense
        });
    } catch (error) {
        console.error('Create expense error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create expense',
            error: error.message
        });
    }
};

// Get all expense records
exports.getAllExpense = async (req, res) => {
    try {
        const { startDate, endDate, category, month, year } = req.query;

        // Build filter
        const filter = {};

        // Date range filter
        if (startDate && endDate) {
            filter.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Monthly filter
        if (month && year) {
            const monthNum = parseInt(month);
            const yearNum = parseInt(year);
            const startOfMonth = new Date(yearNum, monthNum - 1, 1);
            const endOfMonth = new Date(yearNum, monthNum, 0, 23, 59, 59);
            filter.date = {
                $gte: startOfMonth,
                $lte: endOfMonth
            };
        }

        // Yearly filter
        if (year && !month) {
            const yearNum = parseInt(year);
            const startOfYear = new Date(yearNum, 0, 1);
            const endOfYear = new Date(yearNum, 11, 31, 23, 59, 59);
            filter.date = {
                $gte: startOfYear,
                $lte: endOfYear
            };
        }

        // Category filter
        if (category) {
            filter.category = category;
        }

        const expenses = await Expense.find(filter)
            .populate('createdBy', 'firstName lastName email')
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: expenses.length,
            data: expenses
        });
    } catch (error) {
        console.error('Get expense error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch expense records',
            error: error.message
        });
    }
};

// Get single expense
exports.getExpenseById = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id)
            .populate('createdBy', 'firstName lastName email');

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        res.status(200).json({
            success: true,
            data: expense
        });
    } catch (error) {
        console.error('Get expense by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch expense',
            error: error.message
        });
    }
};

// Update expense
exports.updateExpense = async (req, res) => {
    try {
        const {
            title, amount, category, date, note, paymentMethod,
            upiId, bankName, accountNumber, ifscCode, chequeNumber, cardLastFourDigits, transactionId
        } = req.body;

        const expense = await Expense.findByIdAndUpdate(
            req.params.id,
            {
                title, amount, category, date, note, paymentMethod,
                upiId, bankName, accountNumber, ifscCode, chequeNumber, cardLastFourDigits, transactionId
            },
            { new: true, runValidators: true }
        ).populate('createdBy', 'firstName lastName email');

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Expense updated successfully',
            data: expense
        });
    } catch (error) {
        console.error('Update expense error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update expense',
            error: error.message
        });
    }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Expense deleted successfully'
        });
    } catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete expense',
            error: error.message
        });
    }
};

// ==================== SUMMARY & REPORTS ====================

// Get summary (total income, expense, balance)
exports.getSummary = async (req, res) => {
    try {
        const { month, year } = req.query;
        const filter = {};

        // Apply date filter if provided
        if (month && year) {
            const monthNum = parseInt(month);
            const yearNum = parseInt(year);
            const startOfMonth = new Date(yearNum, monthNum - 1, 1);
            const endOfMonth = new Date(yearNum, monthNum, 0, 23, 59, 59);
            filter.date = {
                $gte: startOfMonth,
                $lte: endOfMonth
            };
        } else if (year) {
            const yearNum = parseInt(year);
            const startOfYear = new Date(yearNum, 0, 1);
            const endOfYear = new Date(yearNum, 11, 31, 23, 59, 59);
            filter.date = {
                $gte: startOfYear,
                $lte: endOfYear
            };
        }

        // Calculate totals
        const incomeResult = await Income.aggregate([
            { $match: filter },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const expenseResult = await Expense.aggregate([
            { $match: filter },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalIncome = incomeResult.length > 0 ? incomeResult[0].total : 0;
        const totalExpense = expenseResult.length > 0 ? expenseResult[0].total : 0;
        const balance = totalIncome - totalExpense;

        // Get this month's data
        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const thisMonthFilter = {
            date: {
                $gte: startOfThisMonth,
                $lte: endOfThisMonth
            }
        };

        const thisMonthIncomeResult = await Income.aggregate([
            { $match: thisMonthFilter },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const thisMonthExpenseResult = await Expense.aggregate([
            { $match: thisMonthFilter },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const thisMonthIncome = thisMonthIncomeResult.length > 0 ? thisMonthIncomeResult[0].total : 0;
        const thisMonthExpense = thisMonthExpenseResult.length > 0 ? thisMonthExpenseResult[0].total : 0;

        res.status(200).json({
            success: true,
            data: {
                totalIncome,
                totalExpense,
                balance,
                thisMonthIncome,
                thisMonthExpense
            }
        });
    } catch (error) {
        console.error('Get summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch summary',
            error: error.message
        });
    }
};

// Get monthly report
exports.getMonthlyReport = async (req, res) => {
    try {
        const { year } = req.query;
        const targetYear = year ? parseInt(year) : new Date().getFullYear();

        const filter = {
            date: {
                $gte: new Date(targetYear, 0, 1),
                $lte: new Date(targetYear, 11, 31, 23, 59, 59)
            }
        };

        // Get income by month
        const incomeByMonth = await Income.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: { $month: '$date' },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get expense by month
        const expenseByMonth = await Expense.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: { $month: '$date' },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Format data for all 12 months
        const monthlyData = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        for (let i = 1; i <= 12; i++) {
            const incomeData = incomeByMonth.find(item => item._id === i);
            const expenseData = expenseByMonth.find(item => item._id === i);

            monthlyData.push({
                month: monthNames[i - 1],
                monthNumber: i,
                income: incomeData ? incomeData.total : 0,
                expense: expenseData ? expenseData.total : 0,
                balance: (incomeData ? incomeData.total : 0) - (expenseData ? expenseData.total : 0)
            });
        }

        res.status(200).json({
            success: true,
            year: targetYear,
            data: monthlyData
        });
    } catch (error) {
        console.error('Get monthly report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch monthly report',
            error: error.message
        });
    }
};
