import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getMyModules, addRequirement, getProjectById, deleteRequirement } from "../services/projectService";
import { createTask, getTasksByModule, deleteTask } from "../services/taskService";
import { getEmployeesByDepartment } from "../services/projectService";
import { FiPlus, FiList, FiCheckSquare, FiClock, FiUser, FiAlertCircle, FiTrash2, FiShield, FiTag, FiUpload, FiPaperclip, FiPlusCircle, FiCheckCircle, FiSearch, FiX, FiXCircle } from "react-icons/fi";

import { EMP_THEME } from "./theme";

export default function TeamLeadModuleDashboard() {
    const [loading, setLoading] = useState(true);
    const [modules, setModules] = useState([]);
    const [selectedModule, setSelectedModule] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [modalActiveTab, setModalActiveTab] = useState('tasks'); // 'tasks' or 'requirements'
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [showReqForm, setShowReqForm] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [empSearch, setEmpSearch] = useState("");

    // Form States
    const [taskFiles, setTaskFiles] = useState([]);
    const [selectedRequirementFiles, setSelectedRequirementFiles] = useState([]);
    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        requirement: '',
        priority: 'Medium',
        dueDate: '',
        assignedTo: []
    });

    const [reqForm, setReqForm] = useState({
        title: '',
        description: '',
        requirementType: 'Functional',
        priority: 'Medium'
    });
    const [reqFiles, setReqFiles] = useState([]);

    const [submitting, setSubmitting] = useState(false);
    const [viewingTask, setViewingTask] = useState(null);

    useEffect(() => {
        loadModules();
    }, []);

    const loadModules = async () => {
        try {
            setLoading(true);
            const response = await getMyModules();
            setModules(response.data.modules || []);
        } catch (error) {
            console.error("Error loading modules:", error);
            toast.error("Failed to load modules");
        } finally {
            setLoading(false);
        }
    };

    const handleModuleClick = async (module) => {
        setSelectedModule(module);
        setModalActiveTab('tasks');
        setShowTaskForm(false);
        setShowReqForm(false);

        // Load tasks for this module
        try {
            const taskResponse = await getTasksByModule(module._id);
            setTasks(taskResponse.data.tasks || []);
        } catch (error) {
            console.error("Error loading tasks:", error);
        }

        // Load employees from project department
        try {
            const empResponse = await getEmployeesByDepartment(module.projectId?.department || 'IT');
            setEmployees(empResponse.data.employees || []);
        } catch (error) {
            console.error("Error loading employees:", error);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!selectedModule) return;
        if (taskForm.assignedTo.length === 0) {
            toast.warning("Please assign at least one employee");
            return;
        }

        try {
            setSubmitting(true);
            const projectId = typeof selectedModule.projectId === 'object' ? selectedModule.projectId._id : selectedModule.projectId;

            const formData = new FormData();
            formData.append('title', taskForm.title);
            formData.append('description', taskForm.description);
            if (taskForm.requirement) {
                formData.append('requirement', taskForm.requirement);
            }
            formData.append('priority', taskForm.priority);
            formData.append('dueDate', taskForm.dueDate);
            formData.append('project', projectId);
            formData.append('module', selectedModule._id);

            taskForm.assignedTo.forEach(empId => {
                formData.append('assignedTo', empId);
            });

            // 1. New files uploaded for this task
            taskFiles.forEach(file => {
                formData.append('files', file);
            });

            // 2. Forwarded requirement files
            let allExistingFiles = [...selectedRequirementFiles];

            // 3. AUTO-FORWARD Project Root Files (from Admin/Manager)
            if (selectedModule.projectId?.files && selectedModule.projectId.files.length > 0) {
                const projectFiles = selectedModule.projectId.files.map(f => ({
                    fileName: `[PROJECT] ${f.fileName}`,
                    fileUrl: f.fileUrl,
                    isProjectLevel: true
                }));
                allExistingFiles = [...allExistingFiles, ...projectFiles];
            }

            // 4. AUTO-FORWARD Module Specific Files (from Manager)
            if (selectedModule.files && selectedModule.files.length > 0) {
                const moduleFiles = selectedModule.files.map(f => ({
                    fileName: `[MODULE] ${f.fileName}`,
                    fileUrl: f.fileUrl,
                    isModuleLevel: true
                }));
                allExistingFiles = [...allExistingFiles, ...moduleFiles];
            }

            if (allExistingFiles.length > 0) {
                formData.append('existingAttachments', JSON.stringify(allExistingFiles));
            }

            await createTask(formData);
            toast.success("Task created! All project & requirement files shared.");
            setShowTaskForm(false);
            setTaskForm({
                title: '',
                description: '',
                requirement: '',
                priority: 'Medium',
                dueDate: '',
                assignedTo: []
            });
            setTaskFiles([]);
            setSelectedRequirementFiles([]);

            // Reload tasks
            const taskResponse = await getTasksByModule(selectedModule._id);
            setTasks(taskResponse.data.tasks || []);
        } catch (error) {
            console.error("Error creating task:", error);
            toast.error("Failed to create task");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddRequirement = async (e) => {
        e.preventDefault();
        if (!selectedModule) return;

        try {
            setSubmitting(true);
            const projectId = typeof selectedModule.projectId === 'object' ? selectedModule.projectId._id : selectedModule.projectId;

            const formData = new FormData();
            formData.append('title', reqForm.title);
            formData.append('description', reqForm.description);
            formData.append('requirementType', reqForm.requirementType);
            formData.append('priority', reqForm.priority);

            reqFiles.forEach(file => {
                formData.append('files', file);
            });

            await addRequirement(projectId, formData);
            toast.success("New requirement added to project!");
            setShowReqForm(false);
            setReqForm({
                title: '',
                description: '',
                requirementType: 'Functional',
                priority: 'Medium'
            });
            setReqFiles([]);

            // Reload project data to get new requirements
            const projResp = await getProjectById(projectId);
            const updatedModule = { ...selectedModule, projectId: projResp.data.project };
            setSelectedModule(updatedModule);

            // Update the module in the main list too
            setModules(prev => prev.map(m => m._id === selectedModule._id ? updatedModule : m));

        } catch (error) {
            console.error("Error adding requirement:", error);
            toast.error("Failed to add requirement");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteRequirement = async (projectId, reqId) => {
        if (!window.confirm("Are you sure you want to delete this requirement?")) return;
        try {
            await deleteRequirement(projectId, reqId);
            toast.success("Requirement removed");

            // Refresh module data
            const projResp = await getProjectById(projectId);
            const updatedModule = { ...selectedModule, projectId: projResp.data.project };
            setSelectedModule(updatedModule);
            setModules(prev => prev.map(m => m._id === selectedModule._id ? updatedModule : m));
        } catch (error) {
            toast.error("Failed to delete requirement");
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;

        try {
            await deleteTask(taskId);
            toast.success("Task deleted successfully");

            // Reload tasks
            const taskResponse = await getTasksByModule(selectedModule._id);
            setTasks(taskResponse.data.tasks || []);
        } catch (error) {
            console.error("Error deleting task:", error);
            toast.error("Failed to delete task");
        }
    };

    const toggleEmployeeSelection = (empId) => {
        setTaskForm(prev => {
            const isSelected = prev.assignedTo.includes(empId);
            return {
                ...prev,
                assignedTo: isSelected
                    ? prev.assignedTo.filter(id => id !== empId)
                    : [...prev.assignedTo, empId]
            };
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            'Pending': '#6366f1',
            'To Do': '#6366f1',
            'In Progress': '#f59e0b',
            'Completed': '#10b981',
            'On Hold': '#ef4444'
        };
        return colors[status] || '#64748b';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'Low': '#10b981',
            'Medium': '#f59e0b',
            'High': '#ef4444',
            'Critical': '#dc2626'
        };
        return colors[priority] || '#64748b';
    };

    const filteredEmployees = employees.filter(emp =>
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(empSearch.toLowerCase()) ||
        emp.position?.toLowerCase().includes(empSearch.toLowerCase())
    );

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="spinner-border" style={{ color: EMP_THEME.royalPurple }} />
            </div>
        );
    }

    return (
        <div className="container-fluid p-4" style={{ background: EMP_THEME.deepPlum, minHeight: '100vh' }}>
            <div className="row mb-4">
                <div className="col-12">
                    <h2 style={{ color: EMP_THEME.lilacMist, fontWeight: '700' }}>
                        <FiList className="me-2" />
                        My Modules
                    </h2>
                    <p style={{ color: EMP_THEME.softViolet }}>Create and manage tasks for your assigned modules</p>
                </div>
            </div>

            {modules.length === 0 ? (
                <div className="text-center py-5">
                    <FiAlertCircle size={48} style={{ color: EMP_THEME.softViolet }} />
                    <p className="mt-3" style={{ color: EMP_THEME.lilacMist }}>No modules assigned yet</p>
                </div>
            ) : (
                <div className="row g-4">
                    {modules.map(module => (
                        <div key={module._id} className="col-md-6 col-lg-4">
                            <div
                                className="card h-100 overflow-hidden"
                                style={{
                                    background: `linear-gradient(135deg, ${EMP_THEME.midnightPlum}, ${EMP_THEME.deepPlum})`,
                                    border: `1px solid ${EMP_THEME.softViolet}22`,
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                                }}
                                onClick={() => handleModuleClick(module)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-10px)';
                                    e.currentTarget.style.borderColor = EMP_THEME.royalPurple;
                                    e.currentTarget.style.boxShadow = `0 20px 40px ${EMP_THEME.royalPurple}22`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = `${EMP_THEME.softViolet}22`;
                                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
                                }}
                            >
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="p-2 rounded-3" style={{ background: `${EMP_THEME.royalPurple}22`, color: EMP_THEME.royalPurple }}>
                                            <FiList size={20} />
                                        </div>
                                        <span
                                            className="badge rounded-pill px-3 py-2"
                                            style={{
                                                background: `${getStatusColor(module.status)}22`,
                                                color: getStatusColor(module.status),
                                                border: `1px solid ${getStatusColor(module.status)}33`,
                                                fontSize: '0.75rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            {module.status}
                                        </span>
                                    </div>
                                    <h5 style={{ color: EMP_THEME.lilacMist, fontWeight: '700', marginBottom: '8px' }}>
                                        {module.moduleName}
                                    </h5>
                                    <p className="mb-3" style={{ color: EMP_THEME.softViolet, fontSize: '0.85rem', fontWeight: '500', opacity: 0.8 }}>
                                        {module.projectName}
                                    </p>
                                    <p style={{ color: EMP_THEME.softViolet, fontSize: '0.9rem', lineHeight: '1.6', height: '3em', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                        {module.description}
                                    </p>

                                    <div className="mt-4 pt-3 border-top" style={{ borderColor: `${EMP_THEME.softViolet}11` }}>
                                        {module.dueDate && (
                                            <div className="d-flex align-items-center">
                                                <div className="p-1.5 rounded-circle me-2" style={{ background: `${EMP_THEME.royalPurple}11` }}>
                                                    <FiClock size={12} style={{ color: EMP_THEME.royalPurple }} />
                                                </div>
                                                <small style={{ color: EMP_THEME.softViolet, fontWeight: '500' }}>
                                                    Deadline: {new Date(module.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Module Overview Modal */}
            {selectedModule && (
                <div className="modal show d-block" style={{ background: 'rgba(5, 5, 20, 0.85)', backdropFilter: 'blur(12px)', zIndex: 9999 }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content overflow-hidden"
                            style={{
                                background: EMP_THEME.midnightPlum,
                                border: `1px solid ${EMP_THEME.softViolet}44`,
                                borderRadius: '24px',
                                boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
                            }}>
                            <div className="modal-header border-0 px-4 py-3"
                                style={{
                                    background: `linear-gradient(90deg, ${EMP_THEME.royalPurple}44, transparent)`,
                                    borderBottom: `1px solid ${EMP_THEME.softViolet}11`
                                }}>
                                <div className="d-flex align-items-center">
                                    <div className="p-2.5 rounded-3 me-3 d-flex align-items-center justify-content-center" style={{ background: EMP_THEME.royalPurple, color: '#fff', width: '42px', height: '42px' }}>
                                        <FiList size={22} />
                                    </div>
                                    <div>
                                        <h5 className="modal-title mb-0" style={{ color: EMP_THEME.lilacMist, fontWeight: '700', fontSize: '1.25rem', letterSpacing: '0.5px' }}>
                                            {selectedModule.moduleName}
                                        </h5>
                                        <small style={{ color: EMP_THEME.softViolet, fontWeight: '500', opacity: 0.8, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Project Board • {selectedModule.projectName}
                                        </small>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn-link text-white border-0 bg-transparent p-2 d-flex align-items-center justify-content-center"
                                    onClick={() => {
                                        setSelectedModule(null);
                                        setShowTaskForm(false);
                                        setShowReqForm(false);
                                        setTaskFiles([]);
                                        setSelectedRequirementFiles([]);
                                        setEmpSearch("");
                                    }}
                                    style={{ fontSize: '1.2rem', transition: 'all 0.2s', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                >
                                    <FiX />
                                </button>
                            </div>

                            {/* Tabs Header */}
                            <div className="px-4 py-2 d-flex gap-4" style={{ background: `${EMP_THEME.midnightPlum}`, borderBottom: `1px solid ${EMP_THEME.softViolet}11` }}>
                                <button
                                    onClick={() => setModalActiveTab('tasks')}
                                    className="btn btn-link p-2 text-decoration-none position-relative"
                                    style={{
                                        color: modalActiveTab === 'tasks' ? EMP_THEME.lilacMist : EMP_THEME.softViolet,
                                        fontWeight: '600',
                                        fontSize: '0.9rem',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    Board View
                                    {modalActiveTab === 'tasks' && (
                                        <div className="position-absolute bottom-0 start-0 w-100" style={{ height: '3px', background: EMP_THEME.royalPurple, borderRadius: '3px 3px 0 0' }} />
                                    )}
                                </button>
                                <button
                                    onClick={() => setModalActiveTab('requirements')}
                                    className="btn btn-link p-2 text-decoration-none position-relative"
                                    style={{
                                        color: modalActiveTab === 'requirements' ? EMP_THEME.lilacMist : EMP_THEME.softViolet,
                                        fontWeight: '600',
                                        fontSize: '0.9rem',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    Requirements & Docs
                                    {modalActiveTab === 'requirements' && (
                                        <div className="position-absolute bottom-0 start-0 w-100" style={{ height: '3px', background: EMP_THEME.royalPurple, borderRadius: '3px 3px 0 0' }} />
                                    )}
                                </button>
                            </div>

                            <div className="modal-body p-4">
                                {modalActiveTab === 'tasks' ? (
                                    <>
                                        {/* Board Header */}
                                        <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded-4" style={{ background: `${EMP_THEME.deepPlum}88`, border: `1px solid ${EMP_THEME.softViolet}11` }}>
                                            <div>
                                                <h6 className="mb-0" style={{ color: EMP_THEME.lilacMist, fontWeight: '600' }}>Module Tasks Board</h6>
                                                <small style={{ color: EMP_THEME.softViolet }}>{tasks.length} active assignments</small>
                                            </div>
                                            <button
                                                className="btn px-4 py-2"
                                                style={{
                                                    background: `linear-gradient(45deg, ${EMP_THEME.royalPurple}, ${EMP_THEME.vibrantViolet})`,
                                                    color: '#fff',
                                                    borderRadius: '12px',
                                                    fontWeight: '600',
                                                    boxShadow: `0 4px 15px ${EMP_THEME.royalPurple}44`,
                                                    border: 'none'
                                                }}
                                                onClick={() => setShowTaskForm(!showTaskForm)}
                                            >
                                                {showTaskForm ? <><FiX className="me-2" />Close</> : <><FiPlus className="me-2" />New Task</>}
                                            </button>
                                        </div>

                                        {/* Task Creation Form */}
                                        {showTaskForm && (
                                            <div className="card mb-4 overflow-hidden" style={{ background: `${EMP_THEME.deepPlum}cc`, border: `1px solid ${EMP_THEME.royalPurple}44`, backdropFilter: 'blur(10px)', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                                                <div className="card-header py-3" style={{ background: `${EMP_THEME.royalPurple}22`, borderBottom: `1px solid ${EMP_THEME.royalPurple}33` }}>
                                                    <h6 className="mb-0" style={{ color: EMP_THEME.lilacMist, fontWeight: '600' }}><FiPlus className="me-2" />Create New Task</h6>
                                                </div>
                                                <div className="card-body p-4">
                                                    <form onSubmit={handleCreateTask}>
                                                        <div className="row g-4">
                                                            <div className="col-12">
                                                                <label className="form-label" style={{ color: EMP_THEME.softViolet, fontWeight: '500' }}>Task Title *</label>
                                                                <input type="text" className="form-control form-control-lg" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required placeholder="What needs to be done?" style={{ background: `${EMP_THEME.midnightPlum}88`, color: '#fff', border: `1px solid ${EMP_THEME.softViolet}44`, borderRadius: '10px' }} />
                                                            </div>
                                                            <div className="col-md-6">
                                                                <label className="form-label" style={{ color: EMP_THEME.softViolet, fontWeight: '500' }}>Priority</label>
                                                                <select className="form-select form-select-lg" value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })} style={{ background: `${EMP_THEME.midnightPlum}88`, color: '#fff', border: `1px solid ${EMP_THEME.softViolet}44`, borderRadius: '10px' }}>
                                                                    <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Critical">Critical</option>
                                                                </select>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <label className="form-label" style={{ color: EMP_THEME.softViolet, fontWeight: '500' }}>Linked Requirement & Assets</label>
                                                                <div className="input-group">
                                                                    <span className="input-group-text border-end-0" style={{ background: `${EMP_THEME.midnightPlum}88`, color: EMP_THEME.royalPurple, border: `1px solid ${EMP_THEME.softViolet}44` }}><FiShield size={16} /></span>
                                                                    <select className="form-select form-select-lg border-start-0" value={taskForm.requirement} onChange={(e) => {
                                                                        const reqId = e.target.value;
                                                                        setTaskForm({ ...taskForm, requirement: reqId });
                                                                        if (reqId) {
                                                                            const req = selectedModule.projectId?.requirements?.find(r => r._id === reqId);
                                                                            setSelectedRequirementFiles(req?.attachments?.map(a => ({ fileName: a.fileName, fileUrl: a.fileUrl })) || []);
                                                                        } else { setSelectedRequirementFiles([]); }
                                                                    }} style={{ background: `${EMP_THEME.midnightPlum}88`, color: '#fff', border: `1px solid ${EMP_THEME.softViolet}44`, borderRadius: '0 10px 10px 0' }}>
                                                                        <option value="">-- General Task --</option>
                                                                        {selectedModule.projectId?.requirements?.map(req => <option key={req._id} value={req._id}>{req.title}</option>)}
                                                                    </select>
                                                                </div>
                                                                <small className="text-muted mt-1 d-block">Choosing a requirement will automatically forward its files to the assigned employees.</small>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <label className="form-label" style={{ color: EMP_THEME.softViolet, fontWeight: '500' }}>Due Date *</label>
                                                                <input type="date" className="form-control form-control-lg" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} required style={{ background: `${EMP_THEME.midnightPlum}88`, color: '#fff', border: `1px solid ${EMP_THEME.softViolet}44`, borderRadius: '10px' }} />
                                                            </div>
                                                            <div className="col-12">
                                                                <label className="form-label" style={{ color: EMP_THEME.softViolet, fontWeight: '500' }}>Description</label>
                                                                <textarea className="form-control" rows="3" value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Detailed breakdown..." style={{ background: `${EMP_THEME.midnightPlum}88`, color: '#fff', border: `1px solid ${EMP_THEME.softViolet}44`, borderRadius: '10px' }} />
                                                            </div>

                                                            {/* Multiple Employee Choice Fix */}
                                                            <div className="col-12">
                                                                <label className="form-label d-flex justify-content-between" style={{ color: EMP_THEME.softViolet, fontWeight: '500' }}>
                                                                    Assign Team Members ({taskForm.assignedTo.length})
                                                                    <span className="small text-primary" style={{ cursor: 'pointer' }} onClick={() => setTaskForm(prev => ({ ...prev, assignedTo: [] }))}>Clear All</span>
                                                                </label>

                                                                <div className="input-group mb-2">
                                                                    <span className="input-group-text border-end-0" style={{ background: `${EMP_THEME.midnightPlum}88`, color: EMP_THEME.softViolet, border: `1px solid ${EMP_THEME.softViolet}22` }}><FiSearch /></span>
                                                                    <input type="text" className="form-control border-start-0" placeholder="Search employees..." value={empSearch} onChange={e => setEmpSearch(e.target.value)} style={{ background: `${EMP_THEME.midnightPlum}88`, color: '#fff', border: `1px solid ${EMP_THEME.softViolet}22` }} />
                                                                </div>

                                                                <div className="p-3 rounded-3" style={{ background: `${EMP_THEME.midnightPlum}44`, border: `1px solid ${EMP_THEME.softViolet}22`, maxHeight: '200px', overflowY: 'auto' }}>
                                                                    <div className="row g-2">
                                                                        {filteredEmployees.map(emp => {
                                                                            const isSelected = taskForm.assignedTo.includes(emp._id);
                                                                            return (
                                                                                <div key={emp._id} className="col-md-6 col-lg-4">
                                                                                    <div
                                                                                        onClick={() => toggleEmployeeSelection(emp._id)}
                                                                                        className="d-flex align-items-center p-2 rounded-3 cursor-pointer"
                                                                                        style={{
                                                                                            background: isSelected ? `${EMP_THEME.royalPurple}33` : 'transparent',
                                                                                            border: `1px solid ${isSelected ? EMP_THEME.royalPurple : EMP_THEME.softViolet + '11'}`,
                                                                                            transition: 'all 0.2s',
                                                                                            gap: '10px'
                                                                                        }}
                                                                                    >
                                                                                        <div className="position-relative">
                                                                                            <div className="avatar d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px', borderRadius: '8px', background: isSelected ? EMP_THEME.royalPurple : '#444', color: '#fff', fontSize: '10px' }}>
                                                                                                {emp.firstName[0]}
                                                                                            </div>
                                                                                            {isSelected && (
                                                                                                <div className="position-absolute top-0 end-0 translate-middle-y translate-middle-x bg-success rounded-circle border border-dark" style={{ width: '10px', height: '10px' }}></div>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="flex-grow-1 overflow-hidden">
                                                                                            <div className="text-truncate" style={{ color: isSelected ? EMP_THEME.lilacMist : EMP_THEME.softViolet, fontWeight: '600', fontSize: '0.8rem' }}>{emp.firstName} {emp.lastName}</div>
                                                                                            <div className="text-truncate small opacity-75" style={{ fontSize: '0.7rem', color: EMP_THEME.softViolet }}>{emp.position}</div>
                                                                                        </div>
                                                                                        {isSelected && <FiCheckCircle style={{ color: EMP_THEME.royalPurple }} />}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                        {filteredEmployees.length === 0 && <div className="text-center text-muted small py-3">No employees found</div>}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="col-12 mt-2">
                                                                <label className="form-label" style={{ color: EMP_THEME.softViolet, fontSize: '0.85rem' }}>Additional Attachments</label>
                                                                <div className="d-flex align-items-center gap-3 p-3 rounded-3 mb-3" style={{ background: `${EMP_THEME.midnightPlum}88`, border: `1px dashed ${EMP_THEME.softViolet}44` }}>
                                                                    <div className="position-relative">
                                                                        <input type="file" multiple className="position-absolute w-100 h-100 opacity-0 cursor-pointer" onChange={e => setTaskFiles(Array.from(e.target.files))} />
                                                                        <button type="button" className="btn btn-sm btn-outline-light"><FiUpload className="me-2" /> Upload New</button>
                                                                    </div>
                                                                    <span style={{ color: EMP_THEME.softViolet, fontSize: '0.85rem' }}>{taskFiles.length} files selected</span>
                                                                </div>
                                                                {taskForm.requirement && selectedRequirementFiles.length > 0 && (
                                                                    <div>
                                                                        <small className="d-block mb-2" style={{ color: EMP_THEME.softViolet, opacity: 0.7 }}>Auto-Forwarded Assets</small>
                                                                        <div className="d-flex flex-wrap gap-2 p-2 rounded-3" style={{ background: `${EMP_THEME.midnightPlum}44`, border: `1px solid ${EMP_THEME.softViolet}22` }}>
                                                                            {selectedRequirementFiles.map((file, fIdx) => (
                                                                                <div key={fIdx} className="badge bg-primary text-white p-2 d-flex align-items-center shadow-sm"><FiPaperclip className="me-1" /> {file.fileName}</div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="col-12 mt-4 d-flex gap-2">
                                                                <button type="submit" className="btn btn-primary px-4 py-2" disabled={submitting}> {submitting ? 'Creating...' : 'Create Task & Forward'}</button>
                                                                <button type="button" className="btn btn-outline-secondary px-4 py-2" onClick={() => setShowTaskForm(false)}>Cancel</button>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        )}

                                        {/* Board Tasks Column */}
                                        <div className="row g-3">
                                            {tasks.length === 0 ? (
                                                <div className="text-center py-5">
                                                    <FiCheckSquare size={48} style={{ color: EMP_THEME.softViolet, opacity: 0.3 }} />
                                                    <p className="mt-3" style={{ color: EMP_THEME.softViolet }}>No tasks assigned yet</p>
                                                </div>
                                            ) : (
                                                tasks.map((task) => (
                                                    <div key={task._id} className="col-12">
                                                        <div
                                                            className="card h-100 border-0 shadow-sm"
                                                            onClick={() => setViewingTask(task)}
                                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                                            style={{
                                                                background: '#fff',
                                                                borderRadius: '24px',
                                                                transition: 'all 0.3s ease',
                                                                cursor: 'pointer',
                                                                boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
                                                            }}
                                                        >
                                                            <div className="card-body p-4">
                                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                                    <div className="d-flex align-items-center">
                                                                        <div className="p-2.5 rounded-3 me-3" style={{ background: `${getStatusColor(task.status)}15`, color: getStatusColor(task.status) }}>
                                                                            <FiCheckSquare size={20} />
                                                                        </div>
                                                                        <h6 className="mb-0" style={{ color: EMP_THEME.midnightPlum, fontWeight: '700', fontSize: '1.1rem' }}>{task.title}</h6>
                                                                    </div>
                                                                    <button
                                                                        className="btn btn-link p-0 text-muted"
                                                                        onClick={(e) => { e.stopPropagation(); handleDeleteTask(task._id); }}
                                                                        style={{ transition: 'all 0.2s', opacity: 0.6 }}
                                                                        onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.opacity = 1; }}
                                                                        onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.opacity = 0.6; }}
                                                                    >
                                                                        <FiXCircle size={22} />
                                                                    </button>
                                                                </div>
                                                                <p className="mb-3" style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>{task.description}</p>

                                                                <div className="d-flex flex-wrap gap-2 mb-4">
                                                                    <span
                                                                        className="badge rounded-pill px-3 py-1.5"
                                                                        style={{
                                                                            background: `${getStatusColor(task.status)}15`,
                                                                            color: getStatusColor(task.status),
                                                                            fontSize: '0.75rem',
                                                                            fontWeight: '600'
                                                                        }}
                                                                    >
                                                                        {task.status}
                                                                    </span>
                                                                    <span
                                                                        className="badge rounded-pill px-3 py-1.5"
                                                                        style={{
                                                                            background: `${getPriorityColor(task.priority)}15`,
                                                                            color: getPriorityColor(task.priority),
                                                                            fontSize: '0.75rem',
                                                                            fontWeight: '600'
                                                                        }}
                                                                    >
                                                                        {task.priority || 'Medium'}
                                                                    </span>
                                                                </div>

                                                                <div className="d-flex justify-content-between align-items-center pt-3 mt-auto" style={{ borderTop: '1px solid #f1f5f9' }}>
                                                                    <div className="d-flex align-items-center">
                                                                        <div className="avatar-group d-flex">
                                                                            {task.assignedTo?.slice(0, 3).map((member, idx) => (
                                                                                <div
                                                                                    key={idx}
                                                                                    className="avatar-sm rounded-circle d-flex align-items-center justify-content-center"
                                                                                    style={{
                                                                                        width: '28px',
                                                                                        height: '28px',
                                                                                        fontSize: '0.7rem',
                                                                                        background: idx === 0 ? EMP_THEME.royalPurple : (idx === 1 ? EMP_THEME.midnightPlum : '#64748b'),
                                                                                        color: '#fff',
                                                                                        border: '2px solid #fff',
                                                                                        marginLeft: idx > 0 ? '-10px' : '0',
                                                                                        fontWeight: '700'
                                                                                    }}
                                                                                >
                                                                                    {typeof member === 'object' ? member.firstName?.[0] : 'U'}
                                                                                </div>
                                                                            ))}
                                                                            {task.assignedTo?.length > 3 && (
                                                                                <div className="avatar-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontSize: '0.7rem', background: '#f1f5f9', color: '#64748b', border: '2px solid #fff', marginLeft: '-10px', fontWeight: '700' }}>
                                                                                    +{task.assignedTo.length - 3}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <small className="ms-3" style={{ color: '#94a3b8', fontWeight: '500' }}>View Members & Files</small>
                                                                    </div>
                                                                    <div className="d-flex align-items-center" style={{ color: '#94a3b8' }}>
                                                                        <FiClock size={14} className="me-1.5" />
                                                                        <small style={{ fontWeight: '600', fontSize: '0.8rem' }}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Date'}</small>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="requirements-view">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <div>
                                                <h6 className="mb-1" style={{ color: EMP_THEME.lilacMist, fontWeight: '600' }}>Project Requirements & Source Documentation</h6>
                                                <p className="small text-muted mb-0">Manage requirements and documents for this project.</p>
                                            </div>
                                            <button
                                                className="btn btn-outline-primary shadow-sm"
                                                style={{ borderRadius: '12px', fontSize: '0.85rem' }}
                                                onClick={() => setShowReqForm(!showReqForm)}
                                            >
                                                {showReqForm ? <><FiX className="me-1" />Cancel</> : <><FiPlus className="me-1" />New Requirement</>}
                                            </button>
                                        </div>

                                        {/* Add Requirement Form */}
                                        {showReqForm && (
                                            <div className="card mb-4 overflow-hidden" style={{ background: `${EMP_THEME.deepPlum}cc`, border: `1px solid ${EMP_THEME.royalPurple}44`, borderRadius: '16px' }}>
                                                <div className="card-header py-3" style={{ background: `${EMP_THEME.royalPurple}22`, borderBottom: `1px solid ${EMP_THEME.royalPurple}33` }}>
                                                    <h6 className="mb-0" style={{ color: EMP_THEME.lilacMist, fontWeight: '600' }}><FiPlusCircle className="me-2" />Add New Project Requirement</h6>
                                                </div>
                                                <div className="card-body p-4">
                                                    <form onSubmit={handleAddRequirement}>
                                                        <div className="row g-4">
                                                            <div className="col-md-12">
                                                                <label className="form-label" style={{ color: EMP_THEME.softViolet }}>Requirement Title *</label>
                                                                <input type="text" className="form-control" value={reqForm.title} onChange={e => setReqForm({ ...reqForm, title: e.target.value })} required placeholder="e.g., API Documentation, Figma Link, User Stories..." style={{ background: `${EMP_THEME.midnightPlum}88`, color: '#fff', border: `1px solid ${EMP_THEME.softViolet}44` }} />
                                                            </div>
                                                            <div className="col-md-6">
                                                                <label className="form-label" style={{ color: EMP_THEME.softViolet }}>Type</label>
                                                                <select className="form-select" value={reqForm.requirementType} onChange={e => setReqForm({ ...reqForm, requirementType: e.target.value })} style={{ background: `${EMP_THEME.midnightPlum}88`, color: '#fff', border: `1px solid ${EMP_THEME.softViolet}44` }}>
                                                                    <option value="Functional">Functional</option>
                                                                    <option value="Technical">Technical</option>
                                                                    <option value="Non-Functional">Non-Functional</option>
                                                                </select>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <label className="form-label" style={{ color: EMP_THEME.softViolet }}>Priority</label>
                                                                <select className="form-select" value={reqForm.priority} onChange={e => setReqForm({ ...reqForm, priority: e.target.value })} style={{ background: `${EMP_THEME.midnightPlum}88`, color: '#fff', border: `1px solid ${EMP_THEME.softViolet}44` }}>
                                                                    <option value="Low">Low</option>
                                                                    <option value="Medium">Medium</option>
                                                                    <option value="High">High</option>
                                                                    <option value="Critical">Critical</option>
                                                                </select>
                                                            </div>
                                                            <div className="col-12">
                                                                <label className="form-label" style={{ color: EMP_THEME.softViolet }}>Description</label>
                                                                <textarea className="form-control" rows="3" value={reqForm.description} onChange={e => setReqForm({ ...reqForm, description: e.target.value })} placeholder="Details about this requirement..." style={{ background: `${EMP_THEME.midnightPlum}88`, color: '#fff', border: `1px solid ${EMP_THEME.softViolet}44` }} />
                                                            </div>
                                                            <div className="col-12">
                                                                <label className="form-label" style={{ color: EMP_THEME.softViolet }}>Files & Documents</label>
                                                                <div className="p-3 rounded-3" style={{ background: `${EMP_THEME.midnightPlum}88`, border: `1px dashed ${EMP_THEME.softViolet}44` }}>
                                                                    <input type="file" multiple onChange={e => setReqFiles(Array.from(e.target.files))} className="form-control form-control-sm bg-transparent border-0 text-white" />
                                                                    <small className="text-muted">Upload project spec, screenshots, or manuals.</small>
                                                                </div>
                                                            </div>
                                                            <div className="col-12 d-flex gap-2">
                                                                <button type="submit" className="btn btn-primary px-4" disabled={submitting}>{submitting ? 'Saving...' : 'Add Requirement'}</button>
                                                                <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setShowReqForm(false)}>Cancel</button>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        )}

                                        {/* Project Global Files */}
                                        {selectedModule.projectId?.files && selectedModule.projectId.files.length > 0 && (
                                            <div className="mb-4">
                                                <div className="p-4 rounded-4 shadow-sm mb-3" style={{ background: 'rgba(255,255,255,0.03)', border: `1px dashed ${EMP_THEME.softViolet}44` }}>
                                                    <div className="d-flex align-items-center mb-3">
                                                        <div className="p-2 rounded-3 me-3" style={{ background: `${EMP_THEME.royalPurple}33`, color: EMP_THEME.lilacMist }}>
                                                            <FiShield size={18} />
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-0" style={{ color: EMP_THEME.lilacMist, fontWeight: '700' }}>Global Project Documents</h6>
                                                            <small style={{ color: EMP_THEME.softViolet, opacity: 0.8 }}>Referenced documents from Project Admin/Manager</small>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex flex-wrap gap-2">
                                                        {selectedModule.projectId.files.map((file, fidx) => (
                                                            <a key={fidx} href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm d-flex align-items-center py-2 px-3" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${EMP_THEME.softViolet}22`, color: EMP_THEME.lilacMist, borderRadius: '10px' }}>
                                                                <FiPaperclip className="me-2" /> {file.fileName}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Module Specific Files */}
                                        {selectedModule.files && selectedModule.files.length > 0 && (
                                            <div className="mb-4">
                                                <div className="p-4 rounded-4 shadow-sm mb-3" style={{ background: `linear-gradient(45deg, ${EMP_THEME.midnightPlum}, ${EMP_THEME.deepPlum})`, border: `1px solid ${EMP_THEME.royalPurple}33` }}>
                                                    <div className="d-flex align-items-center mb-3">
                                                        <div className="p-2 rounded-3 me-3" style={{ background: `${EMP_THEME.royalPurple}22`, color: EMP_THEME.royalPurple }}>
                                                            <FiUpload size={18} />
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-0" style={{ color: EMP_THEME.lilacMist, fontWeight: '700' }}>Module Specific Documents</h6>
                                                            <small style={{ color: EMP_THEME.softViolet, opacity: 0.8 }}>Files uploaded by Manager/Admin for this module</small>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex flex-wrap gap-2">
                                                        {selectedModule.files.map((file, fidx) => (
                                                            <a key={fidx} href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm d-flex align-items-center py-2 px-3" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${EMP_THEME.softViolet}22`, color: EMP_THEME.lilacMist, borderRadius: '10px' }}>
                                                                <FiPaperclip className="me-2" /> {file.fileName}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedModule.projectId?.requirements && selectedModule.projectId.requirements.length > 0 ? (
                                            <div className="row g-3">
                                                {selectedModule.projectId.requirements.map((req, ridx) => (
                                                    <div key={ridx} className="col-12">
                                                        <div className="p-4 rounded-4 shadow-sm" style={{ background: `${EMP_THEME.deepPlum}88`, border: `1px solid ${EMP_THEME.softViolet}11` }}>
                                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                                <div>
                                                                    <span className="badge mb-2" style={{ background: `${EMP_THEME.royalPurple}22`, color: EMP_THEME.royalPurple, fontSize: '0.65rem' }}>{req.requirementType}</span>
                                                                    <h6 className="mb-1" style={{ color: EMP_THEME.lilacMist, fontWeight: '700' }}>{req.title}</h6>
                                                                </div>
                                                                <div className="d-flex gap-2 align-items-center">
                                                                    <span className="badge" style={{ background: `${getPriorityColor(req.priority)}22`, color: getPriorityColor(req.priority), border: `1px solid ${getPriorityColor(req.priority)}33` }}>{req.priority || 'Medium'}</span>
                                                                    <button
                                                                        className="btn btn-sm btn-outline-danger border-0 p-1 d-flex align-items-center justify-content-center"
                                                                        onClick={(e) => { e.stopPropagation(); handleDeleteRequirement(selectedModule.projectId._id || selectedModule.projectId, req._id); }}
                                                                        title="Delete Requirement"
                                                                        style={{ borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)' }}
                                                                    >
                                                                        <FiTrash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <p style={{ color: EMP_THEME.softViolet, fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.9 }}>{req.description}</p>

                                                            {req.attachments && req.attachments.length > 0 && (
                                                                <div className="pt-3 border-top" style={{ borderColor: `${EMP_THEME.softViolet}11` }}>
                                                                    <small className="d-block mb-3" style={{ color: EMP_THEME.softViolet, fontWeight: '600', textTransform: 'uppercase', fontSize: '0.65rem' }}>Source Assets & Documents</small>
                                                                    <div className="d-flex flex-wrap gap-2">
                                                                        {req.attachments.map((file, fidx) => (
                                                                            <a key={fidx} href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm d-flex align-items-center py-2 px-3 hover-scale" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${EMP_THEME.softViolet}22`, color: EMP_THEME.lilacMist, borderRadius: '10px' }}>
                                                                                <FiPaperclip className="me-2" /> {file.fileName}
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-5 rounded-4" style={{ background: 'rgba(255,255,255,0.02)', border: `1px dashed ${EMP_THEME.softViolet}22` }}>
                                                <FiShield size={40} className="mb-3" style={{ color: EMP_THEME.softViolet, opacity: 0.3 }} />
                                                <p style={{ color: EMP_THEME.softViolet }}>No requirements defined for this project yet.</p>
                                                <button onClick={() => setShowReqForm(true)} className="btn btn-sm btn-link text-primary">Add an initial requirement</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Viewing Task Details Modal */}
            {viewingTask && (
                <div className="modal show d-block" style={{ background: 'rgba(5, 5, 20, 0.8)', backdropFilter: 'blur(8px)', zIndex: 10001 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ background: EMP_THEME.midnightPlum, border: `1px solid ${EMP_THEME.softViolet}44`, borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
                            <div className="modal-header border-0 pb-0">
                                <h6 className="modal-title" style={{ color: EMP_THEME.lilacMist, fontWeight: '700' }}>Task Details & Attachments</h6>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setViewingTask(null)} />
                            </div>
                            <div className="modal-body p-4">
                                <div className="mb-4">
                                    <h5 className="mb-1" style={{ color: '#fff' }}>{viewingTask.title}</h5>
                                    <p className="text-muted small mb-0">{viewingTask.description}</p>
                                </div>

                                <small className="d-block mb-3" style={{ color: EMP_THEME.softViolet, textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '1px' }}>Assigned Team ({viewingTask.assignedTo?.length || 0})</small>
                                <div className="d-flex flex-column gap-2 mb-4">
                                    {viewingTask.assignedTo?.map((member, idx) => (
                                        <div key={member._id || idx} className="d-flex align-items-center p-3 rounded-3" style={{ background: `${EMP_THEME.deepPlum}88`, border: `1px solid ${EMP_THEME.softViolet}11` }}>
                                            <div className="avatar me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', borderRadius: '12px', background: `linear-gradient(45deg, ${EMP_THEME.royalPurple}, ${EMP_THEME.vibrantViolet})`, color: '#fff', fontWeight: '700' }}>
                                                {typeof member === 'object' ? (member.firstName?.[0] || 'U') : 'U'}
                                            </div>
                                            <div className="flex-grow-1">
                                                <div style={{ color: EMP_THEME.lilacMist, fontWeight: '600' }}>{typeof member === 'object' ? `${member.firstName} ${member.lastName}` : 'Member'}</div>
                                                <small style={{ color: EMP_THEME.softViolet, opacity: 0.8 }}>{typeof member === 'object' ? member.position : 'ID: ' + member}</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {viewingTask.attachments && viewingTask.attachments.length > 0 ? (
                                    <>
                                        <small className="d-block mb-3" style={{ color: EMP_THEME.softViolet, textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '1px' }}>Available Documentation ({viewingTask.attachments.length})</small>
                                        <div className="d-flex flex-column gap-2">
                                            {viewingTask.attachments.map((file, idx) => (
                                                <a
                                                    key={idx}
                                                    href={file.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="d-flex align-items-center p-3 rounded-3 text-decoration-none shadow-sm"
                                                    style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${EMP_THEME.softViolet}11`, transition: 'all 0.2s' }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = EMP_THEME.royalPurple; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = `${EMP_THEME.softViolet}11`; }}
                                                >
                                                    <div className="p-2 rounded-2 me-3" style={{ background: `${EMP_THEME.royalPurple}22`, color: EMP_THEME.royalPurple }}>
                                                        <FiPaperclip size={18} />
                                                    </div>
                                                    <div className="flex-grow-1 overflow-hidden">
                                                        <div className="text-truncate" style={{ color: EMP_THEME.lilacMist, fontWeight: '500' }}>{file.fileName}</div>
                                                        <small style={{ color: EMP_THEME.softViolet, fontSize: '0.7rem' }}>{file.uploadedAt ? new Date(file.uploadedAt).toLocaleString() : 'Shared Resource'}</small>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-3 text-center rounded-3 bg-dark border border-secondary border-dashed mt-2">
                                        <small className="text-muted italic">No attachments for this task.</small>
                                    </div>
                                )}

                                <div className="mt-4 pt-3 border-top border-secondary opacity-50 text-center">
                                    <button onClick={() => setViewingTask(null)} className="btn btn-sm btn-outline-secondary px-4 rounded-pill">Close Details</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
