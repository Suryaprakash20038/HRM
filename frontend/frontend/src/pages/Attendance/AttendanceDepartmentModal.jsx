import React, { useMemo } from 'react';
import { FiX, FiCheckCircle, FiXCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import {
    FiUsers,
    FiCode,
    FiTrendingUp,
    FiPieChart,
    FiPenTool,
    FiSettings,
    FiHeadphones,
    FiFileText,
    FiBriefcase,
    FiDatabase,
    FiLayout
} from 'react-icons/fi';

const AttendanceDepartmentModal = ({ show, department, employees, attendanceMap, onClose, onMarkAttendance }) => {

    // Get color based on department (Consistent Purple Theme)
    const { color, icon: Icon } = useMemo(() => {
        const dept = (department || '').toLowerCase();
        const purpleColor = '#663399'; // Unified Royal Amethyst

        if (dept.includes('it') || dept.includes('tech') || dept.includes('developer'))
            return { icon: FiCode, color: purpleColor };
        if (dept.includes('hr') || dept.includes('human'))
            return { icon: FiUsers, color: purpleColor };
        if (dept.includes('sales') || dept.includes('marketing'))
            return { icon: FiTrendingUp, color: purpleColor };
        if (dept.includes('finance') || dept.includes('account'))
            return { icon: FiPieChart, color: purpleColor };
        if (dept.includes('design') || dept.includes('creative'))
            return { icon: FiPenTool, color: purpleColor };
        if (dept.includes('operation') || dept.includes('admin'))
            return { icon: FiSettings, color: purpleColor };
        if (dept.includes('support') || dept.includes('service'))
            return { icon: FiHeadphones, color: purpleColor };
        if (dept.includes('legal'))
            return { icon: FiFileText, color: purpleColor };
        if (dept.includes('manage') || dept.includes('executive'))
            return { icon: FiBriefcase, color: purpleColor };
        if (dept.includes('data'))
            return { icon: FiDatabase, color: purpleColor };

        return { icon: FiLayout, color: purpleColor };
    }, [department]);

    if (!show) return null;

    // Helper to get photo URL
    const getEmployeePhotoUrl = (emp) => {
        if (emp.profileImage) {
            if (emp.profileImage.startsWith('http')) return emp.profileImage;
            return `http://localhost:5000/${emp.profileImage}`;
        }
        return `https://i.pravatar.cc/100?u=${emp._id || emp.email}`;
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
            zIndex: 100000, // Extremely high z-index to stay on top
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
        }}>
            <div style={{
                width: '95vw',
                maxWidth: '1600px',
                height: '90vh',
                background: '#ffffff',
                borderRadius: '24px',
                boxShadow: '0 50px 100px -20px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                animation: 'slideUp 0.3s ease-out'
            }}>
                {/* Header */}
                <div style={{
                    padding: '30px 40px',
                    background: 'linear-gradient(to right, #ffffff, #f9fafb)',
                    borderBottom: '2px solid #E6C7E6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div className="d-flex align-items-center gap-4">
                        <div
                            className="shadow-sm"
                            style={{
                                width: '72px',
                                height: '72px',
                                borderRadius: '20px',
                                background: `${color}15`,
                                color: color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '32px'
                            }}
                        >
                            <Icon />
                        </div>
                        <div>
                            <h2 className="mb-1 fw-bold" style={{ color: '#2E1A47', fontSize: '2rem', letterSpacing: '-0.5px' }}>
                                {department} Attendance
                            </h2>
                            <div className="d-flex align-items-center gap-2">
                                <span className="badge border px-3 py-1 rounded-pill fs-6 fw-normal" style={{ backgroundColor: '#E6C7E6', color: '#663399' }}>
                                    {employees.length} Employees
                                </span>
                                <span className="small" style={{ color: '#A3779D' }}>Manage daily attendance records</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-light rounded-circle shadow-sm hover-scale"
                        style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0', background: '#f8fafc' }}>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
                            <thead className="bg-white sticky-top shadow-sm" style={{ top: 0, zIndex: 10 }}>
                                <tr className="text-uppercase small fw-bold" style={{ letterSpacing: '0.8px', height: '60px' }}>
                                    <th className="ps-5 border-bottom" style={{ color: '#663399' }}>Employee</th>
                                    <th className="border-bottom" style={{ color: '#663399' }}>Position</th>
                                    <th className="border-bottom" style={{ color: '#663399' }}>Status</th>
                                    <th className="border-bottom" style={{ color: '#663399' }}>Check In</th>
                                    <th className="border-bottom" style={{ color: '#663399' }}>Check Out</th>
                                    <th className="pe-5 border-bottom text-end" style={{ color: '#663399' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map(emp => {
                                    const att = attendanceMap[emp._id];
                                    const status = att?.status || "Not Marked";
                                    let statusColor = "#663399";
                                    let bgStatus = "#E6C7E6";
                                    let StatusIcon = FiAlertCircle;

                                    if (status === "Present") { statusColor = "#663399"; bgStatus = "#E6C7E6"; StatusIcon = FiCheckCircle; }
                                    else if (status === "Absent") { statusColor = "#DC2626"; bgStatus = "#FEE2E2"; StatusIcon = FiXCircle; }
                                    else if (status === "Late") { statusColor = "#D97706"; bgStatus = "#FEF3C7"; StatusIcon = FiClock; }
                                    else if (status === "Half Day") { statusColor = "#0284C7"; bgStatus = "#E0F2FE"; StatusIcon = FiPieChart; }

                                    return (
                                        <tr key={emp._id} className="bg-white" style={{ transition: 'background 0.2s' }}>
                                            <td className="py-4 ps-5 border-bottom-light">
                                                <div className="d-flex align-items-center gap-4">
                                                    <img
                                                        src={getEmployeePhotoUrl(emp)}
                                                        alt={emp.firstName}
                                                        className="rounded-4 border shadow-sm object-fit-cover"
                                                        style={{ width: '56px', height: '56px' }}
                                                    />
                                                    <div>
                                                        <div className="fw-bold text-dark fs-6">{emp.firstName} {emp.lastName}</div>
                                                        <div className="small text-muted font-monospace">{emp.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 border-bottom-light">
                                                <span className="fw-medium text-secondary">{emp.position || "—"}</span>
                                            </td>
                                            <td className="py-4 border-bottom-light">
                                                <span
                                                    className="badge rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2 fw-medium"
                                                    style={{
                                                        backgroundColor: bgStatus,
                                                        color: statusColor,
                                                        border: `1px solid ${statusColor}40`
                                                    }}
                                                >
                                                    <StatusIcon size={14} />
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="py-4 border-bottom-light text-secondary fw-medium font-monospace fs-6">
                                                {att?.checkIn ? new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                                            </td>
                                            <td className="py-4 border-bottom-light text-secondary fw-medium font-monospace fs-6">
                                                {att?.checkOut ? new Date(att.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                                            </td>
                                            <td className="py-4 pe-5 border-bottom-light text-end">
                                                <div className="dropdown">
                                                    <button
                                                        className="btn btn-light btn-sm fw-bold dropdown-toggle border shadow-sm px-3 py-2"
                                                        type="button"
                                                        data-bs-toggle="dropdown"
                                                        style={{ borderRadius: '10px' }}
                                                    >
                                                        Mark Status
                                                    </button>
                                                    <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-4 p-2">
                                                        <li><button className="dropdown-item rounded-2 py-2 mb-1 d-flex align-items-center gap-2 text-success" onClick={() => onMarkAttendance(emp._id, 'Present')}><FiCheckCircle /> Present</button></li>
                                                        <li><button className="dropdown-item rounded-2 py-2 mb-1 d-flex align-items-center gap-2 text-danger" onClick={() => onMarkAttendance(emp._id, 'Absent')}><FiXCircle /> Absent</button></li>
                                                        <li><button className="dropdown-item rounded-2 py-2 mb-1 d-flex align-items-center gap-2 text-warning" onClick={() => onMarkAttendance(emp._id, 'Late')}><FiClock /> Late</button></li>
                                                        <li><button className="dropdown-item rounded-2 py-2 d-flex align-items-center gap-2 text-info" onClick={() => onMarkAttendance(emp._id, 'Half Day')}><FiPieChart /> Half Day</button></li>
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {employees.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-5">
                                            <div className="d-flex flex-column align-items-center justify-content-center p-5 opacity-50">
                                                <Icon size={48} className="mb-3 text-secondary" />
                                                <h5 className="text-secondary fw-bold">No Employees Found</h5>
                                                <p className="text-muted">There are no employees in this department.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .hover-scale:hover {
                    transform: scale(1.05);
                    transition: transform 0.2s;
                }
            `}</style>
        </div>
    );
};

export default AttendanceDepartmentModal;
