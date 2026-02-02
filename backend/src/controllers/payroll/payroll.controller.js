const Payroll = require('../../models/Payroll/Payroll');
const Employee = require('../../models/Employee/Employee');
const Expense = require('../../models/Expense/Expense');
const logger = require('../../utils/logger');
const { successResponse, errorResponse } = require('../../utils/response');

exports.getAllPayroll = async (req, res) => {
    try {
        const { page = 1, limit = 10, month, year, department, paymentStatus } = req.query;
        const query = {};

        if (month) query.month = parseInt(month);
        if (year) query.year = parseInt(year);
        if (paymentStatus) query.paymentStatus = paymentStatus;

        // If department filter is provided, we need to filter by employee's department
        if (department) {
            const employees = await Employee.find({ department }).select('_id');
            query.employee = { $in: employees.map(emp => emp._id) };
        }

        const payrolls = await Payroll.find(query)
            .populate('employee', 'firstName lastName employeeId department designation profileImage email phone bankDetails')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ year: -1, month: -1 });

        const total = await Payroll.countDocuments(query);

        return successResponse(res, {
            payrolls,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        }, 'Payroll records retrieved successfully');
    } catch (error) {
        logger.error('Get all payroll error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.getPayrollStats = async (req, res) => {
    try {
        const { month, year } = req.query;
        const matchStage = {};

        if (month) matchStage.month = parseInt(month);
        if (year) matchStage.year = parseInt(year);

        const stats = await Payroll.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: 'employees',
                    localField: 'employee',
                    foreignField: '_id',
                    as: 'employeeDetails'
                }
            },
            { $unwind: '$employeeDetails' },
            {
                $group: {
                    _id: '$employeeDetails.department',
                    totalPaid: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, '$netSalary', 0]
                        }
                    },
                    totalPending: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentStatus', 'Pending'] }, '$netSalary', 0]
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return successResponse(res, { stats }, 'Payroll statistics retrieved successfully');
    } catch (error) {
        logger.error('Get payroll stats error:', error);
        return errorResponse(res, error.message, 500);
    }
};

const { getAttendanceSummary } = require('../../services/attendance.service');

