import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import taskService from '../../services/taskService';
import employeeService from '../../services/employeeService';
import projectService from '../../services/projectService';
import { toast } from 'react-toastify';
import './TaskForm.css';
import './TaskFormOverride.css';
import { DEPARTMENTS } from '../../constants/departments';
import { FiX } from 'react-icons/fi';
import {
    Info,
    Users,
    Calendar,
    Link as LinkIcon
} from 'lucide-react';

// --- Modal Styles ---
const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(46, 26, 71, 0.75)", // Royal Amethyst Dark with opacity
    backdropFilter: "blur(12px)",
    zIndex: 10000,
    display: "grid",
    placeItems: "center",
    padding: "20px",
    overflowY: "auto"
};

const modalContentStyle = {
    background: "#ffffff",
    borderRadius: "32px",
    boxShadow: "0 40px 100px -20px rgba(46, 26, 71, 0.4)",
    width: "95vw",
    maxWidth: "1100px",
    maxHeight: "90vh",
    overflowY: "hidden",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #E6C7E6",
    position: "relative",
    margin: "auto"
};

const headerStyle = {
    padding: "32px 40px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#ffffff",
    position: "sticky",
    top: 0,
    zIndex: 10
};

const footerStyle = {
    padding: "24px 40px",
    borderTop: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "flex-end",
    gap: "16px",
    background: "#fdfbff",
    borderRadius: "0 0 32px 32px"
};

const sectionTitleStyle = {
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "2px",
    color: "#663399",
    fontWeight: 800,
    marginBottom: "1.5rem",
    marginTop: "2.5rem",
    borderBottom: "1px solid #E6C7E6",
    paddingBottom: "0.75rem",
    display: "flex",
    alignItems: "center",
    gap: "10px"
};

const inputStyle = (hasError) => ({
    width: "100%",
    padding: "0.875rem 1.25rem",
    fontSize: "0.95rem",
    lineHeight: "1.5",
    color: "#2E1A47",
    background: "#f8fafc",
    border: hasError ? "2px solid #DC2626" : "2px solid #f1f5f9",
    borderRadius: "14px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    outline: "none",
    fontWeight: "500"
});

const labelStyle = {
    display: "block",
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#2E1A47",
    marginBottom: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
};

