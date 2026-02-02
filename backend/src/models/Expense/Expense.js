const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount must be positive']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Salary', 'Payroll', 'Rent', 'Utilities', 'Marketing', 'Office Supplies', 'Travel', 'Equipment', 'Other'],
        trim: true
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
        default: Date.now
    },
    note: {
        type: String,
        trim: true,
        maxlength: [500, 'Note cannot exceed 500 characters']
    },
    paymentMethod: {
        type: String,
        required: [true, 'Payment method is required'],
        enum: ['Cash', 'Bank Transfer', 'Credit Card', 'Debit Card', 'UPI', 'Cheque', 'Other'],
        default: 'Cash'
    },
    // Payment Details (conditional based on paymentMethod)
    upiId: {
        type: String,
        trim: true
    },
    bankName: {
        type: String,
        trim: true
    },
    accountNumber: {
        type: String,
        trim: true
    },
    ifscCode: {
        type: String,
        trim: true
    },
    chequeNumber: {
        type: String,
        trim: true
    },
    cardLastFourDigits: {
        type: String,
        trim: true,
        maxlength: 4
    },
    transactionId: {
        type: String,
        trim: true
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payroll'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Created by is required']
    }
}, {
    timestamps: true
});

// Index for faster queries
expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
