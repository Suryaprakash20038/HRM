import React, { useState, useEffect } from 'react';
import taskService from '../../services/taskService';
import { toast } from 'react-toastify';
import {
    FiFileText,
    FiCalendar,
    FiUser,
    FiActivity,
    FiAlertCircle,
    FiPaperclip,
    FiBriefcase,
    FiX
} from 'react-icons/fi';

export default function TaskDetails({ show = false, taskId = null, onClose = () => { } }) {
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show && taskId) {
            fetchTaskDetails(taskId);
        } else {
            setTask(null);
        }
    }, [show, taskId]);

    const fetchTaskDetails = async (id) => {
        try {
            setLoading(true);
            const response = await taskService.getTaskById(id);
            if (response.success) {
                setTask(response.data.task);
            }
        } catch (error) {
            console.error('Error fetching task details:', error);
            toast.error('Failed to fetch task details');
        } finally {
            setLoading(false);
        }
    };

    // Reusable Section Component
    const Section = ({ icon: Icon, title, children }) => (
        <div className="mb-5 rounded-4 p-4 border" style={{ background: '#fdfbff', borderColor: '#E6C7E6' }}>
            <h6 className="d-flex align-items-center fw-bold mb-4" style={{ color: '#663399', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                <Icon className="me-2" size={18} /> {title}
            </h6>
            <div className="row g-4">
                {children}
            </div>
        </div>
    );

    // Field Component
    const Field = ({ label, value, col = 6, fullWidth = false, children }) => (
        <div className={`col-md-${fullWidth ? 12 : col}`}>
            <label className="small fw-bold text-uppercase mb-2 d-block" style={{ fontSize: '0.65rem', color: '#A3779D', letterSpacing: '1.5px' }}>{label}</label>
            <div className="fw-medium" style={{ color: '#2E1A47', fontSize: '1rem' }}>
                {children ? children : (value || '—')}
            </div>
        </div>
    );

    // Status Badge Helper
    const getStatusBadge = (status) => {
        const styles = {
            'Completed': { bg: '#dcfce7', text: '#059669' },
            'In Progress': { bg: '#e0f2fe', text: '#0284c7' },
            'To Do': { bg: '#f1f5f9', text: '#475569' },
            'Review': { bg: '#f3e8ff', text: '#7c3aed' },
            'Cancelled': { bg: '#fee2e2', text: '#dc2626' }
        };
        const style = styles[status] || { bg: '#E6C7E6', text: '#663399' };
        return <span className="badge px-4 py-2 rounded-pill fw-bold" style={{ backgroundColor: style.bg, color: style.text, textTransform: 'uppercase', fontSize: '0.7rem' }}>{status}</span>;
    };

    if (!show) return null;

    return (
        <div className="modal fade show" style={{ display: "grid", placeItems: "center", position: "fixed", inset: 0, background: "rgba(46, 26, 71, 0.7)", backdropFilter: 'blur(12px)', zIndex: 10000, overflow: 'hidden' }}>
            <div className="bg-white rounded-4 shadow-lg d-flex flex-column" style={{ width: '95vw', maxWidth: '1200px', height: '90vh', maxHeight: '90vh', position: 'relative', border: '1px solid #E6C7E6' }}>

                {loading ? (
                    <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="spinner-border" style={{ color: '#663399' }}></div>
                    </div>
                ) : !task ? (
                    <div className="text-center p-5">
                        <h3 className="fw-bold" style={{ color: '#2E1A47' }}>Directive not found</h3>
                        <button className="btn mt-3" style={{ background: '#663399', color: '#fff', borderRadius: '12px' }} onClick={onClose}>Close Portal</button>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="modal-header border-bottom bg-white p-5 sticky-top z-3 rounded-top-4">
                            <div className="d-flex align-items-center gap-4 w-100">
                                <div
                                    className="rounded-4 d-flex align-items-center justify-content-center text-white shadow-sm"
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        background: '#663399',
                                        fontSize: '2rem'
                                    }}
                                >
                                    {taskService && taskService.getTaskTypeIcon ? taskService.getTaskTypeIcon(task.taskType) : '📋'}
                                </div>

                                <div className="flex-grow-1">
                                    <h2 className="fw-extrabold mb-1" style={{ color: '#2E1A47', letterSpacing: '-1px' }}>{task.taskTitle}</h2>
                                    <div className="d-flex flex-wrap gap-2 text-muted align-items-center">
                                        <span className="fw-bold px-3 py-1 rounded-pill small" style={{ background: '#E6C7E6', color: '#663399', textTransform: 'uppercase' }}>
                                            {task.taskType}
                                        </span>
                                        <span style={{ color: '#E6C7E6' }}>|</span>
                                        <span className="fw-bold" style={{ color: '#A3779D' }}>{task.department || 'GLOBAL OPS'}</span>
                                        <span style={{ color: '#E6C7E6' }}>|</span>
                                        <span className="small fw-semibold">SID: {task._id?.substring(18).toUpperCase()}</span>
                                        {taskService.isOverdue(task) && (
                                            <>
                                                <span style={{ color: '#E6C7E6' }}>|</span>
                                                <span className="text-danger small fw-bold d-flex align-items-center"><FiAlertCircle className="me-1" />BREACHED</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="d-flex align-items-center gap-3">
                                    {getStatusBadge(task.status)}
                                    <button type="button" className="btn-close ms-2" onClick={onClose} aria-label="Close" />
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="modal-body p-5 bg-white overflow-auto rounded-bottom-4">
                            <div className="row g-5">
                                {/* Left Column */}
                                <div className="col-lg-7">
                                    <Section title="Target Intelligence" icon={FiFileText}>
                                        <Field label="Mission Briefing" fullWidth>
                                            <div style={{ lineHeight: '1.8', color: '#2E1A47', whiteSpace: 'pre-wrap' }}>{task.description}</div>
                                        </Field>
                                        <Field label="Urgency Level" value={task.priority} />
                                        <Field label="Operation Protocol" value={task.taskType} />
                                        <Field label="Strategic Project" value={task.project?.name || 'STAND-ALONE MISSION'} />
                                    </Section>

                                    <Section title="Mission Lifecycle" icon={FiCalendar}>
                                        <Field label="Activation" value={taskService.formatDate(task.startDate)} />
                                        <Field label="Target Deadline">
                                            <span className={taskService.isOverdue(task) ? "text-danger fw-bold" : ""} style={{ fontWeight: 700 }}>
                                                {taskService.formatDate(task.dueDate)}
                                            </span>
                                        </Field>
                                        <Field label="Validated At" value={task.completedAt ? taskService.formatDate(task.completedAt) : 'PENDING'} />
                                        <Field label="Cycle Remaining" value={`${taskService.getDaysRemaining(task.dueDate)} Operations`} />
                                    </Section>
                                </div>

                                {/* Right Column */}
                                <div className="col-lg-5">
                                    <Section title="Asset Assignment" icon={FiUser}>
                                        <Field label="Lead Field Agent" fullWidth>
                                            <div className="d-flex align-items-center gap-3 mt-2 p-3 rounded-4" style={{ background: '#fdfbff', border: '1px solid #E6C7E6' }}>
                                                <img
                                                    src={task.assignedTo?.profileImage || `https://ui-avatars.com/api/?name=${task.assignedTo?.firstName || 'A'}&background=E6C7E6&color=663399`}
                                                    alt="Assignee"
                                                    className="rounded-3"
                                                    style={{ width: '56px', height: '56px', objectFit: 'cover', border: '2px solid #663399' }}
                                                />
                                                <div>
                                                    <div className="fw-bold" style={{ color: '#2E1A47' }}>{task.assignedTo?.firstName} {task.assignedTo?.lastName}</div>
                                                    <div className="small fw-bold" style={{ color: '#A3779D' }}>{task.assignedTo?.position || 'ASSET'}</div>
                                                </div>
                                            </div>
                                        </Field>
                                        <Field label="Authorizing Authority" value={`${task.assignedBy?.firstName} ${task.assignedBy?.lastName}`} />
                                        <Field label="Operational Unit" value={task.department} />
                                    </Section>

                                    <Section title="Execution Maturity" icon={FiActivity}>
                                        <Field label="Projected Effort" value={`${task.estimatedHours || 0} OPT-HRS`} />
                                        <Field label="Real-time Effort" value={`${task.actualHours || 0} OPT-HRS`} />
                                        <Field label="Completion Vector" fullWidth>
                                            <div className="mt-3">
                                                <div className="d-flex justify-content-between mb-2 small fw-bold">
                                                    <span style={{ color: '#663399' }}>{task.progressPercent || 0}% SECURED</span>
                                                    <span style={{ color: '#A3779D' }}>{task.status}</span>
                                                </div>
                                                <div className="progress rounded-pill" style={{ height: '12px', background: '#E6C7E6' }}>
                                                    <div
                                                        className="progress-bar rounded-pill"
                                                        role="progressbar"
                                                        style={{ width: `${task.progressPercent || 0}%`, background: '#663399' }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </Field>
                                    </Section>

                                    {/* Attachments Section */}
                                    {task.attachments && task.attachments.length > 0 && (
                                        <div className="mb-4">
                                            <div className="d-flex align-items-center mb-4 border-bottom pb-2">
                                                <div className="p-2 bg-light rounded-circle me-3" style={{ color: '#663399' }}>
                                                    <FiBriefcase size={18} />
                                                </div>
                                                <h6 className="fw-bold text-uppercase m-0 ls-1" style={{ fontSize: '0.8rem', letterSpacing: '2px', color: '#663399' }}>Encrypted Assets</h6>
                                            </div>
                                            <div className="d-flex flex-wrap gap-2">
                                                {task.attachments.map((file, idx) => (
                                                    <a key={idx} href={`http://localhost:5000/${file.url}`} target="_blank" rel="noreferrer" className="btn btn-sm d-flex align-items-center gap-2 rounded-3 px-4 py-2 fw-bold" style={{ background: '#f8fafc', border: '1px solid #E6C7E6', color: '#663399' }}>
                                                        <FiPaperclip size={14} /> {file.name || 'DATA_NODE'}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