const TaskForm = ({ show = true, onClose, taskId, onSuccess }) => {
    const navigate = useNavigate();
    const { id: paramId } = useParams();

    const activeId = taskId || paramId;
    const isEditMode = Boolean(activeId);

    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [projects, setProjects] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);

    const [formData, setFormData] = useState({
        taskTitle: '',
        description: '',
        taskType: 'Feature',
        priority: 'Medium',
        status: 'To Do',
        assignedTo: '',
        department: '',
        members: [],
        startDate: '',
        dueDate: '',
        estimatedHours: 0,
        actualHours: 0,
        relatedProject: '',
        progressPercent: 0
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!show) return;
        fetchEmployees();
        fetchProjects();
    }, [show]);

    useEffect(() => {
        if (!show) return;
        if (isEditMode) {
            fetchTaskData(activeId);
        } else {
            setFormData({
                taskTitle: '',
                description: '',
                taskType: 'Feature',
                priority: 'Medium',
                status: 'To Do',
                assignedTo: '',
                department: '',
                members: [],
                startDate: '',
                dueDate: '',
                estimatedHours: 0,
                actualHours: 0,
                relatedProject: '',
                progressPercent: 0
            });
        }
    }, [show, activeId]);

    useEffect(() => {
        if (formData.department) {
            const filtered = employees.filter(emp => emp.department === formData.department);
            setFilteredEmployees(filtered);
        } else {
            setFilteredEmployees(employees);
        }
    }, [formData.department, employees]);

    const fetchEmployees = async () => {
        try {
            const response = await employeeService.getAllEmployees();
            if (response && response.employees) {
                setEmployees(response.employees);
                const employeeDepts = response.employees.map(emp => emp.department).filter(Boolean);
                const uniqueDepts = [...new Set([...DEPARTMENTS, ...employeeDepts])].sort();
                setDepartments(uniqueDepts);
            } else if (Array.isArray(response)) {
                setEmployees(response);
                const employeeDepts = response.map(emp => emp.department).filter(Boolean);
                const uniqueDepts = [...new Set([...DEPARTMENTS, ...employeeDepts])].sort();
                setDepartments(uniqueDepts);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await projectService.getAllProjects();
            if (response && (response.projects || response.data?.projects)) {
                setProjects(response.projects || response.data.projects);
            } else if (Array.isArray(response)) {
                setProjects(response);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const fetchTaskData = async (tid) => {
        try {
            setLoading(true);
            const response = await taskService.getTaskById(tid);
            if (response.success) {
                const task = response.data.task;
                setFormData({
                    taskTitle: task.taskTitle,
                    description: task.description,
                    taskType: task.taskType,
                    priority: task.priority,
                    status: task.status,
                    assignedTo: task.assignedTo?._id || '',
                    department: task.department,
                    members: task.members?.map(m => m._id) || [],
                    startDate: task.startDate?.split('T')[0] || '',
                    dueDate: task.dueDate?.split('T')[0] || '',
                    estimatedHours: task.estimatedHours || 0,
                    actualHours: task.actualHours || 0,
                    relatedProject: task.relatedProject?._id || '',
                    progressPercent: task.progressPercent || 0
                });
            }
        } catch (error) {
            console.error('Error fetching task:', error);
            toast.error('Failed to fetch task details');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.taskTitle.trim()) newErrors.taskTitle = 'Task title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.assignedTo) newErrors.assignedTo = 'Please assign to an employee';
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
        if (formData.startDate && formData.dueDate) {
            if (new Date(formData.dueDate) < new Date(formData.startDate)) {
                newErrors.dueDate = 'Due date must be on or after start date';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleClose = () => {
        if (onClose) onClose();
        else navigate('/tasks');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please fix the errors');
            return;
        }

        try {
            setLoading(true);
            const submitData = {
                ...formData,
                estimatedHours: parseFloat(formData.estimatedHours) || 0,
                actualHours: parseFloat(formData.actualHours) || 0,
                progressPercent: parseInt(formData.progressPercent) || 0,
                relatedProject: formData.relatedProject || null
            };

            let response;
            if (isEditMode) {
                response = await taskService.updateTask(activeId, submitData);
            } else {
                response = await taskService.createTask(submitData);
            }

            if (response.success) {
                toast.success(isEditMode ? 'Task updated' : 'Task created');
                if (onSuccess) onSuccess();
                handleClose();
            }
        } catch (error) {
            console.error('Error saving task:', error);
            toast.error(error.message || 'Failed to save task');
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    const TASK_TYPES = ["Feature", "Bug", "Improvement", "Research", "Meeting", "Admin", "Testing", "Documentation"];
    const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
    const STATUSES = ["To Do", "In Progress", "Review", "Completed", "Cancelled"];

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle} className="animate__animated animate__fadeInUp animate__faster">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

                    {/* Header */}
                    <div style={headerStyle}>
                        <div>
                            <h4 className="m-0 fw-bold" style={{ color: '#2E1A47', letterSpacing: '-0.5px' }}>
                                {isEditMode ? 'Recalibrate Directive' : 'Deploy Strategic Directive'}
                            </h4>
                            <p className="m-0 small" style={{ color: '#A3779D', fontWeight: 500 }}>Operational parameters and assignment configuration</p>
                        </div>
                        <button type="button" onClick={handleClose} className="btn-close shadow-none" aria-label="Close"></button>
                    </div>

                    <div style={{ padding: "40px", flex: 1, overflowY: "auto" }}>

                        {/* Basic Information */}
                        <div style={{ ...sectionTitleStyle, marginTop: 0 }}>
                            <Info size={16} /> Operational Briefing
                        </div>
                        <div className="row g-4">
                            <div className="col-12">
                                <label style={labelStyle}>Directive Title <span className="text-danger">*</span></label>
                                <input
                                    name="taskTitle"
                                    value={formData.taskTitle}
                                    onChange={handleChange}
                                    style={inputStyle(errors.taskTitle)}
                                    placeholder="Enter strategic directive name"
                                />
                                {errors.taskTitle && <div className="small text-danger mt-1">{errors.taskTitle}</div>}
                            </div>
                            <div className="col-12">
                                <label style={labelStyle}>Mission Description <span className="text-danger">*</span></label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    style={{ ...inputStyle(errors.description), minHeight: "120px", resize: "vertical" }}
                                    placeholder="Detailed mission requirements and success criteria"
                                />
                                {errors.description && <div className="small text-danger mt-1">{errors.description}</div>}
                            </div>

                            <div className="col-md-4">
                                <label style={labelStyle}>Directive Protocol</label>
                                <select
                                    name="taskType"
                                    value={TASK_TYPES.includes(formData.taskType) ? formData.taskType : (formData.taskType ? "Other" : "Feature")}
                                    onChange={(e) => {
                                        if (e.target.value === "Other") setFormData(s => ({ ...s, taskType: "Other" }));
                                        else handleChange(e);
                                    }}
                                    style={inputStyle(false)}
                                >
                                    {TASK_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                    <option value="Other">Custom Protocol</option>
                                </select>
                            </div>

                            <div className="col-md-4">
                                <label style={labelStyle}>Urgency Tier</label>
                                <select
                                    name="priority"
                                    value={PRIORITIES.includes(formData.priority) ? formData.priority : (formData.priority ? "Other" : "Medium")}
                                    onChange={(e) => {
                                        if (e.target.value === "Other") setFormData(s => ({ ...s, priority: "Other" }));
                                        else handleChange(e);
                                    }}
                                    style={inputStyle(false)}
                                >
                                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                                    <option value="Other">Custom Priority</option>
                                </select>
                            </div>

                            <div className="col-md-4">
                                <label style={labelStyle}>Maturity Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    style={inputStyle(false)}
                                >
                                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Assignment */}
                        <div style={sectionTitleStyle}>
                            <Users size={16} /> Asset Allocation
                        </div>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <label style={labelStyle}>Division Unit</label>
                                <select name="department" value={formData.department} onChange={handleChange} style={inputStyle(false)}>
                                    <option value="">Select Division</option>
                                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label style={labelStyle}>Lead Agent <span className="text-danger">*</span></label>
                                <select name="assignedTo" value={formData.assignedTo} onChange={handleChange} style={inputStyle(errors.assignedTo)} disabled={!formData.department}>
                                    <option value="">Select Personnel</option>
                                    {filteredEmployees.map(e => (
                                        <option key={e._id} value={e._id}>{e.firstName} {e.lastName} - {e.position}</option>
                                    ))}
                                </select>
                                {errors.assignedTo && <div className="small text-danger mt-1">{errors.assignedTo}</div>}
                            </div>

                            <div className="col-12">
                                <label style={labelStyle}>Tactical Support Team</label>
                                <div className="border rounded-4 p-4" style={{ maxHeight: '200px', overflowY: 'auto', background: '#fdfbff', borderColor: '#E6C7E6' }}>
                                    {filteredEmployees.length === 0 ? (
                                        <div className="text-center py-4 text-muted small">Select division units to view available personnel</div>
                                    ) : (
                                        <div className="row">
                                            {filteredEmployees.map(emp => (
                                                <div key={emp._id} className="col-md-6 mb-2">
                                                    <div className="form-check custom-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id={`member-${emp._id}`}
                                                            checked={formData.members.includes(emp._id)}
                                                            onChange={(e) => {
                                                                const newVal = e.target.checked
                                                                    ? [...formData.members, emp._id]
                                                                    : formData.members.filter(id => id !== emp._id);
                                                                setFormData({ ...formData, members: newVal });
                                                            }}
                                                        />
                                                        <label className="form-check-label" htmlFor={`member-${emp._id}`} style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                                                            {emp.firstName} {emp.lastName}
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div style={sectionTitleStyle}>
                            <Calendar size={16} /> Operational Lifecycle
                        </div>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <label style={labelStyle}>Activation Date <span className="text-danger">*</span></label>
                                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} style={inputStyle(errors.startDate)} />
                            </div>
                            <div className="col-md-6">
                                <label style={labelStyle}>Target Completion <span className="text-danger">*</span></label>
                                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} style={inputStyle(errors.dueDate)} />
                            </div>
                            <div className="col-md-4">
                                <label style={labelStyle}>Projected Effort (Hrs)</label>
                                <input type="number" name="estimatedHours" value={formData.estimatedHours} onChange={handleChange} style={inputStyle(false)} placeholder="0" />
                            </div>
                            <div className="col-md-4">
                                <label style={labelStyle}>Incurred Effort (Hrs)</label>
                                <input type="number" name="actualHours" value={formData.actualHours} onChange={handleChange} style={inputStyle(false)} placeholder="0" />
                            </div>
                            <div className="col-md-4">
                                <label style={labelStyle}>Execution Maturity (%)</label>
                                <input type="number" name="progressPercent" value={formData.progressPercent} onChange={handleChange} style={inputStyle(false)} min="0" max="100" />
                            </div>
                        </div>

                        {/* Relations */}
                        <div style={sectionTitleStyle}>
                            <LinkIcon size={16} /> Strategic Alignment
                        </div>
                        <div className="row g-4">
                            <div className="col-12">
                                <label style={labelStyle}>Parent Project</label>
                                <select name="relatedProject" value={formData.relatedProject} onChange={handleChange} style={inputStyle(false)}>
                                    <option value="">Stand-alone Directive</option>
                                    {projects.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={footerStyle}>
                        <button type="button" onClick={handleClose} className="btn" style={{ borderRadius: "14px", fontWeight: 700, padding: '12px 24px', background: '#E6C7E6', color: '#663399', border: 'none' }}>
                            Retract Directive
                        </button>
                        <button type="submit" className="btn" style={{ borderRadius: "14px", fontWeight: 700, padding: '12px 32px', background: '#663399', color: '#ffffff', border: 'none', boxShadow: '0 10px 25px -5px rgba(102, 51, 153, 0.4)' }}>
                            {loading ? 'Processing...' : (isEditMode ? 'Authorize Changes' : 'Confirm Deployment')}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default TaskForm;
