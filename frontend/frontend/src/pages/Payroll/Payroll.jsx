import React, { useMemo, useState, useEffect } from "react";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
  Filler,
} from "chart.js";

import { FiSearch, FiDownload, FiFileText, FiUsers, FiTrash2, FiEdit2, FiMail, FiFilter } from "react-icons/fi";
import { FaFileInvoiceDollar, FaBuilding } from "react-icons/fa6";
import payrollService from "../../services/payrollService";
import employeeService from "../../services/employeeService";
import PayslipModal from "../../components/PayslipModal";
import { toast } from "react-hot-toast";

ChartJS.register(
  BarElement,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
  Filler
);

/* Glass card style used across components */
const glass = {
  background: "#ffffff",
  borderRadius: 24,
  border: "1px solid #E6C7E6",
  boxShadow: "0 10px 30px -10px rgba(102, 51, 153, 0.1)",
  padding: 20,
  transition: "transform 240ms ease, box-shadow 240ms ease",
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
};

function formatCurrency(n) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return Number(n).toLocaleString(undefined, { style: "currency", currency: "INR", maximumFractionDigits: 0 });
}

export default function Payroll() {
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [selectedDept, setSelectedDept] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [showPayslip, setShowPayslip] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  // animate entrance
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    fetchData();
  }, [monthFilter, yearFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [payrollRes, statsRes, employeeData] = await Promise.all([
        payrollService.getAllPayroll({ limit: 1000, month: monthFilter, year: yearFilter }),
        payrollService.getPayrollStats({ month: monthFilter, year: yearFilter }),
        employeeService.getAllEmployees()
      ]);

      if (payrollRes.success) setRows(payrollRes.data.payrolls);
      if (statsRes.success) setStats(statsRes.data.stats);
      if (employeeData && employeeData.employees) setEmployees(employeeData.employees);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load payroll data");
    } finally {
      setLoading(false);
    }
  };

  const enriched = useMemo(
    () =>
      rows.map((r) => {
        const gross = (r.basicSalary || 0) + (r.allowances || 0) + (r.bonus || 0);
        const totalDeductions = (r.deductions || 0) + (r.tax || 0);
        const net = r.netSalary || (gross - totalDeductions);

        return {
          ...r,
          gross,
          totalDeductions,
          net,
          employeeName: r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : "Unknown",
          employeeIdStr: r.employee?.employeeId || "N/A",
          department: r.employee?.department || "Unassigned"
        };
      }),
    [rows]
  );

  const filtered = useMemo(() => {
    return enriched
      .filter((r) => (statusFilter === "all" ? true : r.paymentStatus === statusFilter))
      .filter((r) => (selectedDept ? r.department === selectedDept : true))
      .filter((r) => {
        if (!q.trim()) return true;
        const s = q.toLowerCase();
        return (
          String(r._id).includes(s) ||
          (r.employeeIdStr || "").toLowerCase().includes(s) ||
          (r.employeeName || "").toLowerCase().includes(s) ||
          (r.department || "").toLowerCase().includes(s)
        );
      });
  }, [enriched, q, statusFilter, selectedDept]);

  const exportCSV = () => {
    const header = [
      "EmployeeID", "Name", "Department", "Month", "Year", "Basic", "Allowances", "Bonus", "Deductions", "Tax", "Net Salary", "Status", "Payment Date"
    ];
    const lines = filtered.map((r) =>
      [
        `"${r.employeeIdStr}"`, `"${r.employeeName}"`, `"${r.department}"`,
        r.month, r.year, r.basicSalary, r.allowances, r.bonus, r.deductions, r.tax, r.net,
        r.paymentStatus, r.paymentDate ? new Date(r.paymentDate).toLocaleDateString() : ""
      ].join(",")
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll_${selectedDept || 'all'}_${monthFilter}_${yearFilter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const togglePaid = async (row) => {
    try {
      const newStatus = row.paymentStatus === "Paid" ? "Pending" : "Paid";
      await payrollService.updatePayroll(row._id, { paymentStatus: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const viewPayslip = (payroll) => {
    setSelectedPayroll(payroll);
    setShowPayslip(true);
  };

  const sendPayslip = async (id) => {
    try {
      await payrollService.sendPayslip(id);
      toast.success("Payslip sent via email successfully");
    } catch (error) {
      console.error("Error sending payslip:", error);
      toast.error("Failed to send payslip");
    }
  };

  const openAdd = () => { setEditing(null); setShowModal(true); };
  const openEdit = (r) => { setEditing(r); setShowModal(true); };

  const saveRow = async (payload) => {
    try {
      if (editing) {
        await payrollService.updatePayroll(editing._id, payload);
        toast.success("Payroll updated successfully");
      } else {
        await payrollService.generatePayroll(payload);
        toast.success("Payroll generated successfully");
      }
      setShowModal(false);
      setEditing(null);
      fetchData();
    } catch (error) {
      console.error("Error saving payroll:", error);
      toast.error(error.message || "Failed to save payroll");
    }
  };

  const deleteRow = async (id) => {
    if (!confirm("Delete this payroll entry?")) return;
    try {
      await payrollService.deletePayroll(id);
      toast.success("Payroll deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting payroll:", error);
      toast.error("Failed to delete payroll");
    }
  };

  return (
    <div className={`container-fluid p-4 payroll-page ${mounted ? "mounted" : ""}`} style={{ paddingBottom: 80 }}>
      {/* BACKGROUND STYLES */}
      <style>{`
        .payroll-page {
            background-color: #ffffff;
            background-image:
                radial-gradient(at 0% 0%, rgba(102, 51, 153, 0.05) 0px, transparent 50%),
                radial-gradient(at 100% 0%, rgba(163, 119, 157, 0.05) 0px, transparent 50%);
            min-height: 100vh;
        }
      `}</style>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="m-0 fw-bold" style={{ color: '#2E1A47' }}>Payroll Management</h3>
          <div style={{ color: '#A3779D' }} className="small">Department-wise salary overview and processing</div>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <select className="form-select form-select-sm border" style={{ width: 120, color: '#663399', fontWeight: 600, borderColor: '#E6C7E6' }} value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <select className="form-select form-select-sm border" style={{ width: 100, color: '#663399', fontWeight: 600, borderColor: '#E6C7E6' }} value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn btn-sm" style={{ backgroundColor: '#663399', color: '#ffffff', fontWeight: 600 }} onClick={openAdd}><FaFileInvoiceDollar className="me-1" /> Generate Payroll</button>
        </div>
      </div>

      {/* Department Cards */}
      <div className="row g-3 mb-4">
        {stats.map((deptStat) => (
          <div className="col-md-3" key={deptStat._id}>
            <div
              style={{ ...glass, cursor: 'pointer', border: selectedDept === deptStat._id ? '2px solid #663399' : glass.border }}
              className="dept-card hover-lift h-100"
              onClick={() => setSelectedDept(selectedDept === deptStat._id ? null : deptStat._id)}
            >
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="fw-bold" style={{ color: '#663399' }}><FaBuilding className="me-2" />{deptStat._id}</div>
                <span className="badge px-2 py-1" style={{ backgroundColor: '#E6C7E6', color: '#663399' }}>{deptStat.count} Emp</span>
              </div>
              <div className="mb-1">
                <div className="small" style={{ color: '#A3779D' }}>Total Paid</div>
                <div className="fw-bold" style={{ color: '#059669' }}>{formatCurrency(deptStat.totalPaid)}</div>
              </div>
              <div>
                <div className="small" style={{ color: '#A3779D' }}>Pending</div>
                <div className="fw-bold" style={{ color: '#D97706' }}>{formatCurrency(deptStat.totalPending)}</div>
              </div>
            </div>
          </div>
        ))}
        {stats.length === 0 && !loading && (
          <div className="col-12 text-center text-muted">No payroll data found for this month. Generate payrolls to see stats.</div>
        )}
      </div>

      {/* Filters & Actions */}
      <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-white rounded-4 border shadow-sm" style={{ borderColor: '#E6C7E6' }}>
        <div className="d-flex gap-3 align-items-center">
          <div className="fw-bold" style={{ color: '#663399' }}>
            {selectedDept ? `${selectedDept} Department` : "All Departments"}
          </div>
          <div className="vr" style={{ backgroundColor: '#E6C7E6' }}></div>
          <div className="input-group input-group-sm" style={{ width: 250 }}>
            <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: '#E6C7E6', color: '#A3779D' }}><FiSearch /></span>
            <input className="form-control border-start-0 ps-0" style={{ borderColor: '#E6C7E6', color: '#2E1A47' }} placeholder="Search employee..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="form-select form-select-sm" style={{ width: 150, borderColor: '#E6C7E6', color: '#663399', fontWeight: 600 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
        <button className="btn btn-sm" style={{ border: '1px solid #E6C7E6', color: '#663399', fontWeight: 600 }} onClick={exportCSV}><FiDownload className="me-1" /> Export CSV</button>
      </div>

      {/* Table */}
      <div style={{ ...glass }} className="hover-lift">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead style={{ backgroundColor: '#f8fafc' }}>
              <tr className="small text-uppercase">
                <th className="py-4 ps-4 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Employee</th>
                <th className="py-4 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Department</th>
                <th className="py-4 border-bottom text-center" style={{ color: '#663399', letterSpacing: '0.5px' }}>Attendance</th>
                <th className="py-4 border-bottom text-end" style={{ color: '#663399', letterSpacing: '0.5px' }}>Basic</th>
                <th className="py-4 border-bottom text-end" style={{ color: '#663399', letterSpacing: '0.5px' }}>Earnings (+)</th>
                <th className="py-4 border-bottom text-end" style={{ color: '#663399', letterSpacing: '0.5px' }}>Deductions (-)</th>
                <th className="py-4 border-bottom text-end" style={{ color: '#663399', letterSpacing: '0.5px' }}>Net Salary</th>
                <th className="py-4 border-bottom text-center" style={{ color: '#663399', letterSpacing: '0.5px' }}>Status</th>
                <th className="py-4 border-bottom text-center" style={{ color: '#663399', letterSpacing: '0.5px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-5">Loading payroll data...</td></tr>
              ) : filtered.map((r) => (
                <tr key={r._id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="avatar-circle fw-bold d-grid place-items-center" style={{ width: 40, height: 40, borderRadius: '12px', display: 'grid', placeItems: 'center', backgroundColor: '#E6C7E6', color: '#663399' }}>
                        {r.employeeName.charAt(0)}
                      </div>
                      <div>
                        <div className="fw-bold" style={{ color: '#2E1A47' }}>{r.employeeName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#A3779D' }}>{r.employeeIdStr}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge border" style={{ backgroundColor: '#ffffff', color: '#663399', borderColor: '#E6C7E6' }}>{r.department}</span></td>
                  <td className="text-center">
                    {r.attendanceSummary ? (
                      <div className="small">
                        <span className="text-success fw-bold">{r.attendanceSummary.presentDays}</span>
                        <span className="text-muted">/{r.attendanceSummary.totalDays}</span>
                        {r.attendanceSummary.overtimeHours > 0 && (
                          <div className="text-primary" style={{ fontSize: '0.7rem' }}>+{r.attendanceSummary.overtimeHours}hr OT</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="text-end">{formatCurrency(r.basicSalary)}</td>
                  <td className="text-end">
                    {formatCurrency(
                      (r.allowances || 0) +
                      (r.bonus || 0) +
                      (r.salaryComponents?.overtimePay || 0)
                    )}
                  </td>
                  <td className="text-end text-danger">
                    -{formatCurrency(
                      (r.deductions || 0) +
                      (r.tax || 0) +
                      (r.salaryComponents?.lopDeduction || 0)
                    )}
                  </td>
                  <td className="text-end fw-bold" style={{ color: '#2E1A47' }}>{formatCurrency(r.net || r.netSalary)}</td>
                  <td className="text-center">
                    <span className={`badge px-3 py-2 rounded-pill`} style={{
                      backgroundColor: r.paymentStatus === 'Paid' ? '#E6C7E6' : '#FEF3C7',
                      color: r.paymentStatus === 'Paid' ? '#663399' : '#D97706'
                    }}>
                      {r.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      <button className="btn btn-sm btn-icon" style={{ backgroundColor: '#E0F2FE', color: '#0284C7', borderRadius: '8px' }} onClick={() => viewPayslip(r)} title="View Payslip">
                        <FiFileText />
                      </button>
                      <button className="btn btn-sm btn-icon" style={{ backgroundColor: '#E6C7E6', color: '#663399', borderRadius: '8px' }} onClick={() => togglePaid(r)} title={r.paymentStatus === "Paid" ? "Mark Pending" : "Pay Now"}>
                        <FaFileInvoiceDollar />
                      </button>
                      <button className="btn btn-sm btn-icon" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '8px' }} onClick={() => sendPayslip(r._id)} title="Send Payslip via Email">
                        <FiMail />
                      </button>
                      <button className="btn btn-sm btn-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706', borderRadius: '8px' }} onClick={() => openEdit(r)} title="Edit">
                        <FiEdit2 />
                      </button>
                      <button className="btn btn-sm btn-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px' }} onClick={() => deleteRow(r._id)} title="Delete">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-5 text-muted">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Payroll form */}
      {showModal && (
        <PayrollModal
          editing={editing}
          employees={employees}
          month={monthFilter}
          year={yearFilter}
          onCancel={() => { setShowModal(false); setEditing(null); }}
          onSave={saveRow}
        />
      )}

      {/* Payslip Modal */}
      {showPayslip && (
        <PayslipModal
          show={showPayslip}
          payroll={selectedPayroll}
          onClose={() => { setShowPayslip(false); setSelectedPayroll(null); }}
        />
      )}

      <style>{`
        .hover-lift { transition: transform 0.2s, box-shadow 0.2s; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
        .btn-icon { width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center; }
        .dept-card { min-height: 120px; }
      `}</style>
    </div>
  );
}

import attendanceService from "../../services/attendanceService";

function PayrollModal({ editing, employees, month, year, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({
    employeeId: editing?.employee?._id || editing?.employee || "",
    month: editing?.month || month,
    year: editing?.year || year,
    basicSalary: editing?.basicSalary ?? 0,
    allowances: editing?.allowances ?? 0,
    deductions: editing?.deductions ?? 0, // Manual/Other deductions
    bonus: editing?.bonus ?? 0,
    tax: editing?.tax ?? 0,
    paymentStatus: editing?.paymentStatus || "Pending",
    paymentDate: editing?.paymentDate ? new Date(editing.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    bankDetails: {
      accountNumber: editing?.bankDetails?.accountNumber || "",
      accountHolderName: editing?.bankDetails?.accountHolderName || "",
      ifscCode: editing?.bankDetails?.ifscCode || "",
      branchName: editing?.bankDetails?.branchName || ""
    }
  }));

  const [stats, setStats] = useState(null);
  const [calculated, setCalculated] = useState({
    perDaySalary: 0,
    paidDays: 0,
    lopDays: 0,
    lopAmount: 0,
    earnedBasic: 0,
    tax: 0,
    netSalary: 0
  });

  // Fetch stats when employee or date changes
  useEffect(() => {
    if (form.employeeId && form.month && form.year) {
      attendanceService.getAttendanceStats(form.employeeId, form.month, form.year)
        .then(data => {
          if (data && data.stats) setStats(data.stats);
        })
        .catch(err => console.error(err));
    }
  }, [form.employeeId, form.month, form.year]);

  // Recalculate financials whenever form inputs or stats change
  useEffect(() => {
    const daysInMonth = new Date(form.year, form.month, 0).getDate();
    const basic = Number(form.basicSalary) || 0;
    const perDay = basic / daysInMonth;

    // Stats
    const lopDays = stats ? (stats.lopDays || 0) : 0;
    // Paid days = Total Days - LOP Days
    // (Note: stats.presentDays etc might not sum to 31 if data is partial, but LOP logic in backend is robust)
    // We trust LOP days from backend logic which we just fetched.
    const paidDays = daysInMonth - lopDays;

    // LOP Amount
    const lopAmount = Math.round(perDay * lopDays);

    // Earned Basic (just for display)
    const earnedBasic = Math.round(perDay * paidDays);

    // Tax (2.5% of Full Basic)
    const tax = Math.round(basic * 0.025);

    // Net Salary Logic
    // Earnings = Full Basic + Allowances + Bonus
    // Deductions = LOP + Tax + Other Deductions
    const grossInputs = basic + (Number(form.allowances) || 0) + (Number(form.bonus) || 0);
    const totalDeductions = lopAmount + tax + (Number(form.deductions) || 0);
    const net = Math.round(grossInputs - totalDeductions);

    setCalculated({
      perDaySalary: perDay,
      paidDays,
      lopDays,
      lopAmount,
      earnedBasic,
      tax,
      netSalary: net
    });

  }, [form, stats]);


  const handleEmployeeChange = (e) => {
    const empId = e.target.value;
    const emp = employees.find(emp => emp._id === empId);
    if (emp) {
      setForm(f => ({
        ...f,
        employeeId: empId,
        basicSalary: emp.basicSalary || 0,
        allowances: emp.allowances || 0,
        deductions: emp.deductions || 0,
        bankDetails: {
          accountNumber: emp.bankDetails?.accountNumber || "",
          accountHolderName: emp.bankDetails?.accountHolderName || `${emp.firstName} ${emp.lastName}`,
          ifscCode: emp.bankDetails?.ifscCode || "",
          branchName: emp.bankDetails?.branchName || ""
        }
      }));
    } else {
      setForm(f => ({ ...f, employeeId: empId }));
    }
  };

  const setNum = (key, value) => {
    setForm((f) => ({ ...f, [key]: value === "" ? "" : Number(value) }));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.employeeId) return alert("Please select an employee.");
    onSave(form);
  };

  const sectionHeaderStyle = {
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#6b7280',
    fontWeight: 600,
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #e5e7eb'
  };

  return (
    <div className="modal fade show" style={{ display: "grid", placeItems: "center", position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 10000, backdropFilter: 'blur(4px)', overflow: 'hidden' }}>
      <div className="bg-white rounded-4 shadow-lg d-flex flex-column" style={{ width: '95vw', maxWidth: '1600px', height: '90vh', maxHeight: '90vh', position: 'relative' }}>

        <div className="modal-header border-bottom px-4 py-3 bg-white rounded-top-4" style={{ borderBottom: '2px solid #E6C7E6' }}>
          <h5 className="modal-title fw-bold" style={{ color: '#663399' }}>
            {editing ? "Edit Payroll Record" : "Generate New Payroll"}
          </h5>
          <button className="btn-close" onClick={onCancel}></button>
        </div>

        <div className="modal-body p-4 overflow-auto">
          <form onSubmit={submit} id="payrollForm">
            {/* Basic Info */}
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label small fw-bold" style={{ color: '#2E1A47' }}>Employee <span className="text-danger">*</span></label>
                <select className="form-select border" style={{ borderColor: '#E6C7E6', borderRadius: '12px' }} value={form.employeeId} onChange={handleEmployeeChange} disabled={!!editing} required>
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.department})</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold text-secondary">Month <span className="text-danger">*</span></label>
                <select className="form-select" value={form.month} onChange={(e) => setNum("month", e.target.value)} required>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold text-secondary">Year <span className="text-danger">*</span></label>
                <input className="form-control" type="number" value={form.year} onChange={(e) => setNum("year", e.target.value)} required />
              </div>
            </div>

            <div className="row g-4">
              {/* Earnings Section */}
              <div className="col-md-6">
                <div className="p-4 rounded-4 border h-100" style={{ backgroundColor: '#fdfbff', borderColor: '#E6C7E6' }}>
                  <div className="d-flex align-items-center mb-4">
                    <div className="bg-white p-2 rounded-circle text-purple-600 me-2 shadow-sm" style={{ color: '#663399' }}><FaFileInvoiceDollar size={20} /></div>
                    <h5 className="fw-bold m-0" style={{ color: '#663399' }}>Earnings</h5>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Basic Salary (Monthly)</label>
                      <div className="input-group">
                        <span className="input-group-text bg-white text-muted">₹</span>
                        <input className="form-control border-start-0 ps-1" type="number" value={form.basicSalary} onChange={(e) => setNum("basicSalary", e.target.value)} required />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">Per Day Salary</label>
                      <div className="input-group bg-light">
                        <span className="input-group-text bg-transparent text-muted">₹</span>
                        <input className="form-control border-0 bg-transparent ps-1" value={calculated.perDaySalary.toFixed(2)} readOnly />
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 mt-1">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">Paid Days</label>
                      <input className="form-control bg-light" value={`${calculated.paidDays?.toFixed(2) || 0} / ${new Date(form.year, form.month, 0).getDate()}`} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-success">Earned Basic</label>
                      <div className="input-group bg-white border rounded">
                        <span className="input-group-text bg-transparent border-0 text-success">₹</span>
                        <input className="form-control border-0 px-0 fw-bold text-success" value={calculated.earnedBasic} readOnly />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="form-label small fw-semibold">Allowances</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white text-muted">₹</span>
                      <input className="form-control border-start-0 ps-1" type="number" value={form.allowances} onChange={(e) => setNum("allowances", e.target.value)} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="form-label small fw-semibold">Bonus</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white text-muted">₹</span>
                      <input className="form-control border-start-0 ps-1" type="number" value={form.bonus} onChange={(e) => setNum("bonus", e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Deductions Section */}
              <div className="col-md-6">
                <div className="p-4 rounded-4 border h-100" style={{ backgroundColor: '#fffafb', borderColor: '#fee2e2' }}>
                  <div className="d-flex align-items-center mb-4">
                    <div className="bg-white p-2 rounded-circle text-danger me-2 shadow-sm"><FiFilter size={20} /></div>
                    <h5 className="fw-bold text-danger m-0">Deductions</h5>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-danger">LOP Days</label>
                      <input className="form-control bg-white text-danger fw-bold" value={calculated.lopDays || 0} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-danger">LOP Amount</label>
                      <div className="input-group bg-white border border-danger-subtle rounded">
                        <span className="input-group-text bg-transparent border-0 text-danger">₹</span>
                        <input className="form-control border-0 px-0 fw-bold text-danger" value={calculated.lopAmount} readOnly />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="form-label small fw-semibold">Tax (2.5% Auto)</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white text-muted">₹</span>
                      <input className="form-control border-start-0 ps-1 bg-white" type="number" value={calculated.tax} readOnly />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="form-label small fw-semibold">Other Deductions (Manual)</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white text-muted">₹</span>
                      <input className="form-control border-start-0 ps-1" type="number" value={form.deductions} onChange={(e) => setNum("deductions", e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="col-12">
                <div className="p-4 rounded-4 border" style={{ backgroundColor: '#f8fafc', borderColor: '#E6C7E6' }}>
                  <div style={sectionHeaderStyle} className="mb-3">Processing Details</div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold" style={{ color: '#2E1A47' }}>Payment Date</label>
                      <input className="form-control form-control-lg border" style={{ borderColor: '#E6C7E6', borderRadius: '12px' }} type="date" value={form.paymentDate} onChange={(e) => setForm(f => ({ ...f, paymentDate: e.target.value }))} />
                    </div>
                    <div className="col-md-6 d-flex align-items-center">
                      <div className="card w-100 border-0" style={{ background: 'linear-gradient(135deg, #663399, #4B1E78)', borderRadius: '16px', boxShadow: '0 10px 20px rgba(102, 51, 153, 0.2)' }}>
                        <div className="card-body py-3 px-4 d-flex justify-content-between align-items-center">
                          <span className="fw-bold text-white">Net Payable Salary</span>
                          <span className="fs-3 fw-bold text-white">
                            {formatCurrency(calculated.netSalary)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="col-12">
                <div style={sectionHeaderStyle} className="mt-2 text-muted">Bank Information (Optional)</div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Account Number</label>
                    <input className="form-control" value={form.bankDetails.accountNumber} onChange={(e) => setForm(f => ({ ...f, bankDetails: { ...f.bankDetails, accountNumber: e.target.value } }))} placeholder="Acc. No." />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-muted">Holder Name</label>
                    <input className="form-control" value={form.bankDetails.accountHolderName} onChange={(e) => setForm(f => ({ ...f, bankDetails: { ...f.bankDetails, accountHolderName: e.target.value } }))} placeholder="Holder Name" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small text-muted">IFSC Code</label>
                    <input className="form-control" value={form.bankDetails.ifscCode} onChange={(e) => setForm(f => ({ ...f, bankDetails: { ...f.bankDetails, ifscCode: e.target.value } }))} placeholder="IFSC" />
                  </div>
                  <div className="col-md-8">
                    <label className="form-label small text-muted">Branch</label>
                    <input className="form-control" value={form.bankDetails.branchName} onChange={(e) => setForm(f => ({ ...f, bankDetails: { ...f.bankDetails, branchName: e.target.value } }))} placeholder="Branch Name" />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div className="modal-footer border-top bg-white rounded-bottom-4 px-4 py-3" style={{ borderTop: '1px solid #E6C7E6' }}>
          <button type="button" className="btn btn-lg px-4" style={{ border: '1px solid #E6C7E6', color: '#663399', fontWeight: 600 }} onClick={onCancel}>Cancel</button>
          <button type="submit" form="payrollForm" className="btn btn-lg px-5 fw-bold shadow-sm" style={{ backgroundColor: '#663399', color: '#ffffff' }}><FaFileInvoiceDollar className="me-2" />{editing ? "Update Payroll" : "Generate Payroll"}</button>
        </div>
      </div>
    </div>
  );
}