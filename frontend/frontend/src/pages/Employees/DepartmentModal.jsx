import React, { useMemo } from 'react';
import EmployeeList from './EmployeeList'; // Reusing the list/table component
import { FiX } from 'react-icons/fi';
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

const DepartmentModal = ({ show, department, employees, onClose, onView, onEdit, onDelete, onSendEmail }) => {

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

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
            zIndex: 100000,
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
                <div style={{
                    padding: '30px 40px',
                    background: 'linear-gradient(to right, #ffffff, #f9fafb)',
                    borderBottom: '1px solid #f3f4f6',
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
                                {department} Department
                            </h2>
                            <div className="d-flex align-items-center gap-2">
                                <span className="badge border px-3 py-1 rounded-pill fs-6 fw-normal" style={{ backgroundColor: '#E6C7E6', color: '#663399' }}>
                                    {employees.length} Members
                                </span>
                                <span className="small" style={{ color: '#A3779D' }}>Manage your team members and roles</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-circle shadow-sm hover-scale"
                        style={{
                            width: '48px',
                            height: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            color: '#663399',
                            cursor: 'pointer'
                        }}
                    >
                        <FiX size={24} />
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '0', background: '#f8fafc' }}>
                    <div className="p-0">
                        <EmployeeList
                            employees={employees}
                            onView={onView}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onSendEmail={onSendEmail}
                        />
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

export default DepartmentModal;
