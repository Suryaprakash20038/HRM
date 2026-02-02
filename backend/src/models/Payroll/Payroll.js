const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        required: true
    },
    attendanceSummary: {
        totalDays: { type: Number, default: 30 },
        presentDays: { type: Number, default: 0 },
        absentDays: { type: Number, default: 0 },
        halfDays: { type: Number, default: 0 },
        lateDays: { type: Number, default: 0 },
        // Track accumulated missing working hours for LOP
        missingHours: { type: Number, default: 0 },
        paidLeaveDays: { type: Number, default: 0 },
        weekOffs: { type: Number, default: 0 },
        holidays: { type: Number, default: 0 },
        overtimeHours: { type: Number, default: 0 }
    },
    salaryComponents: {
        basicPerDay: { type: Number, default: 0 },
        perHourSalary: { type: Number, default: 0 },
        overtimePay: { type: Number, default: 0 },
        lopDeduction: { type: Number, default: 0 }
    },
    basicSalary: {
        type: Number,
        required: true
    },
    allowances: {
        type: Number,
        default: 0
    },
    deductions: {
        type: Number,
        default: 0
    },
    bonus: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    netSalary: {
        type: Number,
        required: true
    },
    paymentDate: {
        type: Date
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
    },
    paymentMethod: {
        type: String,
        enum: ['Bank Transfer', 'Cash', 'Cheque'],
        default: 'Bank Transfer'
    },
    bankDetails: {
        accountNumber: String,
        accountHolderName: String,
        ifscCode: String,
        branchName: String
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

payrollSchema.pre('save', function (next) {
    // Net Salary = (Basic + Allowances + Bonus + Overtime) - (Deductions + Tax + LOP)
    const earnings = (this.basicSalary || 0) + (this.allowances || 0) + (this.bonus || 0) + (this.salaryComponents?.overtimePay || 0);
    const deductions = (this.deductions || 0) + (this.tax || 0) + (this.salaryComponents?.lopDeduction || 0);

    this.netSalary = Math.round((earnings - deductions) * 100) / 100;
    next();
});

payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