exports.generatePayroll = async (req, res) => {
    try {
        const { employeeId, month, year, allowances, deductions, bonus, paymentDate, enableSandwichRule = false } = req.body;

        // 1. Validate Employee
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return errorResponse(res, 'Employee not found', 404);
        }

        // 2. Check for existing payroll
        const existingPayroll = await Payroll.findOne({ employee: employeeId, month, year });
        if (existingPayroll) {
            return errorResponse(res, 'Payroll already generated for this month', 400);
        }

        // 3. Define Date Range (1st to last day of month)
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        // 4. Get Attendance Summary
        const attendanceStats = await getAttendanceSummary(employeeId, startDate, endDate, enableSandwichRule);
        const { presentDays, absentDays, halfDays, lateDays, overtimeHours, missingHours, sandwichLeaveDays, lopDays } = attendanceStats;

        // 5. Financial Calculations (STRICT)
        const basicSalary = employee.basicSalary || 0;
        const finalAllowances = allowances !== undefined ? allowances : (employee.allowances || 0);
        const finalBonus = bonus || 0;
        // Manual deductions are DISALLOWED as per new rules. Only Tax + LOP.
        const finalDeductions = 0;

        // Dynamic Total Days (28, 29, 30, or 31)
        const daysInMonth = new Date(year, month, 0).getDate();
        const basicPerDay = basicSalary / daysInMonth;

        // Overtime Rate: (Basic / DaysInMonth / 8) * 1.5
        const perHourSalary = (basicPerDay / 8);
        const overtimeRate = perHourSalary * 1.5;
        const overtimePay = Math.round(overtimeHours * overtimeRate);

        // LOP Deduction (Includes Full Days, Half Days, and Missing Hours converted)
        const lopDeduction = Math.round(lopDays * basicPerDay);

        // Tax (2.5% of Basic)
        const tax = Math.round(basicSalary * 0.025);

        // 6. Net Salary Formula: Basic + Allowances + Bonus + Overtime - LOP - Tax
        const earnings = basicSalary + finalAllowances + finalBonus + overtimePay;
        const totalDeductions = finalDeductions + tax + lopDeduction;
        const netSalary = Math.round(earnings - totalDeductions);

        // 7. Payment Date
        let finalPaymentDate = paymentDate;
        if (!finalPaymentDate) {
            finalPaymentDate = new Date(year, month - 1, 7); // Default to 7th
        }

        // 8. Create Payroll Record
        const payroll = await Payroll.create({
            employee: employeeId,
            month,
            year,
            basicSalary,
            allowances: finalAllowances,
            deductions: finalDeductions, // storing 0
            bonus: finalBonus,
            tax,
            netSalary,
            attendanceSummary: {
                totalDays: daysInMonth,
                presentDays,
                absentDays,
                halfDays,
                lateDays,
                overtimeHours,
                missingHours,
                sandwichLeaveDays // newly added
            },
            salaryComponents: {
                basicPerDay: Math.round(basicPerDay * 100) / 100,
                perHourSalary: Math.round(perHourSalary * 100) / 100,
                overtimePay,
                lopDeduction
            },
            paymentDate: finalPaymentDate,
            bankDetails: employee.bankDetails || null
        });

        logger.info(`Payroll generated for ${employee.employeeId} (Net: ${netSalary})`);
        return successResponse(res, { payroll }, 'Payroll generated successfully', 201);

    } catch (error) {
        logger.error('Generate payroll error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.getSalarySlip = async (req, res) => {
    try {
        const payroll = await Payroll.findById(req.params.id)
            .populate('employee', 'firstName lastName employeeId position department joiningDate bankDetails');
        if (!payroll) {
            return errorResponse(res, 'Payroll record not found', 404);
        }
        return successResponse(res, { payroll }, 'Salary slip retrieved successfully');
    } catch (error) {
        logger.error('Get salary slip error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.updatePayroll = async (req, res) => {
    try {
        const { paymentStatus } = req.body;

        // 1. Get current state BEFORE update to check if it was already paid
        const currentPayroll = await Payroll.findById(req.params.id);
        if (!currentPayroll) {
            return errorResponse(res, 'Payroll record not found', 404);
        }

        const wasAlreadyPaid = currentPayroll.paymentStatus === 'Paid';

        // 2. Update Payroll
        const payroll = await Payroll.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('employee', 'firstName lastName');

        // 3. Auto-create Expense if MARKED AS PAID and WAS NOT PAID before
        if (paymentStatus === 'Paid' && !wasAlreadyPaid) {
            // Double check to prevent duplicates
            const existingExpense = await Expense.findOne({ referenceId: payroll._id });

            if (!existingExpense) {
                /* 
                   req.user is typically available from authMiddleware. 
                   If for some reason it's missing (e.g. testing), handle gracefully.
                */
                const userId = req.user ? req.user.id : payroll.employee._id; // Fallback to employee if admin not found (edge case)

                await Expense.create({
                    title: `Payroll: ${payroll.employee.firstName} ${payroll.employee.lastName} - ${payroll.month}/${payroll.year}`,
                    amount: payroll.netSalary,
                    category: 'Payroll',
                    date: new Date(),
                    paymentMethod: payroll.paymentMethod || 'Bank Transfer',
                    referenceId: payroll._id,
                    createdBy: userId, // Tracking who processed it
                    note: `Auto-generated from Payroll #${payroll._id}`
                });

                logger.info(`Auto-created expense for Payroll ${payroll._id}`);
            }
        }

        logger.info(`Payroll updated: ${payroll._id}`);
        return successResponse(res, { payroll }, 'Payroll updated successfully');
    } catch (error) {
        logger.error('Update payroll error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.deletePayroll = async (req, res) => {
    try {
        const payroll = await Payroll.findByIdAndDelete(req.params.id);
        if (!payroll) {
            return errorResponse(res, 'Payroll record not found', 404);
        }
        logger.info(`Payroll deleted: ${payroll._id}`);
        return successResponse(res, null, 'Payroll record deleted successfully');
    } catch (error) {
        logger.error('Delete payroll error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.sendPayslip = async (req, res) => {
    try {
        const payroll = await Payroll.findById(req.params.id).populate('employee', 'email firstName');
        if (!payroll) {
            return errorResponse(res, 'Payroll record not found', 404);
        }

        // Mock email sending logic
        // In a real app, you would use nodemailer or an email service here
        logger.info(`Sending payslip to ${payroll.employee.email}`);

        return successResponse(res, { sent: true, email: payroll.employee.email }, 'Payslip sent successfully');
    } catch (error) {
        logger.error('Send payslip error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// Get payslips for the logged-in employee
exports.getMyPayslips = async (req, res) => {
    try {
        const { year, limit = 100 } = req.query;

        console.log('🔍 getMyPayslips called - User email:', req.user?.email);

        // Find the employee profile associated with the logged-in user
        const employee = await Employee.findOne({ email: req.user.email });

        console.log('   Employee lookup result:', employee ? `Found: ${employee.firstName} ${employee.lastName}` : 'NOT FOUND');

        if (!employee) {
            console.log('   ❌ No employee found with email:', req.user.email);
            logger.warn(`Employee profile not found for email: ${req.user.email}`);
            return errorResponse(res, 'Employee profile not found', 404);
        }

        // Build query
        const query = { employee: employee._id };
        if (year) query.year = parseInt(year);

        console.log('   Fetching payrolls with query:', query);

        // Fetch payroll records for this employee
        const payrolls = await Payroll.find(query)
            .populate('employee', 'firstName lastName employeeId department designation profileImage email phone bankDetails')
            .limit(parseInt(limit))
            .sort({ year: -1, month: -1 });

        const total = await Payroll.countDocuments(query);

        console.log(`   ✅ Found ${payrolls.length} payroll records`);
        logger.info(`Employee ${employee.employeeId} fetched ${payrolls.length} payslips`);

        return successResponse(res, {
            payrolls,
            total,
            employee: {
                _id: employee._id,
                firstName: employee.firstName,
                lastName: employee.lastName,
                employeeId: employee.employeeId,
                department: employee.department
            }
        }, 'Payslips retrieved successfully');
    } catch (error) {
        console.error('❌ getMyPayslips error:', error);
        logger.error('Get my payslips error:', error);
        return errorResponse(res, error.message, 500);
    }
};