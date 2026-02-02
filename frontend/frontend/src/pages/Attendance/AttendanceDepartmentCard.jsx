import React, { useMemo } from 'react';
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
    FiLayout,
    FiCheckCircle,
    FiXCircle,
    FiChevronRight
} from 'react-icons/fi';

const AttendanceDepartmentCard = ({ department, employees, attendanceMap, onClick }) => {

    // Calculate stats
    const stats = useMemo(() => {
        let present = 0;
        let absent = 0;
        let onLeave = 0;
        let total = employees.length;

        employees.forEach(emp => {
            const status = attendanceMap[emp._id]?.status;
            if (status === 'Present' || status === 'Late') present++;
            else if (status === 'Absent') absent++;
            else if (status === 'On Leave') onLeave++;
        });

        return { present, absent, onLeave, total };
    }, [employees, attendanceMap]);

    // Get icon and color based on department (Consistent Purple Theme)
    const { icon: Icon, color } = useMemo(() => {
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

    // Calculate percentage for progress bar
    const presentPercentage = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
    const leavePercentage = stats.total > 0 ? (stats.onLeave / stats.total) * 100 : 0;

    return (
        <div className="col-12 col-md-6 col-lg-4 col-xl-3 mb-4">
            <div
                className="card h-100 border-0"
                style={{
                    background: '#ffffff',
                    borderRadius: '24px',
                    border: '1px solid #E6C7E6',
                    boxShadow: '0 10px 30px -10px rgba(102, 51, 153, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                    position: 'relative'
                }}
                onClick={onClick}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = `0 12px 40px 0 ${color}40`;
                    e.currentTarget.style.border = `1px solid ${color}60`;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(102, 51, 153, 0.1)';
                    e.currentTarget.style.border = '1px solid #E6C7E6';
                }}
            >
                {/* Decorative background gradient blob */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-50px',
                        right: '-50px',
                        width: '150px',
                        height: '150px',
                        background: color,
                        filter: 'blur(60px)',
                        opacity: 0.15,
                        borderRadius: '50%',
                        pointerEvents: 'none'
                    }}
                />

                <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-4">
                        <div
                            className="p-3 rounded-2xl d-flex align-items-center justify-content-center"
                            style={{
                                background: `linear-gradient(135deg, ${color}20, ${color}10)`,
                                borderRadius: '16px',
                                color: color,
                                border: `1px solid ${color}30`,
                                width: '56px',
                                height: '56px'
                            }}
                        >
                            <Icon size={28} />
                        </div>
                        <div className="badge rounded-pill px-3 py-2 d-flex align-items-center gap-1"
                            style={{
                                background: `${color}10`,
                                border: `1px solid ${color}20`,
                                color: color,
                                fontWeight: 600
                            }}>
                            {stats.total} Total
                        </div>
                    </div>

                    <div className="mb-4">
                        <h4 className="card-title fw-bold mb-1" style={{ color: color, fontSize: '1.25rem', letterSpacing: '0.5px' }}>{department}</h4>
                        <p className="small mb-0" style={{ color: color, opacity: 0.7, fontSize: '0.85rem' }}>Attendance Overview</p>
                    </div>

                    {/* Attendance Stats */}
                    <div className="mt-auto">
                        <div className="d-flex justify-content-between mb-2 small" style={{ fontSize: '0.85rem' }}>
                            <span className="d-flex align-items-center gap-1" style={{ color: '#059669' }}>
                                <span className="rounded-circle" style={{ width: 6, height: 6, background: '#059669' }}></span>
                                Present: <span className="fw-bold" style={{ color: '#2E1A47' }}>{stats.present}</span>
                            </span>
                            <span className="d-flex align-items-center gap-1" style={{ color: '#dc2626' }}>
                                <span className="rounded-circle" style={{ width: 6, height: 6, background: '#dc2626' }}></span>
                                Absent: <span className="fw-bold" style={{ color: '#2E1A47' }}>{stats.absent}</span>
                            </span>
                            <span className="d-flex align-items-center gap-1" style={{ color: '#ca8a04' }}>
                                <span className="rounded-circle" style={{ width: 6, height: 6, background: '#ca8a04' }}></span>
                                Leave: <span className="fw-bold" style={{ color: '#2E1A47' }}>{stats.onLeave}</span>
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="progress" style={{ height: '6px', backgroundColor: '#F3F4F6', borderRadius: '10px', overflow: 'hidden' }}>
                            <div
                                className="progress-bar bg-success"
                                role="progressbar"
                                style={{ width: `${presentPercentage}%` }}
                            />
                            <div
                                className="progress-bar bg-warning"
                                role="progressbar"
                                style={{ width: `${leavePercentage}%` }}
                            />
                        </div>

                        <div className="d-flex justify-content-end mt-3">
                            <div
                                className="btn btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                                style={{
                                    background: '#E6C7E6',
                                    color: '#663399',
                                    width: '32px',
                                    height: '32px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <FiChevronRight size={16} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceDepartmentCard;
