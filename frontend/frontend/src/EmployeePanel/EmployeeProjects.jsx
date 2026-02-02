import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getMyProjects, updateProjectProgress } from "../services/projectService";
import { FiCalendar, FiUsers, FiTrendingUp, FiFileText, FiDownload, FiSettings, FiCheckCircle } from "react-icons/fi";
import ProjectManagementModal from "./ProjectManagementModal";
import { EMP_THEME } from "./theme";

export default function EmployeeProjects() {
    const [loading, setLoading] = useState(true);
    const [managedProjects, setManagedProjects] = useState([]);
    const [assignedProjects, setAssignedProjects] = useState([]);
    const BASE_URL = 'http://localhost:5000';

    const resolveUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const cleanPath = path.replace(/\\/g, '/');
        const normalizedPath = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath;
        return `${BASE_URL}/${normalizedPath}`;
    };

    // State for viewing/updating assigned projects (Team Member View)
    const [selectedProject, setSelectedProject] = useState(null);
    const [updateForm, setUpdateForm] = useState({
        status: "",
        progress: 0,
        comment: ""
    });
    const [updating, setUpdating] = useState(false);

    // State for managing projects (Manager/TL View)
    const [managingProject, setManagingProject] = useState(null);

    const [currentEmployeeId, setCurrentEmployeeId] = useState(null);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const response = await getMyProjects();
            const allProjects = response.data.projects || [];
            setCurrentEmployeeId(response.data.currentEmployeeId);

            const managed = allProjects.filter(p => p.userRole === "Manager" || p.userRole === "Team Lead");
            const assigned = allProjects.filter(p => p.userRole !== "Manager" && p.userRole !== "Team Lead");

            setManagedProjects(managed);
            setAssignedProjects(assigned);
        } catch (error) {
            console.error("Error loading projects:", error);
            toast.error("Failed to load projects");
        } finally {
            setLoading(false);
        }
    };

    const handleProjectUpdate = (updatedProject) => {
        // Update local state when a project is modified in the modal
        setManagedProjects(prev => prev.map(p => p._id === updatedProject._id ? { ...updatedProject, userRole: p.userRole } : p));
        setManagingProject(updatedProject); // Update the modal data too
    };

    // --- Team Member View Functions ---

    const openProjectDetails = (project) => {
        setSelectedProject(project);
        setUpdateForm({
            status: project.status,
            progress: project.progress,
            comment: ""
        });
    };

    const handleUpdateProgress = async () => {
        if (!selectedProject) return;

        try {
            setUpdating(true);
            await updateProjectProgress(selectedProject._id, updateForm);
            toast.success("Project updated successfully!");
            loadProjects(); // Reload to get fresh data
            setSelectedProject(null);
        } catch (error) {
            console.error("Update error:", error);
            toast.error(error.response?.data?.message || "Failed to update project");
        } finally {
            setUpdating(false);
        }
    };

    // --- Render Helpers ---

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case "Active": return "bg-success";
            case "Planning": return "bg-primary";
            case "On Hold": return "bg-warning";
            case "Completed": return "bg-secondary";
            case "Cancelled": return "bg-danger";
            default: return "bg-secondary";
        }
    };

    const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const ProjectCard = ({ project, showManageButton }) => (
        <div className="col-md-6 col-lg-4">
            <div
                className="card h-100 shadow-sm border-0"
                style={{ borderRadius: "16px", transition: "transform 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <span className={`badge px-3 py-2 rounded-pill`} style={project.userRole === 'Team Member' ? { backgroundColor: '#e9ecef', color: '#6c757d' } : { backgroundColor: `${EMP_THEME.royalAmethyst}1a`, color: EMP_THEME.royalAmethyst }}>
                            {project.userRole}
                        </span>
                        <span className={`badge ${getStatusBadgeColor(project.status)} rounded-pill`}>
                            {project.status}
                        </span>
                    </div>

                    <h5 className="card-title fw-bold mb-1" style={{ color: EMP_THEME.midnightPlum }}>{project.projectName}</h5>
                    <p className="small mb-3" style={{ color: EMP_THEME.softViolet }}>{project.department}</p>

                    <div className="d-flex align-items-center gap-2 mb-3">
                        <div className="progress flex-grow-1" style={{ height: "6px" }}>
                            <div className="progress-bar" style={{ width: `${project.progress}%`, backgroundColor: EMP_THEME.royalAmethyst }}></div>
                        </div>
                        <span className="small fw-bold" style={{ color: EMP_THEME.midnightPlum }}>{project.progress}%</span>
                    </div>

                    <div className="d-flex justify-content-between small mb-3" style={{ color: EMP_THEME.softViolet }}>
                        <span><FiCalendar className="me-1" /> {formatDate(project.deadline)}</span>
                        <span><FiUsers className="me-1" /> {project.teamMembers.length} Members</span>
                    </div>

                    {showManageButton ? (
                        <button
                            className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                            style={{ borderColor: EMP_THEME.royalAmethyst, color: EMP_THEME.royalAmethyst }}
                            onClick={() => setManagingProject(project)}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = EMP_THEME.royalAmethyst; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = EMP_THEME.royalAmethyst; }}
                        >
                            <FiSettings size={16} /> Manage Project
                        </button>
                    ) : (
                        <button
                            className="btn w-100"
                            style={{ borderColor: EMP_THEME.softViolet, color: EMP_THEME.softViolet }}
                            onClick={() => openProjectDetails(project)}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = EMP_THEME.softViolet; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = EMP_THEME.softViolet; }}
                        >
                            View Details
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border" role="status" style={{ color: EMP_THEME.royalAmethyst }}></div>
                <p className="mt-3 text-muted">Loading projects...</p>
            </div>
        );
    }

    // Filter modules for current employee in Team Member View
    const myModules = selectedProject && currentEmployeeId && selectedProject.modules
        ? selectedProject.modules.filter(m => {
            const assignedId = m.assignedTo?._id || m.assignedTo;
            return assignedId === currentEmployeeId;
        })
        : [];

    return (
        <div className="container-fluid p-4">
            <h2 className="mb-4 fw-bold" style={{ color: EMP_THEME.midnightPlum }}>My Projects</h2>

            {managedProjects.length > 0 && (
                <div className="mb-5">
                    <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: EMP_THEME.royalAmethyst }}>
                        <FiSettings /> Managed Projects
                    </h5>
                    <div className="row g-4">
                        {managedProjects.map(project => (
                            <ProjectCard key={project._id} project={project} showManageButton={true} />
                        ))}
                    </div>
                </div>
            )}

            {assignedProjects.length > 0 && (
                <div className="mb-5">
                    <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: EMP_THEME.softViolet }}>
                        <FiCheckCircle /> Assigned Projects
                    </h5>
                    <div className="row g-4">
                        {assignedProjects.map(project => (
                            <ProjectCard key={project._id} project={project} showManageButton={false} />
                        ))}
                    </div>
                </div>
            )}

            {managedProjects.length === 0 && assignedProjects.length === 0 && (
                <div className="text-center py-5 text-muted">
                    <h4>No projects found</h4>
                    <p>You have not been assigned to any projects yet.</p>
                </div>
            )}

            {/* Manager Modal */}
            {managingProject && (
                <ProjectManagementModal
                    project={managingProject}
                    onClose={() => setManagingProject(null)}
                    onUpdate={handleProjectUpdate}
                />
            )}

            {/* Team Member Details Modal (Read-only + Update Progress) */}
            {selectedProject && (
                <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
                            <div className="modal-header border-bottom-0">
                                <h5 className="modal-title fw-bold">{selectedProject.projectName}</h5>
                                <button type="button" className="btn-close" onClick={() => setSelectedProject(null)}></button>
                            </div>
                            <div className="modal-body px-4 pb-4">
                                <div className="row g-3 mb-4">
                                    <div className="col-md-6">
                                        <label className="text-muted small">Department</label>
                                        <div className="fw-semibold">{selectedProject.department}</div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="text-muted small">Deadline</label>
                                        <div className="fw-semibold">{formatDate(selectedProject.deadline)}</div>
                                    </div>
                                    <div className="col-12">
                                        <label className="text-muted small">Description</label>
                                        <p className="mb-0 small">{selectedProject.description || "No description provided."}</p>
                                    </div>
                                </div>

                                {/* My Assigned Modules Section */}
                                {myModules.length > 0 && (
                                    <div className="mb-4">
                                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: EMP_THEME.royalAmethyst }}>
                                            <FiCheckCircle /> My Assigned Modules
                                        </h6>
                                        <div className="d-flex flex-column gap-2">
                                            {myModules.map((module, idx) => (
                                                <div key={idx} className="card shadow-sm" style={{ background: '#f8f4fc', borderColor: `${EMP_THEME.royalAmethyst}40` }}>
                                                    <div className="card-body p-3">
                                                        <div className="d-flex justify-content-between align-items-start">
                                                            <div>
                                                                <h6 className="fw-bold mb-1" style={{ color: EMP_THEME.midnightPlum }}>{module.moduleName}</h6>
                                                                <p className="small text-muted mb-2">{module.description}</p>

                                                                {/* Files Download Section */}
                                                                {module.files && module.files.length > 0 && (
                                                                    <div className="d-flex flex-wrap gap-2 mb-2">
                                                                        {module.files.map((file, i) => (
                                                                            <a
                                                                                key={i}
                                                                                href={resolveUrl(file.fileUrl)}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="badge text-decoration-none d-flex align-items-center gap-1"
                                                                                style={{ backgroundColor: 'white', color: EMP_THEME.royalAmethyst, border: `1px solid ${EMP_THEME.royalAmethyst}` }}
                                                                                download
                                                                            >
                                                                                <FiDownload size={12} /> {file.fileName}
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {module.dueDate && (
                                                                    <div className="small text-danger fw-semibold">
                                                                        Due: {new Date(module.dueDate).toLocaleDateString()}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className={`badge ${getStatusBadgeColor(module.status)}`}>
                                                                {module.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="card bg-light border-0 mb-4">
                                    <div className="card-body">
                                        <h6 className="fw-bold mb-3">Update Progress</h6>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label small">Status</label>
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={updateForm.status}
                                                    onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                                                >
                                                    <option value="Planning">Planning</option>
                                                    <option value="Active">Active</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="On Hold">On Hold</option>
                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small">Progress (%)</label>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    min="0" max="100"
                                                    value={updateForm.progress}
                                                    onChange={(e) => setUpdateForm({ ...updateForm, progress: parseInt(e.target.value) })}
                                                />
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label small">Comment</label>
                                                <textarea
                                                    className="form-control form-control-sm"
                                                    rows="2"
                                                    value={updateForm.comment}
                                                    onChange={(e) => setUpdateForm({ ...updateForm, comment: e.target.value })}
                                                    placeholder="Briefly describe your progress..."
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-end">
                                    <button
                                        className="btn px-4"
                                        style={{ backgroundColor: EMP_THEME.royalAmethyst, color: 'white', border: 'none' }}
                                        onClick={handleUpdateProgress}
                                        disabled={updating}
                                    >
                                        {updating ? "Updating..." : "Update Progress"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
