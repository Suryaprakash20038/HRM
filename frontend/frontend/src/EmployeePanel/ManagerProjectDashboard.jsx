import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiAlertCircle, FiBox, FiCalendar, FiCheckCircle, FiChevronRight, FiClock, FiCpu, FiDownload, FiEdit3, FiFileText, FiPaperclip, FiPlus, FiPlusCircle, FiSettings, FiShield, FiTarget, FiTrash2, FiUpload, FiUser, FiUsers } from "react-icons/fi";
import { addRequirement, deleteRequirement } from "../services/projectService";
import { getMyManagedProjects, getEmployeesByDepartment, assignTeamLeadToModule, addModule, deleteModule } from "../services/projectService"; // Assuming these are also from projectService

import { EMP_THEME } from "./theme";
import { useAuth } from "../context/AuthContext";

export default function ManagerProjectDashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [teamLeads, setTeamLeads] = useState([]);
    const [assigningTL, setAssigningTL] = useState(false);
    const [showAddModule, setShowAddModule] = useState(false);
    const [showAddRequirement, setShowAddRequirement] = useState(false);
    const [activeTab, setActiveTab] = useState('modules'); // 'modules' or 'requirements'
    const [newModule, setNewModule] = useState({
        moduleName: '',
        description: '',
        startDate: '',
        dueDate: '',
        priority: 'Medium'
    });
    const [requirementFiles, setRequirementFiles] = useState([]);
    const [selectedExistingFiles, setSelectedExistingFiles] = useState([]);
    const [newRequirement, setNewRequirement] = useState({
        title: '',
        description: '',
        requirementType: 'Functional',
        priority: 'Medium'
    });

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const response = await getMyManagedProjects();
            setProjects(response.data.projects || []);
        } catch (error) {
            console.error("Error loading projects:", error);
            toast.error("Failed to load projects");
        } finally {
            setLoading(false);
        }
    };

    const handleProjectClick = async (project) => {
        setSelectedProject(project);

        // Load team leads from the project's department
        if (project.department) {
            try {
                const response = await getEmployeesByDepartment(project.department);
                const tls = response.data.employees.filter(emp =>
                    emp.position && (emp.position.toLowerCase().includes('lead') || emp.position.toLowerCase().includes('tl'))
                );
                setTeamLeads(tls);
            } catch (error) {
                console.error("Error loading team leads:", error);
            }
        }
    };

    const handleAssignTL = async (moduleId, teamLeadId) => {
        if (!selectedProject || !teamLeadId) return;

        try {
            setAssigningTL(true);
            await assignTeamLeadToModule(selectedProject._id, moduleId, teamLeadId);
            toast.success("Team Lead assigned successfully!");
            loadProjects();

            // Update selected project
            const updatedProjects = projects.map(p =>
                p._id === selectedProject._id
                    ? { ...p, modules: p.modules.map(m => m._id === moduleId ? { ...m, teamLead: teamLeadId } : m) }
                    : p
            );
            const updated = updatedProjects.find(p => p._id === selectedProject._id);
            setSelectedProject(updated);

        } catch (error) {
            console.error("Error assigning TL:", error);
            toast.error("Failed to assign Team Lead");
        } finally {
            setAssigningTL(false);
        }
    };

    const handleAddModule = async (e) => {
        e.preventDefault();
        if (!selectedProject) return;

        try {
            const formData = new FormData();
            formData.append('moduleName', newModule.moduleName);
            formData.append('description', newModule.description);
            formData.append('startDate', newModule.startDate);
            formData.append('dueDate', newModule.dueDate);
            formData.append('priority', newModule.priority);

            await addModule(selectedProject._id, formData);
            toast.success("Module added successfully!");

            // Reset form
            setNewModule({
                moduleName: '',
                description: '',
                startDate: '',
                dueDate: '',
                priority: 'Medium'
            });
            setShowAddModule(false);

            // Reload projects
            await loadProjects();

            // Update selected project
            const response = await getMyManagedProjects();
            const updated = response.data.projects.find(p => p._id === selectedProject._id);
            setSelectedProject(updated);

        } catch (error) {
            console.error("Error adding module:", error);
            toast.error("Failed to add module");
        }
    };

    const handleDeleteModule = async (moduleId) => {
        if (!window.confirm("Are you sure you want to delete this module and all its tasks?")) return;

        try {
            await deleteModule(selectedProject._id, moduleId);
            toast.success("Module deleted successfully");

            // Reload projects
            await loadProjects();

            // Update selected project view
            const response = await getMyManagedProjects();
            const updated = response.data.projects.find(p => p._id === selectedProject._id);
            setSelectedProject(updated);

        } catch (error) {
            console.error("Error deleting module:", error);
            toast.error("Failed to delete module");
        }
    };

    const handleAddRequirement = async (e) => {
        e.preventDefault();
        if (!selectedProject) return;

        try {
            const formData = new FormData();
            formData.append('title', newRequirement.title);
            formData.append('description', newRequirement.description);
            formData.append('requirementType', newRequirement.requirementType);
            formData.append('priority', newRequirement.priority);

            requirementFiles.forEach(file => {
                formData.append('files', file);
            });

            // Add selected existing files
            if (selectedExistingFiles.length > 0) {
                formData.append('existingAttachments', JSON.stringify(selectedExistingFiles));
            }

            await addRequirement(selectedProject._id, formData);
            toast.success("Requirement added successfully!");

            // Reset form
            setNewRequirement({
                title: '',
                description: '',
                requirementType: 'Functional',
                priority: 'Medium'
            });
            setRequirementFiles([]);
            setSelectedExistingFiles([]);
            setShowAddRequirement(false);

            // Reload projects
            await loadProjects();

            // Update selected project
            const response = await getMyManagedProjects();
            const updated = response.data.projects.find(p => p._id === selectedProject._id);
            setSelectedProject(updated);

        } catch (error) {
            console.error("Error adding requirement:", error);
            toast.error("Failed to add requirement");
        }
    };

    const handleDeleteRequirement = async (reqId) => {
        if (!window.confirm("Delete this requirement?")) return;
        try {
            await deleteRequirement(selectedProject._id, reqId);
            toast.success("Requirement removed");

            const response = await getMyManagedProjects();
            const updated = response.data.projects.find(p => p._id === selectedProject._id);
            setSelectedProject(updated);
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const toggleExistingFile = (file) => {
        const isSelected = selectedExistingFiles.some(f => f.fileUrl === file.fileUrl);
        if (isSelected) {
            setSelectedExistingFiles(selectedExistingFiles.filter(f => f.fileUrl !== file.fileUrl));
        } else {
            setSelectedExistingFiles([...selectedExistingFiles, { fileName: file.fileName, fileUrl: file.fileUrl }]);
        }
    };


    const getStatusColor = (status) => {
        const colors = {
            'Planning': '#6366f1',
            'Active': '#10b981',
            'On Hold': '#f59e0b',
            'Completed': '#8b5cf6',
            'Cancelled': '#ef4444'
        };
        return colors[status] || '#64748b';
    };

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
                        <FiTarget className="me-2" />
                        My Managed Projects
                    </h2>
                    <p style={{ color: EMP_THEME.softViolet }}>Assign Team Leads to project modules</p>
                </div>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-5">
                    <FiAlertCircle size={48} style={{ color: EMP_THEME.softViolet }} />
                    <p className="mt-3" style={{ color: EMP_THEME.lilacMist }}>No projects assigned yet</p>
                </div>
            ) : (
                <div className="row g-4">
                    {projects.map(project => (
                        <div key={project._id} className="col-md-6 col-lg-4">
                            <div
                                className="card h-100"
                                style={{
                                    background: EMP_THEME.midnightPlum,
                                    border: `1px solid ${EMP_THEME.softViolet}33`,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onClick={() => handleProjectClick(project)}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = EMP_THEME.royalPurple}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = `${EMP_THEME.softViolet}33`}
                            >
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <h5 style={{ color: EMP_THEME.lilacMist, fontWeight: '600' }}>
                                            {project.projectName}
                                        </h5>
                                        <span
                                            className="badge"
                                            style={{
                                                background: getStatusColor(project.status),
                                                color: '#fff'
                                            }}
                                        >
                                            {project.status}
                                        </span>
                                    </div>

                                    <p style={{ color: EMP_THEME.softViolet, fontSize: '0.9rem' }}>
                                        {project.description?.substring(0, 100)}...
                                    </p>

                                    <div className="mt-3">
                                        <div className="d-flex align-items-center mb-2">
                                            <FiCalendar size={16} style={{ color: EMP_THEME.royalPurple }} className="me-2" />
                                            <small style={{ color: EMP_THEME.softViolet }}>
                                                {new Date(project.startDate).toLocaleDateString()} - {new Date(project.deadline).toLocaleDateString()}
                                            </small>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <FiUsers size={16} style={{ color: EMP_THEME.royalPurple }} className="me-2" />
                                            <small style={{ color: EMP_THEME.softViolet }}>
                                                {project.modules?.length || 0} Modules
                                            </small>
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        <div className="progress" style={{ height: '8px', background: `${EMP_THEME.softViolet}22` }}>
                                            <div
                                                className="progress-bar"
                                                style={{
                                                    width: `${project.progress || 0}%`,
                                                    background: EMP_THEME.royalPurple
                                                }}
                                            />
                                        </div>
                                        <small style={{ color: EMP_THEME.softViolet }}>{project.progress || 0}% Complete</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Module Assignment Modal */}
            {selectedProject && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-scrollable">
                        <div className="modal-content" style={{ background: EMP_THEME.midnightPlum, border: `1px solid ${EMP_THEME.softViolet}44`, borderRadius: '20px' }}>
                            <div className="modal-header py-4 px-4" style={{ borderBottom: `1px solid ${EMP_THEME.softViolet}22` }}>
                                <div>
                                    <h5 className="modal-title mb-1" style={{ color: EMP_THEME.lilacMist, fontWeight: '700' }}>
                                        {selectedProject.projectName}
                                    </h5>
                                    <p className="mb-0 small" style={{ color: EMP_THEME.softViolet }}>Manage Project Modules & Requirements</p>
                                </div>
                                <div className="d-flex gap-2">
                                    <div className="btn-group p-1" style={{ background: `${EMP_THEME.deepPlum}88`, borderRadius: '12px', border: `1px solid ${EMP_THEME.softViolet}22` }}>
                                        <button
                                            className="btn btn-sm px-3 border-0"
                                            onClick={() => setActiveTab('modules')}
                                            style={{
                                                background: activeTab === 'modules' ? EMP_THEME.royalPurple : 'transparent',
                                                color: '#fff',
                                                borderRadius: '8px',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            Phases
                                        </button>
                                        <button
                                            className="btn btn-sm px-3 border-0"
                                            onClick={() => setActiveTab('requirements')}
                                            style={{
                                                background: activeTab === 'requirements' ? EMP_THEME.royalPurple : 'transparent',
                                                color: '#fff',
                                                borderRadius: '8px',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            Requirements
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white ms-3"
                                        onClick={() => {
                                            setSelectedProject(null);
                                            setShowAddModule(false);
                                            setShowAddRequirement(false);
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="modal-body p-4">
                                {/* Add Module Form */}
                                {showAddModule && (
                                    <div className="card mb-4 overflow-hidden"
                                        style={{
                                            background: `${EMP_THEME.deepPlum}cc`,
                                            border: `1px solid ${EMP_THEME.royalPurple}44`,
                                            backdropFilter: 'blur(10px)',
                                            borderRadius: '16px'
                                        }}
                                    >
                                        <div className="card-header py-3" style={{ background: `${EMP_THEME.royalPurple}22`, borderBottom: `1px solid ${EMP_THEME.royalPurple}33` }}>
                                            <h6 className="mb-0" style={{ color: EMP_THEME.lilacMist, fontWeight: '600' }}>
                                                <FiPlus className="me-2" />
                                                Create New Module
                                            </h6>
                                        </div>
                                        <div className="card-body p-4">
                                            <form onSubmit={handleAddModule}>
                                                <div className="row g-4">
                                                    <div className="col-md-8">
                                                        <label className="form-label" style={{ color: EMP_THEME.softViolet, fontWeight: '500' }}>Module Name *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-lg"
                                                            value={newModule.moduleName}
                                                            onChange={(e) => setNewModule({ ...newModule, moduleName: e.target.value })}
                                                            required
                                                            placeholder="e.g., Development Phase 1"
                                                            style={{
                                                                background: `${EMP_THEME.midnightPlum}88`,
                                                                color: '#fff',
                                                                border: `1px solid ${EMP_THEME.softViolet}44`,
                                                                borderRadius: '10px'
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="col-md-4">
                                                        <label className="form-label" style={{ color: EMP_THEME.softViolet, fontWeight: '500' }}>Priority</label>
                                                        <select
                                                            className="form-select form-select-lg"
                                                            value={newModule.priority}
                                                            onChange={(e) => setNewModule({ ...newModule, priority: e.target.value })}
                                                            style={{
                                                                background: `${EMP_THEME.midnightPlum}88`,
                                                                color: '#fff',
                                                                border: `1px solid ${EMP_THEME.softViolet}44`,
                                                                borderRadius: '10px'
                                                            }}
                                                        >
                                                            <option value="Low">Low</option>
                                                            <option value="Medium">Medium</option>
                                                            <option value="High">High</option>
                                                            <option value="Critical">Critical</option>
                                                        </select>
                                                    </div>

                                                    <div className="col-12">
                                                        <label className="form-label" style={{ color: EMP_THEME.softViolet, fontWeight: '500' }}>Description</label>
                                                        <textarea
                                                            className="form-control"
                                                            rows="2"
                                                            value={newModule.description}
                                                            onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                                                            placeholder="Describe the scope of this module..."
                                                            style={{
                                                                background: `${EMP_THEME.midnightPlum}88`,
                                                                color: '#fff',
                                                                border: `1px solid ${EMP_THEME.softViolet}44`,
                                                                borderRadius: '10px'
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="col-md-6">
                                                        <label className="form-label" style={{ color: EMP_THEME.softViolet, fontWeight: '500' }}>Start Date *</label>
                                                        <input
                                                            type="date"
                                                            className="form-control form-control-lg"
                                                            value={newModule.startDate}
                                                            onChange={(e) => setNewModule({ ...newModule, startDate: e.target.value })}
                                                            required
                                                            style={{
                                                                background: `${EMP_THEME.midnightPlum}88`,
                                                                color: '#fff',
                                                                border: `1px solid ${EMP_THEME.softViolet}44`,
                                                                borderRadius: '10px'
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="col-md-6">
                                                        <label className="form-label" style={{ color: EMP_THEME.softViolet, fontWeight: '500' }}>Due Date *</label>
                                                        <input
                                                            type="date"
                                                            className="form-control form-control-lg"
                                                            value={newModule.dueDate}
                                                            onChange={(e) => setNewModule({ ...newModule, dueDate: e.target.value })}
                                                            required
                                                            style={{
                                                                background: `${EMP_THEME.midnightPlum}88`,
                                                                color: '#fff',
                                                                border: `1px solid ${EMP_THEME.softViolet}44`,
                                                                borderRadius: '10px'
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="col-12 mt-4">
                                                        <div className="d-flex gap-3">
                                                            <button
                                                                type="submit"
                                                                className="btn btn-lg px-4 flex-grow-1"
                                                                style={{
                                                                    background: `linear-gradient(45deg, ${EMP_THEME.royalPurple}, ${EMP_THEME.vibrantViolet})`,
                                                                    color: '#fff',
                                                                    border: 'none',
                                                                    borderRadius: '10px',
                                                                    fontWeight: '600'
                                                                }}
                                                            >
                                                                Create Module
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-lg px-4"
                                                                onClick={() => setShowAddModule(false)}
                                                                style={{
                                                                    background: 'transparent',
                                                                    color: EMP_THEME.lilacMist,
                                                                    border: `1px solid ${EMP_THEME.softViolet}66`,
                                                                    borderRadius: '10px'
                                                                }}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'modules' ? (
                                    <div className="module-list">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h6 className="mb-0" style={{ color: EMP_THEME.softViolet, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: 'bold' }}>
                                                Project Phases / Modules
                                            </h6>
                                            {!showAddModule && (
                                                <button
                                                    className="btn btn-sm d-flex align-items-center px-3 py-2"
                                                    style={{
                                                        background: EMP_THEME.royalPurple,
                                                        color: '#fff',
                                                        border: 'none',
                                                        fontWeight: '600',
                                                        borderRadius: '10px',
                                                        boxShadow: `0 4px 12px ${EMP_THEME.royalPurple}44`
                                                    }}
                                                    onClick={() => setShowAddModule(true)}
                                                >
                                                    <FiPlusCircle className="me-2" /> New Phase
                                                </button>
                                            )}
                                        </div>

                                        {selectedProject.modules && selectedProject.modules.length > 0 ? (
                                            selectedProject.modules.map((module, index) => (
                                                <div
                                                    key={module._id || index}
                                                    className="card mb-3 overflow-hidden"
                                                    style={{
                                                        background: EMP_THEME.midnightPlum,
                                                        border: `1px solid ${EMP_THEME.softViolet}22`,
                                                        borderRadius: '16px'
                                                    }}
                                                >
                                                    <div className="card-body p-4">
                                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                                            <div>
                                                                <h6 className="mb-1" style={{ color: EMP_THEME.lilacMist, fontWeight: '700', fontSize: '1.15rem' }}>{module.moduleName}</h6>
                                                                <div className="d-flex gap-2 align-items-center">
                                                                    <span className="badge" style={{ background: `${EMP_THEME.royalPurple}33`, color: EMP_THEME.lilacMist, border: `1px solid ${EMP_THEME.royalPurple}44`, fontSize: '0.7rem' }}>
                                                                        {module.priority || 'Medium'}
                                                                    </span>
                                                                    <small style={{ color: EMP_THEME.softViolet }}><FiClock size={12} className="me-1" />{new Date(module.dueDate).toLocaleDateString()}</small>
                                                                </div>
                                                            </div>
                                                            <button
                                                                className="btn btn-outline-danger btn-sm border-0 rounded-circle"
                                                                onClick={() => handleDeleteModule(module._id)}
                                                                style={{ background: 'rgba(239, 68, 68, 0.1)', width: '32px', height: '32px', padding: 0 }}
                                                            >
                                                                <FiTrash2 size={16} />
                                                            </button>
                                                        </div>

                                                        <p className="mb-4" style={{ color: EMP_THEME.softViolet, fontSize: '0.9rem', opacity: 0.9 }}>
                                                            {module.description}
                                                        </p>

                                                        <div className="p-3 rounded-4" style={{ background: `${EMP_THEME.deepPlum}88`, border: `1px solid ${EMP_THEME.softViolet}11` }}>
                                                            <div className="row align-items-center">
                                                                <div className="col-md-7">
                                                                    <label className="form-label mb-2 d-flex align-items-center" style={{ color: EMP_THEME.softViolet, fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                                                        <FiUsers className="me-2" /> Assign Team Lead
                                                                    </label>
                                                                    <select
                                                                        className="form-select"
                                                                        value={module.teamLead?._id || module.teamLead || ''}
                                                                        onChange={(e) => handleAssignTL(module._id, e.target.value)}
                                                                        disabled={assigningTL}
                                                                        style={{
                                                                            background: EMP_THEME.midnightPlum,
                                                                            color: EMP_THEME.lilacMist,
                                                                            border: `1px solid ${EMP_THEME.softViolet}44`,
                                                                            borderRadius: '10px',
                                                                            fontSize: '0.9rem'
                                                                        }}
                                                                    >
                                                                        <option value="">Select Team Lead...</option>
                                                                        {teamLeads.map(tl => (
                                                                            <option key={tl._id} value={tl._id}>
                                                                                {tl.firstName} {tl.lastName} — {tl.position}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                <div className="col-md-5 mt-3 mt-md-0 d-flex justify-content-md-end">
                                                                    {module.teamLead ? (
                                                                        <div className="d-flex align-items-center p-2 rounded-3" style={{ background: `${EMP_THEME.royalPurple}11`, border: `1px solid ${EMP_THEME.royalPurple}22` }}>
                                                                            <div className="avatar me-3" style={{ width: '35px', height: '35px', borderRadius: '10px', background: EMP_THEME.royalPurple, color: '#fff', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontWeight: 'bold' }}>
                                                                                {typeof module.teamLead === 'object' ? module.teamLead.firstName[0] : 'T'}
                                                                            </div>
                                                                            <div>
                                                                                <small className="d-block" style={{ color: EMP_THEME.softViolet, fontSize: '0.65rem', textTransform: 'uppercase' }}>Current Lead</small>
                                                                                <span style={{ color: EMP_THEME.lilacMist, fontWeight: '600', fontSize: '0.85rem' }}>
                                                                                    {typeof module.teamLead === 'object' ? `${module.teamLead.firstName} ${module.teamLead.lastName}` : 'Assigned'}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-warning small d-flex align-items-center" style={{ background: 'rgba(255, 193, 7, 0.1)', padding: '8px 15px', borderRadius: '8px', border: '1px solid rgba(255, 193, 7, 0.2)' }}>
                                                                            <FiAlertCircle className="me-2" /> Awaiting Lead
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-5 border rounded-4" style={{ borderColor: `${EMP_THEME.softViolet}11`, borderStyle: 'dashed', background: `${EMP_THEME.midnightPlum}44` }}>
                                                <FiCpu size={40} className="mb-3" style={{ color: EMP_THEME.softViolet, opacity: 0.3 }} />
                                                <p className="mb-0" style={{ color: EMP_THEME.softViolet }}>No project phases defined yet.</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="requirements-list">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h6 className="mb-0" style={{ color: EMP_THEME.softViolet, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: 'bold' }}>
                                                Project Requirements
                                            </h6>
                                            {!showAddRequirement && (
                                                <button
                                                    className="btn btn-sm d-flex align-items-center px-3 py-2"
                                                    style={{
                                                        background: EMP_THEME.royalPurple,
                                                        color: '#fff',
                                                        border: 'none',
                                                        fontWeight: '600',
                                                        borderRadius: '10px',
                                                        boxShadow: `0 4px 12px ${EMP_THEME.royalPurple}44`
                                                    }}
                                                    onClick={() => setShowAddRequirement(true)}
                                                >
                                                    <FiPlusCircle className="me-2" /> New Requirement
                                                </button>
                                            )}
                                        </div>

                                        {showAddRequirement && (
                                            <div className="card mb-4 overflow-hidden" style={{ background: `${EMP_THEME.deepPlum}88`, border: `1px solid ${EMP_THEME.royalPurple}44`, borderRadius: '16px' }}>
                                                <div className="card-header py-3" style={{ background: `${EMP_THEME.royalPurple}22`, borderBottom: `1px solid ${EMP_THEME.royalPurple}33` }}>
                                                    <h6 className="mb-0" style={{ color: EMP_THEME.lilacMist, fontWeight: '600' }}><FiFileText className="me-2" /> Define Requirement</h6>
                                                </div>
                                                <div className="card-body p-4">
                                                    <form onSubmit={handleAddRequirement}>
                                                        <div className="row g-3">
                                                            <div className="col-md-7">
                                                                <label className="form-label" style={{ color: EMP_THEME.softViolet, fontSize: '0.85rem' }}>Title *</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    required
                                                                    value={newRequirement.title}
                                                                    onChange={e => setNewRequirement({ ...newRequirement, title: e.target.value })}
                                                                    style={{ background: EMP_THEME.midnightPlum, color: '#fff', border: `1px solid ${EMP_THEME.softViolet}44` }}
                                                                />
                                                            </div>
                                                            <div className="col-md-5">
                                                                <label className="form-label" style={{ color: EMP_THEME.softViolet, fontSize: '0.85rem' }}>Type</label>
                                                                <select
                                                                    className="form-select"
                                                                    value={newRequirement.requirementType}
                                                                    onChange={e => setNewRequirement({ ...newRequirement, requirementType: e.target.value })}
                                                                    style={{ background: EMP_THEME.midnightPlum, color: '#fff', border: `1px solid ${EMP_THEME.softViolet}44` }}
                                                                >
                                                                    <option value="Functional">Functional</option>
                                                                    <option value="Non-Functional">Non-Functional</option>
                                                                    <option value="Technical">Technical</option>
                                                                </select>
                                                            </div>
                                                            <div className="col-12">
                                                                <label className="form-label" style={{ color: EMP_THEME.softViolet, fontSize: '0.85rem' }}>Description</label>
                                                                <textarea
                                                                    className="form-control"
                                                                    rows="2"
                                                                    value={newRequirement.description}
                                                                    onChange={e => setNewRequirement({ ...newRequirement, description: e.target.value })}
                                                                    style={{ background: EMP_THEME.midnightPlum, color: '#fff', border: `1px solid ${EMP_THEME.softViolet}44` }}
                                                                />
                                                            </div>
                                                            <div className="col-12">
                                                                <label className="form-label d-flex justify-content-between" style={{ color: EMP_THEME.softViolet, fontSize: '0.85rem' }}>
                                                                    <span>Attachments</span>
                                                                    <span className="text-muted small">Max 5MB per file</span>
                                                                </label>

                                                                {/* New File Upload */}
                                                                <div className="mb-3">
                                                                    <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: EMP_THEME.midnightPlum, border: `1px dashed ${EMP_THEME.softViolet}44` }}>
                                                                        <div className="position-relative">
                                                                            <input
                                                                                type="file"
                                                                                multiple
                                                                                className="position-absolute w-100 h-100 opacity-0 cursor-pointer"
                                                                                onChange={e => setRequirementFiles(Array.from(e.target.files))}
                                                                            />
                                                                            <button type="button" className="btn btn-sm btn-outline-light">
                                                                                <FiUpload className="me-2" /> Upload New
                                                                            </button>
                                                                        </div>
                                                                        <span style={{ color: EMP_THEME.softViolet, fontSize: '0.85rem' }}>
                                                                            {requirementFiles.length > 0 ? `${requirementFiles.length} files selected` : 'Choose from computer'}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {/* Select from Project Documents */}
                                                                {selectedProject.files && selectedProject.files.length > 0 && (
                                                                    <div className="mt-3">
                                                                        <small className="d-block mb-2 px-1" style={{ color: EMP_THEME.softViolet, opacity: 0.7, fontWeight: '600', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                                                                            Pick From Project Documents
                                                                        </small>
                                                                        <div className="d-flex flex-wrap gap-2 p-3 rounded-3" style={{ background: `${EMP_THEME.midnightPlum}88`, border: `1px solid ${EMP_THEME.softViolet}22`, maxHeight: '150px', overflowY: 'auto' }}>
                                                                            {selectedProject.files.map((file, fIdx) => {
                                                                                const isSelected = selectedExistingFiles.some(f => f.fileUrl === file.fileUrl);
                                                                                return (
                                                                                    <div
                                                                                        key={fIdx}
                                                                                        onClick={() => toggleExistingFile(file)}
                                                                                        className="badge py-2 px-3 d-flex align-items-center cursor-pointer"
                                                                                        style={{
                                                                                            background: isSelected ? `${EMP_THEME.royalPurple}44` : 'rgba(255,255,255,0.05)',
                                                                                            border: `1px solid ${isSelected ? EMP_THEME.royalPurple : EMP_THEME.softViolet + '22'}`,
                                                                                            color: isSelected ? '#fff' : EMP_THEME.softViolet,
                                                                                            borderRadius: '8px',
                                                                                            transition: 'all 0.2s',
                                                                                            fontSize: '0.75rem'
                                                                                        }}
                                                                                    >
                                                                                        <FiPaperclip className="me-1" /> {file.fileName}
                                                                                        {isSelected && <FiCheckCircle className="ms-2 text-white" size={12} />}
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="col-12 d-flex gap-2">
                                                                <button type="submit" className="btn btn-primary px-4" style={{ background: EMP_THEME.royalPurple, border: 'none' }}>Save Requirement</button>
                                                                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAddRequirement(false)}>Cancel</button>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        )}

                                        {selectedProject.requirements && selectedProject.requirements.length > 0 ? (
                                            <div className="row g-3">
                                                {selectedProject.requirements.map((req, idx) => (
                                                    <div key={req._id || idx} className="col-12">
                                                        <div className="d-flex align-items-start p-3 rounded-4" style={{ background: EMP_THEME.midnightPlum, border: `1px solid ${EMP_THEME.softViolet}11` }}>
                                                            <div className="p-2 rounded-3 me-3" style={{ background: `${EMP_THEME.royalPurple}22`, color: EMP_THEME.royalPurple }}>
                                                                <FiShield size={20} />
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <div className="d-flex justify-content-between">
                                                                    <h6 className="mb-1" style={{ color: EMP_THEME.lilacMist, fontWeight: '600' }}>{req.title}</h6>
                                                                    <div className="d-flex align-items-center gap-2">
                                                                        <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: EMP_THEME.softViolet, fontSize: '0.65rem' }}>{req.requirementType}</span>
                                                                        <button
                                                                            className="btn btn-sm text-danger p-1"
                                                                            onClick={() => handleDeleteRequirement(req._id)}
                                                                        >
                                                                            <FiTrash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <p className="mb-0 small" style={{ color: EMP_THEME.softViolet, opacity: 0.8 }}>{req.description}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-5 border rounded-4" style={{ borderColor: `${EMP_THEME.softViolet}11`, borderStyle: 'dashed' }}>
                                                <FiFileText size={40} className="mb-3" style={{ color: EMP_THEME.softViolet, opacity: 0.3 }} />
                                                <p className="mb-0" style={{ color: EMP_THEME.softViolet }}>No project requirements defined.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
