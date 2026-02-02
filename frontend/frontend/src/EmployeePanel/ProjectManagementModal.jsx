import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { addModule, updateModule } from "../services/projectService";
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiUser, FiCalendar, FiClock, FiCheckCircle, FiFileText } from "react-icons/fi";
import { EMP_THEME } from "./theme";

const modalOverlayStyle = {
    position: "fixed",
    inset: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.8)",
    zIndex: 10000,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px"
};

const modalContentStyle = {
    background: "#fff",
    borderRadius: "0",
    width: "100%",
    maxWidth: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "none"
};

// [Modified content for ProjectManagementModal.jsx]
const ProjectManagementModal = ({ project, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState("modules");
    const [modules, setModules] = useState(project.modules || []);
    const [isEditingModule, setIsEditingModule] = useState(false);
    const [currentModuleIndex, setCurrentModuleIndex] = useState(null);
    const [moduleForm, setModuleForm] = useState({
        moduleName: "",
        description: "",
        assignedTo: "",
        status: "Pending",
        dueDate: "",
        moduleUrl: "",
        files: [] // Add files state
    });
    const [saving, setSaving] = useState(false);
    const [filterMember, setFilterMember] = useState("");
    const BASE_URL = 'http://localhost:5000';

    const resolveUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const cleanPath = path.replace(/\\/g, '/');
        const normalizedPath = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath;
        return `${BASE_URL}/${normalizedPath}`;
    };

    const filteredModules = filterMember
        ? modules.filter(m => (m.assignedTo?._id || m.assignedTo) === filterMember)
        : modules;

    useEffect(() => {
        setModules(project.modules || []);
    }, [project]);

    const resetForm = () => {
        setModuleForm({
            moduleName: "",
            description: "",
            assignedTo: "",
            status: "Pending",
            dueDate: "",
            moduleUrl: "",
            files: []
        });
        setIsEditingModule(false);
        setCurrentModuleIndex(null);
    };

    const handleEditModule = (module, index) => {
        setModuleForm({
            moduleName: module.moduleName,
            description: module.description || "",
            assignedTo: module.assignedTo?._id || module.assignedTo || "",
            status: module.status || "Pending",
            moduleUrl: module.moduleUrl || "",
            dueDate: module.dueDate ? new Date(module.dueDate).toISOString().split('T')[0] : "",
            files: [] // Reset files for edit, usually you can't re-upload strictly through edit in this simple flow, or we add appending logic
        });
        setCurrentModuleIndex(index);
        setIsEditingModule(true);
        setActiveTab('modules'); // Switch to modules tab if triggered from elsewhere
    };

    // Quick assign from Team Member list
    const openAddModuleForMember = (memberId) => {
        resetForm();
        setModuleForm(prev => ({ ...prev, assignedTo: memberId }));
        setActiveTab('modules');
    };

    const handleSaveModule = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Prepare Data
            let dataToSend = moduleForm;
            let isFormData = false;

            // Use FormData if saving new module with files
            // For editing, we might handle files separately or via updateModule if supported,
            // but for now let's focus on Creation with files as per requirement.

            if (!isEditingModule && moduleForm.files.length > 0) {
                const formData = new FormData();
                formData.append('moduleName', moduleForm.moduleName);
                formData.append('description', moduleForm.description);
                formData.append('assignedTo', moduleForm.assignedTo);
                formData.append('status', moduleForm.status);
                formData.append('dueDate', moduleForm.dueDate);
                formData.append('moduleUrl', moduleForm.moduleUrl);

                Array.from(moduleForm.files).forEach((file) => {
                    formData.append('files', file);
                });

                dataToSend = formData;
                isFormData = true;
            }

            let updatedProject;
            if (isEditingModule && currentModuleIndex !== null) {
                // Update existing module (Note: File upload on edit not implemented in this simple flow yet, usually done via separate endpoint or complex logic)
                const moduleId = modules[currentModuleIndex]._id;
                const response = await updateModule(project._id, moduleId, moduleForm); // Send JSON for simple update
                updatedProject = response.data.project;
                toast.success("Module updated successfully");
            } else {
                // Add new module
                const response = await addModule(project._id, dataToSend);
                updatedProject = response.data.project;
                toast.success("Module assigned successfully");
            }

            setModules(updatedProject.modules);
            if (onUpdate) onUpdate(updatedProject);
            resetForm();
        } catch (error) {
            console.error("Save module error:", error);
            toast.error("Failed to save module");
        } finally {
            setSaving(false);
        }
    };

    const getMemberName = (id) => {
        const member = project.teamMembers.find(m => m._id === id);
        if (!member) return "Unassigned";
        return `${member.firstName || 'Unknown'} ${member.lastName || ''}`.trim();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Completed": return "success";
            case "In Progress": return "primary";
            case "On Hold": return "warning";
            default: return "secondary";
        }
    };

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle} className="animate__animated animate__fadeInUp">
                {/* Header */}
                <div className="p-4 border-bottom d-flex justify-content-between align-items-center" style={{ backgroundColor: `${EMP_THEME.lilacMist}40` }}>
                    <div>
                        <h4 className="m-0 fw-bold" style={{ color: EMP_THEME.midnightPlum }}>{project.projectName}</h4>
                        <span className="small" style={{ color: EMP_THEME.softViolet }}>Project Management Console</span>
                    </div>
                    <button className="btn btn-close" onClick={onClose}></button>
                </div>

                <div className="d-flex flex-grow-1 overflow-hidden">
                    {/* Sidebar / Tabs */}
                    <div className="border-end" style={{ width: "200px", padding: "20px", backgroundColor: `${EMP_THEME.lilacMist}20` }}>
                        <div className="d-grid gap-2">
                            <button
                                className={`btn text-start`}
                                style={activeTab === 'modules' ? { backgroundColor: EMP_THEME.royalAmethyst, color: 'white' } : { color: EMP_THEME.softViolet, borderColor: EMP_THEME.softViolet }}
                                onClick={() => setActiveTab('modules')}
                            >
                                <FiCheckCircle className="me-2" /> Modules
                            </button>
                            <button
                                className={`btn text-start`}
                                style={activeTab === 'team' ? { backgroundColor: EMP_THEME.royalAmethyst, color: 'white' } : { color: EMP_THEME.softViolet, borderColor: EMP_THEME.softViolet }}
                                onClick={() => setActiveTab('team')}
                            >
                                <FiUser className="me-2" /> Team
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-grow-1 p-4 overflow-auto">
                        {activeTab === 'modules' && (
                            <div className="row g-4 d-flex">
                                {/* Module List */}
                                <div className="col-lg-7">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="fw-bold m-0" style={{ color: EMP_THEME.midnightPlum }}>Project Modules</h5>
                                        <div className="d-flex gap-2 align-items-center">
                                            <span className="badge rounded-pill" style={{ backgroundColor: EMP_THEME.royalAmethyst }}>{filteredModules.length} modules</span>
                                            <select
                                                className="form-select form-select-sm"
                                                style={{ width: "150px", borderColor: EMP_THEME.softViolet, color: EMP_THEME.midnightPlum }}
                                                value={filterMember}
                                                onChange={(e) => setFilterMember(e.target.value)}
                                            >
                                                <option value="">All Members</option>
                                                {project.teamMembers.map((member, mIdx) => (
                                                    <option key={member._id || mIdx} value={member._id}>
                                                        {member.firstName || 'Unknown'} {member.lastName || ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="d-flex flex-column gap-3" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                        {filteredModules.length === 0 && (
                                            <div className="text-center p-5 border rounded text-muted" style={{ backgroundColor: `${EMP_THEME.lilacMist}20` }}>
                                                {filterMember ? "No modules assigned to this member." : "No modules created yet. Add one to get started!"}
                                            </div>
                                        )}
                                        {filteredModules.map((module, idx) => (
                                            <div key={idx} className="card border shadow-sm">
                                                <div className="card-body p-3">
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div>
                                                            <h6 className="fw-bold mb-1" style={{ color: EMP_THEME.midnightPlum }}>{module.moduleName}</h6>
                                                            <div className="d-flex gap-2 mb-2">
                                                                <span className="badge" style={{
                                                                    backgroundColor: module.status === "Completed" ? '#10B981' :
                                                                        module.status === "In Progress" ? EMP_THEME.royalAmethyst :
                                                                            module.status === "On Hold" ? '#F59E0B' : '#6B7280'
                                                                }}>
                                                                    {module.status}
                                                                </span>
                                                                {module.dueDate && (
                                                                    <span className="badge bg-light text-dark border">
                                                                        <FiCalendar className="me-1" />
                                                                        {new Date(module.dueDate).toLocaleDateString()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="small text-muted mb-2 line-clamp-2">
                                                                {module.description || "No description"}
                                                            </p>
                                                            {/* Files Indicator */}
                                                            {module.files && module.files.length > 0 && (
                                                                <div className="d-flex gap-2 mb-2">
                                                                    {module.files.map((f, i) => (
                                                                        <a
                                                                            key={i}
                                                                            href={resolveUrl(f.fileUrl)}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="badge border text-decoration-none shadow-sm"
                                                                            style={{ backgroundColor: 'white', color: EMP_THEME.royalAmethyst, borderColor: EMP_THEME.royalAmethyst }}
                                                                            download
                                                                        >
                                                                            <FiFileText className="me-1" /> {f.fileName}
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {module.moduleUrl && (
                                                                <div className="mb-2">
                                                                    <a href={module.moduleUrl} target="_blank" rel="noopener noreferrer" className="text-decoration-none small" style={{ color: EMP_THEME.royalAmethyst }}>
                                                                        <FiFileText className="me-1" /> External Link: {module.moduleUrl}
                                                                    </a>
                                                                </div>
                                                            )}

                                                            <div className="d-flex align-items-center gap-2 small" style={{ color: EMP_THEME.softViolet }}>
                                                                <FiUser /> Assigned to:
                                                                <span className="fw-semibold" style={{ color: EMP_THEME.midnightPlum }}>
                                                                    {module.assignedTo ? (module.assignedTo.firstName ? `${module.assignedTo.firstName} ${module.assignedTo.lastName}` : getMemberName(module.assignedTo)) : "Unassigned"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            className="btn btn-sm"
                                                            style={{ color: EMP_THEME.royalAmethyst, borderColor: EMP_THEME.royalAmethyst }}
                                                            onClick={() => handleEditModule(module, idx)}
                                                        >
                                                            <FiEdit2 />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Add/Edit Form */}
                                <div className="col-lg-5">
                                    <div className="card border-0 shadow-sm" style={{ backgroundColor: `${EMP_THEME.lilacMist}20` }}>
                                        <div className="card-body">
                                            <h5 className="fw-bold mb-3" style={{ color: EMP_THEME.midnightPlum }}>
                                                {isEditingModule ? "Edit Module" : "Assign New Module"}
                                            </h5>
                                            <form onSubmit={handleSaveModule}>
                                                <div className="mb-3">
                                                    <label className="form-label small fw-bold" style={{ color: EMP_THEME.softViolet }}>Module Name</label>
                                                    <input
                                                        className="form-control"
                                                        value={moduleForm.moduleName}
                                                        onChange={(e) => setModuleForm({ ...moduleForm, moduleName: e.target.value })}
                                                        required
                                                        placeholder="e.g. Frontend Implementation"
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label small fw-bold" style={{ color: EMP_THEME.softViolet }}>Description</label>
                                                    <textarea
                                                        className="form-control"
                                                        rows="3"
                                                        value={moduleForm.description}
                                                        onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                                                        placeholder="Describe the tasks..."
                                                    ></textarea>
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label small fw-bold" style={{ color: EMP_THEME.softViolet }}>Assign To</label>
                                                    <select
                                                        className="form-select"
                                                        value={moduleForm.assignedTo}
                                                        onChange={(e) => setModuleForm({ ...moduleForm, assignedTo: e.target.value })}
                                                    >
                                                        <option value="">Unassigned</option>
                                                        {project.teamMembers.map((member, mIdx) => (
                                                            <option key={member._id || mIdx} value={member._id}>
                                                                {member.firstName || 'Unknown'} {member.lastName || ''} ({member.position || 'Member'})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Module URL Input */}
                                                <div className="mb-3">
                                                    <label className="form-label small fw-bold" style={{ color: EMP_THEME.softViolet }}>Project URL / Link</label>
                                                    <input
                                                        type="url"
                                                        className="form-control"
                                                        value={moduleForm.moduleUrl}
                                                        onChange={(e) => setModuleForm({ ...moduleForm, moduleUrl: e.target.value })}
                                                        placeholder="https://example.com/project-link"
                                                    />
                                                </div>

                                                {/* File Upload Input */}
                                                {!isEditingModule && (
                                                    <div className="mb-3">
                                                        <label className="form-label small fw-bold" style={{ color: EMP_THEME.softViolet }}>Attach Files</label>
                                                        <input
                                                            type="file"
                                                            className="form-control"
                                                            multiple
                                                            onChange={(e) => setModuleForm({ ...moduleForm, files: e.target.files })}
                                                        />
                                                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                            Allowed: Images, Documents, Zip (Max 10MB)
                                                        </small>
                                                    </div>
                                                )}

                                                <div className="row g-2 mb-3">
                                                    <div className="col-6">
                                                        <label className="form-label small fw-bold" style={{ color: EMP_THEME.softViolet }}>Status</label>
                                                        <select
                                                            className="form-select"
                                                            value={moduleForm.status}
                                                            onChange={(e) => setModuleForm({ ...moduleForm, status: e.target.value })}
                                                        >
                                                            <option value="Pending">Pending</option>
                                                            <option value="In Progress">In Progress</option>
                                                            <option value="Completed">Completed</option>
                                                            <option value="On Hold">On Hold</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-6">
                                                        <label className="form-label small fw-bold" style={{ color: EMP_THEME.softViolet }}>Due Date</label>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            value={moduleForm.dueDate}
                                                            onChange={(e) => setModuleForm({ ...moduleForm, dueDate: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="d-flex gap-2">
                                                    {isEditingModule && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-light flex-grow-1"
                                                            onClick={resetForm}
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                    <button
                                                        type="submit"
                                                        className="btn flex-grow-1"
                                                        style={{ backgroundColor: EMP_THEME.royalAmethyst, color: 'white' }}
                                                        disabled={saving}
                                                    >
                                                        {saving ? "Saving..." : (isEditingModule ? "Update Module" : "Assign Module")}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'team' && (
                            <div>
                                <h5 className="fw-bold mb-3" style={{ color: EMP_THEME.midnightPlum }}>Project Team</h5>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="card h-100 shadow-sm" style={{ background: `${EMP_THEME.royalAmethyst}10`, borderColor: `${EMP_THEME.royalAmethyst}30` }}>
                                            <div className="card-body d-flex align-items-center gap-3">
                                                {project.manager?.profileImage && (
                                                    <img src={project.manager.profileImage} className="rounded-circle" width="50" height="50" alt="" />
                                                )}
                                                <div>
                                                    <span className="badge mb-1" style={{ backgroundColor: EMP_THEME.royalAmethyst }}>Manager</span>
                                                    <h6 className="m-0 fw-bold" style={{ color: EMP_THEME.midnightPlum }}>
                                                        {project.manager ? `${project.manager.firstName || 'Unknown'} ${project.manager.lastName || ''}`.trim() : 'Not Assigned'}
                                                    </h6>
                                                    <p className="m-0 small" style={{ color: EMP_THEME.softViolet }}>{project.manager?.email || 'No email'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="card h-100 shadow-sm" style={{ background: `${EMP_THEME.lilacMist}20`, borderColor: `${EMP_THEME.softViolet}30` }}>
                                            <div className="card-body d-flex align-items-center gap-3">
                                                {project.teamLead?.profileImage && (
                                                    <img src={project.teamLead.profileImage} className="rounded-circle" width="50" height="50" alt="" />
                                                )}
                                                <div>
                                                    <span className="badge mb-1" style={{ backgroundColor: EMP_THEME.softViolet }}>Team Lead</span>
                                                    <h6 className="m-0 fw-bold" style={{ color: EMP_THEME.midnightPlum }}>
                                                        {project.teamLead ? `${project.teamLead.firstName || 'Unknown'} ${project.teamLead.lastName || ''}`.trim() : 'Not Assigned'}
                                                    </h6>
                                                    <p className="m-0 small" style={{ color: EMP_THEME.softViolet }}>{project.teamLead?.email || 'No email'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-12 mt-4">
                                        <h6 className="text-uppercase small fw-bold border-bottom pb-2" style={{ color: EMP_THEME.softViolet, borderColor: EMP_THEME.softViolet }}>Team Members</h6>
                                        <div className="row g-3 mt-1">
                                            {project.teamMembers.map((member, mIdx) => (
                                                <div key={member._id || mIdx} className="col-md-4">
                                                    <div className="d-flex flex-column gap-3 p-3 border rounded shadow-sm h-100" style={{ backgroundColor: 'white', borderColor: `${EMP_THEME.softViolet}40` }}>
                                                        <div className="d-flex align-items-center gap-3">
                                                            {member.profileImage ? (
                                                                <img src={member.profileImage} className="rounded-circle" width="40" height="40" alt="" />
                                                            ) : (
                                                                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, backgroundColor: `${EMP_THEME.lilacMist}40` }}>
                                                                    <span className="fw-bold" style={{ color: EMP_THEME.royalAmethyst }}>{member.firstName ? member.firstName.charAt(0) : '?'}</span>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <h6 className="m-0 fw-semibold" style={{ color: EMP_THEME.midnightPlum }}>{member.firstName || 'Unknown'} {member.lastName || ''}</h6>
                                                                <p className="m-0 small" style={{ color: EMP_THEME.softViolet }}>{member.position || "Member"}</p>
                                                            </div>
                                                        </div>

                                                        <hr className="my-1" style={{ borderColor: `${EMP_THEME.softViolet}40` }} />
                                                        <div className="mt-auto">
                                                            <button
                                                                className="btn btn-sm w-100"
                                                                style={{ color: EMP_THEME.royalAmethyst, borderColor: EMP_THEME.royalAmethyst }}
                                                                onClick={() => openAddModuleForMember(member._id)}
                                                            >
                                                                <FiPlus /> Assign Module
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectManagementModal;
