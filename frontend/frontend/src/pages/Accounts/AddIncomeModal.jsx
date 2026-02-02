import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign } from 'lucide-react';

const AddIncomeModal = ({ isOpen, onClose, onSubmit, editData }) => {
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Sales',
        date: new Date().toISOString().split('T')[0],
        note: '',
        paymentMethod: 'Cash',
        // Payment details
        upiId: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        chequeNumber: '',
        cardLastFourDigits: '',
        transactionId: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (editData) {
            setFormData({
                title: editData.title,
                amount: editData.amount,
                category: editData.category,
                date: new Date(editData.date).toISOString().split('T')[0],
                note: editData.note || '',
                paymentMethod: editData.paymentMethod,
                upiId: editData.upiId || '',
                bankName: editData.bankName || '',
                accountNumber: editData.accountNumber || '',
                ifscCode: editData.ifscCode || '',
                chequeNumber: editData.chequeNumber || '',
                cardLastFourDigits: editData.cardLastFourDigits || '',
                transactionId: editData.transactionId || ''
            });
        } else {
            setFormData({
                title: '',
                amount: '',
                category: 'Sales',
                date: new Date().toISOString().split('T')[0],
                note: '',
                paymentMethod: 'Cash',
                upiId: '',
                bankName: '',
                accountNumber: '',
                ifscCode: '',
                chequeNumber: '',
                cardLastFourDigits: '',
                transactionId: ''
            });
        }
        setErrors({});
    }, [editData, isOpen]);

    const incomeCategories = ['Sales', 'Services', 'Investment', 'Refund', 'Other'];
    const paymentMethods = ['Cash', 'Bank Transfer', 'Credit Card', 'Debit Card', 'UPI', 'Cheque', 'Other'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.amount || formData.amount <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        }

        if (!formData.category) {
            newErrors.category = 'Category is required';
        }

        if (!formData.date) {
            newErrors.date = 'Date is required';
        }

        if (!formData.paymentMethod) {
            newErrors.paymentMethod = 'Payment method is required';
        }

        // Conditional validation based on payment method
        if (formData.paymentMethod === 'UPI' && !formData.upiId.trim()) {
            newErrors.upiId = 'UPI ID is required';
        }

        if (formData.paymentMethod === 'Bank Transfer') {
            if (!formData.bankName.trim()) newErrors.bankName = 'Bank name is required';
            if (!formData.accountNumber.trim()) newErrors.accountNumber = 'Account number is required';
            if (!formData.ifscCode.trim()) newErrors.ifscCode = 'IFSC code is required';
        }

        if (formData.paymentMethod === 'Cheque' && !formData.chequeNumber.trim()) {
            newErrors.chequeNumber = 'Cheque number is required';
        }

        if ((formData.paymentMethod === 'Credit Card' || formData.paymentMethod === 'Debit Card') && !formData.cardLastFourDigits.trim()) {
            newErrors.cardLastFourDigits = 'Last 4 digits are required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validate()) {
            onSubmit(formData);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                    style={{ border: '1px solid #E6C7E6' }}
                >
                    {/* Header */}
                    <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '2px solid #E6C7E6' }}>
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-xl" style={{ backgroundColor: '#E6C7E6', color: '#663399' }}>
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="fw-bold m-0" style={{ color: '#2E1A47' }}>
                                    {editData ? 'Modify Revenue Record' : 'Log New Stream of Income'}
                                </h4>
                                <p className="small m-0 opacity-75" style={{ color: '#A3779D' }}>Financial year {new Date().getFullYear()}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="btn btn-link p-2 rounded-full hover:bg-light transition-colors text-decoration-none"
                            style={{ color: '#A3779D' }}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
                        {/* Title */}
                        <div>
                            <label className="small fw-bold mb-2 d-block" style={{ color: '#2E1A47' }}>
                                Reference Label <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="form-control"
                                style={{ borderColor: '#E6C7E6', borderRadius: '12px', padding: '12px', color: '#663399', fontWeight: 500 }}
                                placeholder="e.g. Q1 Software Licensing Fee"
                            />
                            {errors.title && (
                                <p className="mt-1 x-small text-danger fw-bold">{errors.title}</p>
                            )}
                        </div>

                        {/* Amount and Category */}
                        <div className="row g-4">
                            <div className="col-md-6">
                                <label className="small fw-bold mb-2 d-block" style={{ color: '#2E1A47' }}>
                                    Transaction Amount (₹) <span className="text-danger">*</span>
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0" style={{ borderColor: '#E6C7E6', borderRadius: '12px 0 0 12px', color: '#A3779D' }}>₹</span>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        className="form-control border-start-0"
                                        style={{ borderColor: '#E6C7E6', borderRadius: '0 12px 12px 0', padding: '12px', color: '#10B981', fontWeight: 'bold', fontSize: '1.1rem' }}
                                        placeholder="0.00"
                                    />
                                </div>
                                {errors.amount && (
                                    <p className="mt-1 x-small text-danger fw-bold">{errors.amount}</p>
                                )}
                            </div>

                            <div className="col-md-6">
                                <label className="small fw-bold mb-2 d-block" style={{ color: '#2E1A47' }}>
                                    Business Category <span className="text-danger">*</span>
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="form-select"
                                    style={{ borderColor: '#E6C7E6', borderRadius: '12px', padding: '12px', color: '#663399', fontWeight: 600 }}
                                >
                                    {incomeCategories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Date and Payment Method */}
                        <div className="row g-4">
                            <div className="col-md-6">
                                <label className="small fw-bold mb-2 d-block" style={{ color: '#2E1A47' }}>
                                    Entry Date <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="form-control"
                                    style={{ borderColor: '#E6C7E6', borderRadius: '12px', padding: '12px', color: '#663399' }}
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="small fw-bold mb-2 d-block" style={{ color: '#2E1A47' }}>
                                    Disbursement Channel <span className="text-danger">*</span>
                                </label>
                                <select
                                    name="paymentMethod"
                                    value={formData.paymentMethod}
                                    onChange={handleChange}
                                    className="form-select"
                                    style={{ borderColor: '#E6C7E6', borderRadius: '12px', padding: '12px', color: '#663399', fontWeight: 600 }}
                                >
                                    {paymentMethods.map(method => (
                                        <option key={method} value={method}>{method}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Dynamic Details Section */}
                        {formData.paymentMethod !== 'Cash' && formData.paymentMethod !== 'Other' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-4 rounded-2xl"
                                style={{ backgroundColor: '#fdfbff', border: '1px dashed #E6C7E6' }}
                            >
                                <h6 className="small fw-bold mb-3" style={{ color: '#663399' }}>Supplementary Channel Verification</h6>

                                {formData.paymentMethod === 'UPI' && (
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <input
                                                type="text"
                                                name="upiId"
                                                value={formData.upiId}
                                                onChange={handleChange}
                                                className="form-control small"
                                                style={{ borderColor: '#E6C7E6', borderRadius: '10px', fontSize: '13px' }}
                                                placeholder="Unified Payments ID (e.g. user@bank)"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <input
                                                type="text"
                                                name="transactionId"
                                                value={formData.transactionId}
                                                onChange={handleChange}
                                                className="form-control small"
                                                style={{ borderColor: '#E6C7E6', borderRadius: '10px', fontSize: '13px' }}
                                                placeholder="Unique Transaction ID"
                                            />
                                        </div>
                                    </div>
                                )}

                                {formData.paymentMethod === 'Bank Transfer' && (
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <input
                                                type="text"
                                                name="bankName"
                                                placeholder="Banking Institution"
                                                value={formData.bankName}
                                                onChange={handleChange}
                                                className="form-control small"
                                                style={{ borderColor: '#E6C7E6', borderRadius: '10px', fontSize: '13px' }}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <input
                                                type="text"
                                                name="accountNumber"
                                                placeholder="Accounting Reference"
                                                value={formData.accountNumber}
                                                onChange={handleChange}
                                                className="form-control small"
                                                style={{ borderColor: '#E6C7E6', borderRadius: '10px', fontSize: '13px' }}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <input
                                                type="text"
                                                name="ifscCode"
                                                placeholder="Branch Routing Code"
                                                value={formData.ifscCode}
                                                onChange={handleChange}
                                                className="form-control small"
                                                style={{ borderColor: '#E6C7E6', borderRadius: '10px', fontSize: '13px' }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {formData.paymentMethod === 'Cheque' && (
                                    <div className="row g-3">
                                        <div className="col-md-12">
                                            <input
                                                type="text"
                                                name="chequeNumber"
                                                placeholder="Serial Number on Cheque"
                                                value={formData.chequeNumber}
                                                onChange={handleChange}
                                                className="form-control small"
                                                style={{ borderColor: '#E6C7E6', borderRadius: '10px', fontSize: '13px' }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {(formData.paymentMethod === 'Credit Card' || formData.paymentMethod === 'Debit Card') && (
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <input
                                                type="text"
                                                name="cardLastFourDigits"
                                                maxLength="4"
                                                placeholder="Suffix (Last 4 Digits)"
                                                value={formData.cardLastFourDigits}
                                                onChange={handleChange}
                                                className="form-control small"
                                                style={{ borderColor: '#E6C7E6', borderRadius: '10px', fontSize: '13px' }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Note */}
                        <div>
                            <label className="small fw-bold mb-2 d-block" style={{ color: '#2E1A47' }}>
                                Internal Annotations
                            </label>
                            <textarea
                                name="note"
                                value={formData.note}
                                onChange={handleChange}
                                rows="3"
                                className="form-control"
                                style={{ borderColor: '#E6C7E6', borderRadius: '12px', padding: '12px', color: '#663399' }}
                                placeholder="Strategic context or additional transaction metadata..."
                            />
                        </div>

                        {/* Footer Buttons */}
                        <div className="d-flex align-items-center justify-content-end gap-3 pt-4" style={{ borderTop: '1px solid #E6C7E6' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn px-4 fw-bold"
                                style={{ color: '#A3779D' }}
                            >
                                Discard
                            </button>
                            <button
                                type="submit"
                                className="btn px-5 shadow-lg"
                                style={{ backgroundColor: '#663399', color: '#ffffff', fontWeight: 600, borderRadius: '12px', padding: '12px' }}
                            >
                                {editData ? 'Commit Synchronization' : 'Finalize Entry'}
                            </button>
                        </div>
                    </form>
                </motion.div>
                <style>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #E6C7E6; border-radius: 10px; }
                    .x-small { font-size: 0.75rem; }
                `}</style>
            </div>
        </AnimatePresence>
    );
};

export default AddIncomeModal;
