import React from 'react';
import {
    FiX,
    FiDownload,
    FiPrinter,
    FiUser,
    FiCreditCard,
    FiDollarSign,
    FiCalendar,
    FiFileText
} from 'react-icons/fi';

const PayslipModal = ({ show, payroll, onClose }) => {
    if (!show || !payroll) return null;

    const employee = payroll.employee || {};
    const employeeName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'N/A';

    const formatCurrency = (amount) => {
        if (!amount) return '₹0.00';
        return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getMonthName = (month) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return months[month - 1] || 'N/A';
    };

    const handlePrint = () => {
        const printContent = document.getElementById('payslip-content');
        if (!printContent) return;

        const printWindow = window.open('', '', 'height=800,width=800');
        printWindow.document.write('<html><head><title>Payslip</title>');
        printWindow.document.write(`
            <style>
                body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #333; }
                h2 { text-align: center; color: #4f46e5; margin-bottom: 30px; }
                .section-title { font-weight: bold; margin-top: 20px; border-bottom: 2px solid #eee; padding-bottom: 5px; color: #555; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f9f9f9; }
                .label { font-weight: 600; color: #666; width: 40%; }
                .value { width: 60%; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
                th { background-color: #f8fafc; font-weight: 600; }
                .text-end { text-align: right; }
                .net-salary { margin-top: 30px; padding: 20px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; text-align: center; font-size: 1.25rem; font-weight: bold; color: #166534; }
                @media print { .no-print { display: none; } }
            </style>
        `);
        printWindow.document.write('</head><body>');
        printWindow.document.write(`
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="font-size: 24px; font-weight: 800; margin: 0; color: #000;">Infolux Technologies</h2>
                <div style="font-size: 13px; color: #444; margin-bottom: 15px; line-height: 1.4;">
                    Saravanampatti, Coimbatore<br>Tamil Nadu, India
                </div>
                <h3 style="font-size: 18px; font-weight: 800; color: #000; margin: 10px 0;">Payslip for ${getMonthName(payroll.month)} ${payroll.year}</h3>
            </div>
        `);
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };

    const handleDownload = () => {
        const printContent = document.getElementById('payslip-content');
        if (!printContent) return;

        const printWindow = window.open('', '', 'height=800,width=800');
        printWindow.document.write('<html><head><title>Payslip_Download</title>');
        printWindow.document.write(`
            <style>
                body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #333; }
                h2 { text-align: center; color: #4f46e5; margin-bottom: 30px; }
                .section-title { font-weight: bold; margin-top: 20px; border-bottom: 2px solid #eee; padding-bottom: 5px; color: #555; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f9f9f9; }
                .label { font-weight: 600; color: #666; width: 40%; }
                .value { width: 60%; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
                th { background-color: #f8fafc; font-weight: 600; }
                .text-end { text-align: right; }
                .net-salary { margin-top: 30px; padding: 20px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; text-align: center; font-size: 1.25rem; font-weight: bold; color: #166534; }
                @media print { .no-print { display: none; } }
            </style>
        `);
        printWindow.document.write('</head><body>');
        printWindow.document.write(`
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="font-size: 24px; font-weight: 800; margin: 0; color: #000;">Infolux Technologies</h2>
                <div style="font-size: 13px; color: #444; margin-bottom: 15px; line-height: 1.4;">
                    Saravanampatti, Coimbatore<br>Tamil Nadu, India
                </div>
                <h3 style="font-size: 18px; font-weight: 800; color: #000; margin: 10px 0;">Payslip for ${getMonthName(payroll.month)} ${payroll.year}</h3>
            </div>
        `);
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    // Reusable Section Component
    const Section = ({ icon: Icon, title, children }) => (
        <div className="mb-4 bg-light rounded-3 p-3 border border-light-subtle">
            <h6 className="d-flex align-items-center fw-bold text-primary mb-3">
                <Icon className="me-2" /> {title}
            </h6>
            <div className="row g-3">
                {children}
            </div>
        </div>
    );

    // Field Component
    const Field = ({ label, value, col = 6, fullWidth = false, children }) => (
        <div className={`col-md-${fullWidth ? 12 : col}`}>
            <label className="small text-muted text-uppercase fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>{label}</label>
            <div className="text-dark fw-medium" style={{ wordBreak: 'break-word' }}>
                {children ? children : (value || '—')}
            </div>
        </div>
    );

    const earnings = [
        { label: 'Basic Salary', amount: payroll.basicSalary || 0 },
        { label: 'Allowances', amount: payroll.allowances || 0 },
        { label: 'Bonus', amount: payroll.bonus || 0 },
    ];
    // Add Overtime if present
    if (payroll.salaryComponents?.overtimePay > 0) {
        earnings.push({ label: 'Overtime Pay', amount: payroll.salaryComponents.overtimePay });
    }

    const deductions = [
        { label: 'Deductions', amount: payroll.deductions || 0 },
        { label: 'Tax (2.5%)', amount: payroll.tax || 0 },
    ];
    // Add LOP if present
    if (payroll.salaryComponents?.lopDeduction > 0) {
        deductions.push({ label: 'Loss of Pay', amount: payroll.salaryComponents.lopDeduction });
    }

    const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0);
    const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);
    const netSalary = payroll.netSalary || (totalEarnings - totalDeductions);

    return (
        <div className="modal fade show" style={{ display: "grid", placeItems: "center", position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: 'blur(5px)', zIndex: 10000, overflow: 'hidden' }}>
            <div className="bg-white rounded-4 shadow-lg d-flex flex-column" style={{ width: '95vw', maxWidth: '1400px', height: '90vh', maxHeight: '90vh', position: 'relative' }}>

                {/* Header */}
                <div className="modal-header border-bottom bg-white p-4 p-lg-5 sticky-top z-3 rounded-top-4 position-relative">
                    <div className="d-flex align-items-center justify-content-between w-100">
                        {/* Left: Icon + Info */}
                        <div className="d-flex align-items-center gap-3">
                            <div
                                className="rounded-4 d-flex align-items-center justify-content-center text-white shadow-sm"
                                style={{
                                    width: '70px',
                                    height: '70px',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    fontSize: '1.75rem'
                                }}
                            >
                                <FiFileText />
                            </div>
                            <div>
                                <h5 className="fw-bold text-dark mb-1">
                                    Payslip: {getMonthName(payroll.month)} {payroll.year}
                                </h5>
                                <div className="d-flex flex-wrap gap-2 text-muted align-items-center small">
                                    <span className={`fw-medium px-2 py-0.5 rounded ${payroll.paymentStatus === 'Paid' ? 'text-success bg-success-subtle' : 'text-warning bg-warning-subtle'}`}>
                                        {payroll.paymentStatus || 'Processed'}
                                    </span>
                                    <span>•</span>
                                    <span>ID: {payroll._id?.substring(18).toUpperCase()}</span>
                                    <span>•</span>
                                    <span>{formatDate(payroll.paymentDate)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Center: Company Name - Absolute Positioned */}
                        <div className="position-absolute start-50 top-50 translate-middle text-center d-none d-xl-block">
                            <h2 className="fw-bold mb-0" style={{ fontSize: '1.5rem', color: '#000' }}>INFOLEXUS TECHNOLOGIES</h2>
                            <div className="text-muted" style={{ fontSize: '0.85rem', lineHeight: '1.2' }}>
                                Saravanampatti, Coimbatore<br />
                                Tamil Nadu, India
                            </div>
                        </div>

                        {/* Right: Buttons */}
                        <div className="d-flex align-items-center gap-2 bg-white ps-2">
                            <button className="btn btn-outline-success d-flex align-items-center" onClick={handleDownload}>
                                <FiDownload className="me-2" /> Download
                            </button>
                            <button className="btn btn-outline-secondary d-flex align-items-center" onClick={handlePrint}>
                                <FiPrinter className="me-2" /> Print
                            </button>
                            <button type="button" className="btn-close ms-2" onClick={onClose} aria-label="Close" />
                        </div>
                    </div>
                </div>

                {/* ID for printing targeting */}
                <div id="payslip-content" className="modal-body p-4 p-lg-5 bg-white overflow-auto rounded-bottom-4">

                    {/* Print Header (Visible only in print view technically, but structure here matters) */}


                    <div className="row g-5">
                        {/* Left Column: Info */}
                        <div className="col-lg-6 border-end-lg">
                            <Section title="Employee Information" icon={FiUser}>
                                <Field label="Full Name" value={employeeName} fullWidth />
                                <Field label="Employee ID" value={employee.employeeId} />
                                <Field label="Department" value={employee.department} />
                                <Field label="Designation" value={employee.designation} />
                                <Field label="Joining Date" value={formatDate(employee.joiningDate)} />
                            </Section>

                            <Section title="Attendance Summary" icon={FiCalendar}>
                                <div className="row g-2 w-100">
                                    <div className="col-4">
                                        <div className="p-2 border rounded bg-white text-center">
                                            <div className="small text-muted">Total Days</div>
                                            <div className="fw-bold">{payroll.attendanceSummary?.totalDays || 30}</div>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="p-2 border rounded bg-white text-center">
                                            <div className="small text-muted">Present</div>
                                            <div className="fw-bold text-success">{payroll.attendanceSummary?.presentDays || 0}</div>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="p-2 border rounded bg-white text-center">
                                            <div className="small text-muted">Absent/LOP</div>
                                            <div className="fw-bold text-danger">{payroll.attendanceSummary?.absentDays || 0}</div>
                                        </div>
                                    </div>
                                    {/* Optional: Show Overtime Hours if relevant */}
                                    {(payroll.attendanceSummary?.overtimeHours > 0) && (
                                        <div className="col-12 mt-2">
                                            <div className="p-2 border rounded bg-white d-flex justify-content-between px-3">
                                                <span className="small text-muted">Overtime Hours</span>
                                                <span className="fw-bold text-primary">{payroll.attendanceSummary.overtimeHours} hours</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Section>

                            <Section title="Bank Details" icon={FiCreditCard}>
                                <Field label="Bank Name" value={payroll.bankDetails?.branchName || employee.bankDetails?.branchName} fullWidth />
                                <Field label="Account Holder" value={payroll.bankDetails?.accountHolderName || employee.bankDetails?.accountHolderName} fullWidth />
                                <Field label="Account Number" value={payroll.bankDetails?.accountNumber || employee.bankDetails?.accountNumber} />
                                <Field label="IFSC Code" value={payroll.bankDetails?.ifscCode || employee.bankDetails?.ifscCode} />
                            </Section>

                            <div className="mt-4 p-3 bg-light rounded text-muted small">
                                <p className="mb-1 fw-bold">Note:</p>
                                <p className="mb-0">This is a system generated payslip. For any discrepancies, please contact the HR department.</p>
                            </div>
                        </div>

                        {/* Right Column: Financials */}
                        <div className="col-lg-6">
                            <Section title="Financial Breakdown" icon={FiDollarSign}>
                                <div className="col-12">
                                    {/* Earnings */}
                                    <div className="mb-4">
                                        <h6 className="text-success fw-bold text-uppercase small ls-1 mb-3">Earnings</h6>
                                        <div className="border rounded-3 overflow-hidden">
                                            <table className="table table-sm mb-0">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th className="ps-3 border-0">Component</th>
                                                        <th className="text-end pe-3 border-0">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {earnings.map((item, i) => (
                                                        <tr key={i}>
                                                            <td className="ps-3 text-secondary">{item.label}</td>
                                                            <td className="text-end pe-3 fw-medium">{formatCurrency(item.amount)}</td>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-light fw-bold">
                                                        <td className="ps-3">Gross Earnings</td>
                                                        <td className="text-end pe-3">{formatCurrency(totalEarnings)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Deductions */}
                                    <div className="mb-4">
                                        <h6 className="text-danger fw-bold text-uppercase small ls-1 mb-3">Deductions</h6>
                                        <div className="border rounded-3 overflow-hidden">
                                            <table className="table table-sm mb-0">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th className="ps-3 border-0">Component</th>
                                                        <th className="text-end pe-3 border-0">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {deductions.map((item, i) => (
                                                        <tr key={i}>
                                                            <td className="ps-3 text-secondary">{item.label}</td>
                                                            <td className="text-end pe-3 fw-medium text-danger">-{formatCurrency(item.amount)}</td>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-light fw-bold text-danger">
                                                        <td className="ps-3">Total Deductions</td>
                                                        <td className="text-end pe-3">-{formatCurrency(totalDeductions)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Net Pay */}
                                    <div className="p-4 bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-3 text-center">
                                        <div className="text-uppercase text-primary fw-bold small mb-1">Net Salary Payable</div>
                                        <div className="display-6 fw-bold text-primary mb-0">{formatCurrency(netSalary)}</div>
                                        <div className="small text-muted mt-2">Paid on {formatDate(payroll.paymentDate)}</div>
                                    </div>
                                </div>
                            </Section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayslipModal;
