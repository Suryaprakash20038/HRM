import React from 'react';
import {
    FiEye,
    FiEdit2,
    FiTrash2,
    FiMapPin,
    FiPhone,
    FiMail,
    FiUsers,
    FiCode,
    FiCpu,
    FiTrendingUp,
    FiPieChart,
    FiPenTool,
    FiBriefcase,
    FiSettings,
    FiHeadphones,
    FiFileText,
    FiDatabase,
    FiLayout
} from 'react-icons/fi';

const EmployeeGrid = ({ employees, onEdit, onView, onDelete }) => {

    const getDepartmentStyles = (department) => {
        const dept = (department || '').toLowerCase();
        let color = '#a8edea'; // Default
        let icon = FiLayout;

        if (dept.includes('it') || dept.includes('tech') || dept.includes('developer')) { color = '#4facfe'; icon = FiCode; }
        else if (dept.includes('hr') || dept.includes('human')) { color = '#ff9a9e'; icon = FiUsers; }
        else if (dept.includes('sales') || dept.includes('marketing')) { color = '#43e97b'; icon = FiTrendingUp; }
        else if (dept.includes('finance') || dept.includes('account')) { color = '#f6d365'; icon = FiPieChart; }
        else if (dept.includes('design') || dept.includes('creative')) { color = '#a18cd1'; icon = FiPenTool; }
        else if (dept.includes('operation') || dept.includes('admin')) { color = '#667eea'; icon = FiSettings; }
        else if (dept.includes('support') || dept.includes('service')) { color = '#ffc3a0'; icon = FiHeadphones; }
        else if (dept.includes('legal')) { color = '#d4fc79'; icon = FiFileText; }
        else if (dept.includes('manage') || dept.includes('executive')) { color = '#8fd3f4'; icon = FiBriefcase; }
        else if (dept.includes('data')) { color = '#e0c3fc'; icon = FiDatabase; }

        return { color, icon };
    };

    if (!employees || employees.length === 0) {
        return (
            <div className="text-center py-5 text-muted">
                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>👥</div>
                <h4>No employees found</h4>
                <p>Try adjusting the filters or add a new employee.</p>
            </div>
        );
    }

    return (
        <div className="row g-4">
            {employees.map((emp) => {
                const { color, icon: DeptIcon } = getDepartmentStyles(emp.department);

                return (
                    <div key={emp.id} className="col-12 col-md-6 col-lg-4 col-xl-3">
                        <div
                            className="card h-100 border-0"
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '16px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                cursor: 'pointer',
                                overflow: 'hidden'
                            }}
                            onClick={() => onView && onView(emp)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = `0 8px 25px ${color}40`;
                                e.currentTarget.style.border = `1px solid ${color}40`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                                e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                            }}
                        >
                            {/* Header / Banner */}
                            <div style={{
                                height: '80px',
                                background: `linear-gradient(135deg, ${color}20 0%, rgba(255,255,255,0.05) 100%)`,
                                position: 'relative'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px'
                                }}>
                                    <span className={`badge ${emp.status === "Active" ? "bg-success" : "bg-secondary"}`} style={{ backdropFilter: 'blur(4px)' }}>
                                        {emp.status}
                                    </span>
                                </div>
                            </div>

                            {/* Profile Image */}
                            <div className="d-flex justify-content-center" style={{ marginTop: '-40px' }}>
                                <img
                                    src={emp.photoUrl}
                                    alt={emp.name}
                                    className="rounded-circle border border-3 border-white shadow-sm"
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        objectFit: 'cover',
                                        backgroundColor: '#f0f0f0'
                                    }}
                                />
                            </div>

                            {/* Content */}
                            <div className="card-body text-center pt-3">
                                <h5 className="card-title mb-1 fw-bold text-white">{emp.name}</h5>
                                <p className="text-muted small mb-2">{emp.position}</p>

                                <div className="d-flex justify-content-center mb-3">
                                    <span
                                        className="badge px-3 py-2 rounded-pill d-flex align-items-center gap-2"
                                        style={{
                                            backgroundColor: `${color}20`,
                                            color: color,
                                            border: `1px solid ${color}40`
                                        }}
                                    >
                                        <DeptIcon size={14} />
                                        {emp.department}
                                    </span>
                                </div>

                                <div className="text-start mt-3 small text-white-50">
                                    <div className="d-flex align-items-center mb-2">
                                        <FiMail className="me-2" />
                                        <span className="text-truncate">{emp.email}</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <FiPhone className="me-2" />
                                        <span>{emp.phone || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="card-footer bg-transparent border-top border-white-10 p-3">
                                <div className="d-flex justify-content-between">
                                    <button
                                        className="btn btn-sm btn-outline-light rounded-circle p-2"
                                        onClick={(e) => { e.stopPropagation(); onView && onView(emp); }}
                                        title="View Details"
                                    >
                                        <FiEye />
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-warning rounded-circle p-2"
                                        onClick={(e) => { e.stopPropagation(); onEdit && onEdit(emp); }}
                                        title="Edit"
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger rounded-circle p-2"
                                        onClick={(e) => { e.stopPropagation(); onDelete && onDelete(emp.id); }}
                                        title="Delete"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default EmployeeGrid;
