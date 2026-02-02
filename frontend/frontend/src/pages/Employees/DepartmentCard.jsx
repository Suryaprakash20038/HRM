import React, { useMemo } from 'react';
import {
    FiUsers,
    FiChevronRight,
    FiCode,
    FiCpu,
    FiTrendingUp,
    FiPieChart,
    FiPenTool,
    FiBriefcase,
    FiSettings,
    FiHeadphones,
    FiDollarSign,
    FiDatabase,
    FiLayout,
    FiFileText,
    FiGlobe
} from 'react-icons/fi';

const DepartmentCard = ({ department, count, employees, onClick }) => {
    // Get up to 3 employee images for the preview
    const previewEmployees = employees.slice(0, 3);

    // Get icon and color based on department (Consistent Purple Theme)
    const { icon: Icon, color } = useMemo(() => {
        const dept = department.toLowerCase();
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
        if (dept.includes('data') || dept.includes('analytics'))
            return { icon: FiDatabase, color: purpleColor };

        return { icon: FiLayout, color: purpleColor };
    }, [department]);

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
                    e.currentTarget.style.boxShadow = `0 12px 40px 0 ${color}40`; // Dynamic colored shadow
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
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, display: 'inline-block' }}></span>
                            {count} Members
                        </div>
                    </div>

                    <div className="mb-4">
                        <h4 className="card-title fw-bold mb-1" style={{ color: color, fontSize: '1.25rem', letterSpacing: '0.5px' }}>{department}</h4>
                        <p className="small mb-0" style={{ color: color, opacity: 0.7, fontSize: '0.85rem' }}>Department</p>
                    </div>

                    <div className="d-flex align-items-center justify-content-between mt-auto pt-3 border-top" style={{ borderColor: '#E6C7E6' }}>
                        <div className="d-flex ps-2">
                            {previewEmployees.map((emp, index) => (
                                <div
                                    key={emp.id}
                                    className="position-relative"
                                    style={{
                                        marginLeft: index > 0 ? '-12px' : '0',
                                        zIndex: 3 - index,
                                        transition: 'transform 0.2s'
                                    }}
                                >
                                    <img
                                        src={emp.photoUrl}
                                        alt={emp.name}
                                        onError={(e) => {
                                            e.target.onerror = null; // Prevent infinite loop
                                            e.target.src = `https://i.pravatar.cc/100?u=${emp.id || emp.email}`;
                                        }}
                                        className="rounded-circle border border-2 border-white shadow-sm"
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            objectFit: 'cover',
                                            background: '#f8fafc'
                                        }}
                                    />
                                </div>
                            ))}
                            {count > 3 && (
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center small shadow-sm"
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        marginLeft: '-12px',
                                        zIndex: 0,
                                        fontSize: '11px',
                                        background: '#E6C7E6',
                                        color: '#663399',
                                        border: '2px solid white'
                                    }}
                                >
                                    +{count - 3}
                                </div>
                            )}
                        </div>

                        <div
                            className="btn btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                            style={{
                                background: '#E6C7E6',
                                color: '#663399',
                                width: '36px',
                                height: '36px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <FiChevronRight size={18} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepartmentCard;
