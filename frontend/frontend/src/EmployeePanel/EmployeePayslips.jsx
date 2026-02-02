// src/EmployeePanel/EmployeePayslips.jsx
import React, { useState, useEffect } from 'react';
import { FiDownload, FiEye, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import payrollService from '../services/payrollService';
import PayslipModal from '../components/PayslipModal';
import { useAuth } from '../context/AuthContext';
import { EMP_THEME } from './theme';

const EmployeePayslips = () => {
    const { user } = useAuth();
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayroll, setSelectedPayroll] = useState(null);
    const [showPayslip, setShowPayslip] = useState(false);
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchPayrolls();
    }, [yearFilter]);

    const fetchPayrolls = async () => {
        try {
            setLoading(true);
            const response = await payrollService.getMyPayslips({
                year: yearFilter,
                limit: 100
            });

            if (response.success) {
                setPayrolls(response.data.payrolls);
            } else {
                console.warn('⚠️ Response not successful:', response);
            }
        } catch (error) {
            console.error('❌ Error fetching payrolls:', error);
            console.error('Error details:', error.response?.data || error.message);
            toast.error('Failed to load payslips');
        } finally {
            setLoading(false);
        }
    };

    const viewPayslip = (payroll) => {
        setSelectedPayroll(payroll);
        setShowPayslip(true);
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0.00';
        return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getMonthName = (month) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[month - 1] || 'N/A';
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="container-fluid p-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="m-0 fw-bold">My Payslips</h3>
                    <p className="text-muted small mb-0">View and download your salary slips</p>
                </div>
                <div className="d-flex gap-2 align-items-center">
                    <label className="small text-muted me-2">Year:</label>
                    <select
                        className="form-select form-select-sm"
                        style={{ width: 120 }}
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                    >
                        {[2024, 2025, 2026].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0 me-3">
                                    <div className="rounded-circle p-3" style={{ backgroundColor: `${EMP_THEME.royalAmethyst}1a`, color: EMP_THEME.royalAmethyst }}>
                                        <FiDollarSign size={24} />
                                    </div>
                                </div>
                                <div className="flex-grow-1">
                                    <p className="small mb-1" style={{ color: EMP_THEME.softViolet }}>Total Earned ({yearFilter})</p>
                                    <h4 className="mb-0 fw-bold" style={{ color: EMP_THEME.midnightPlum }}>
                                        {formatCurrency(payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0))}
                                    </h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0 me-3">
                                    <div className="rounded-circle p-3" style={{ backgroundColor: '#d1e7dd', color: '#0f5132' }}>
                                        <FiCalendar size={24} />
                                    </div>
                                </div>
                                <div className="flex-grow-1">
                                    <p className="small mb-1" style={{ color: EMP_THEME.softViolet }}>Payslips Available</p>
                                    <h4 className="mb-0 fw-bold" style={{ color: EMP_THEME.midnightPlum }}>{payrolls.length}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0 me-3">
                                    <div className="rounded-circle p-3" style={{ backgroundColor: `${EMP_THEME.softViolet}1a`, color: EMP_THEME.softViolet }}>
                                        <FiDownload size={24} />
                                    </div>
                                </div>
                                <div className="flex-grow-1">
                                    <p className="small mb-1" style={{ color: EMP_THEME.softViolet }}>Latest Payment</p>
                                    <h4 className="mb-0 fw-bold" style={{ color: EMP_THEME.midnightPlum }}>
                                        {payrolls.length > 0 ? formatDate(payrolls[0].paymentDate) : 'N/A'}
                                    </h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payslips List */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 py-3">
                    <h5 className="mb-0 fw-semibold">Salary Slips</h5>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border" role="status" style={{ color: EMP_THEME.royalAmethyst }}>
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="text-muted mt-2">Loading payslips...</p>
                        </div>
                    ) : payrolls.length === 0 ? (
                        <div className="text-center py-5">
                            <FiCalendar size={48} className="text-muted mb-3" />
                            <p className="text-muted">No payslips found for {yearFilter}</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Period</th>
                                        <th>Payment Date</th>
                                        <th className="text-end">Basic Salary</th>
                                        <th className="text-end">Allowances</th>
                                        <th className="text-end">Deductions</th>
                                        <th className="text-end">Net Salary</th>
                                        <th className="text-center">Status</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payrolls.map((payroll) => (
                                        <tr key={payroll._id}>
                                            <td>
                                                <div className="fw-semibold">{getMonthName(payroll.month)} {payroll.year}</div>
                                            </td>
                                            <td>{formatDate(payroll.paymentDate)}</td>
                                            <td className="text-end">{formatCurrency(payroll.basicSalary)}</td>
                                            <td className="text-end text-success">
                                                +{formatCurrency((payroll.allowances || 0) + (payroll.bonus || 0))}
                                            </td>
                                            <td className="text-end text-danger">
                                                -{formatCurrency((payroll.deductions || 0) + (payroll.tax || 0))}
                                            </td>
                                            <td className="text-end fw-bold">{formatCurrency(payroll.netSalary)}</td>
                                            <td className="text-center">
                                                <span className={`badge ${payroll.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                    {payroll.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    className="btn btn-sm"
                                                    style={{ backgroundColor: EMP_THEME.royalAmethyst, color: 'white' }}
                                                    onClick={() => viewPayslip(payroll)}
                                                >
                                                    <FiEye className="me-1" /> View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Payslip Modal */}
            {showPayslip && (
                <PayslipModal
                    show={showPayslip}
                    payroll={selectedPayroll}
                    onClose={() => {
                        setShowPayslip(false);
                        setSelectedPayroll(null);
                    }}
                />
            )}
        </div>
    );
};

export default EmployeePayslips;
