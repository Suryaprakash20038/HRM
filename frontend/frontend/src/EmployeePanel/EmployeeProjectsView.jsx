import React, { useState, useEffect } from "react";
import { getMyProjects } from "../services/projectService";
import api from "../services/api";
import { FiTarget, FiShield, FiCalendar, FiUsers, FiClock, FiFileText, FiInfo, FiFolder, FiPaperclip, FiDownload, FiEye } from "react-icons/fi";
import { EMP_THEME } from "./theme";

export default function EmployeeProjectsView() {
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const response = await getMyProjects();
            setProjects(response.data.projects || []);
        } catch (error) {
            console.error("Error loading projects:", error);
        } finally {
            setLoading(false);
        }
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
            <div className="row mb-5">
                <div className="col-12">
                    <h2 style={{ color: EMP_THEME.lilacMist, fontWeight: '700' }}>
                        <FiTarget className="me-2" />
                        My Projects
                    </h2>
                    <p style={{ color: EMP_THEME.softViolet }}>View project details and requirements assigned to you</p>
                </div>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-5">
                    <FiInfo size={48} style={{ color: EMP_THEME.softViolet, opacity: 0.5 }} />
                    <p className="mt-3" style={{ color: EMP_THEME.lilacMist }}>You are not assigned to any projects yet.</p>
                </div>
            ) : (
                <div className="row g-4">
                    {projects.map(project => (
                        <div key={project._id} className="col-lg-6">
                            <div className="card h-100" style={{
                                background: EMP_THEME.midnightPlum,
                                border: `1px solid ${EMP_THEME.softViolet}22`,
                                borderRadius: '24px',
                                overflow: 'hidden'
                            }}>
                                <div className="p-4" style={{ background: `linear-gradient(45deg, ${EMP_THEME.royalPurple}22, transparent)` }}>
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <h4 style={{ color: EMP_THEME.lilacMist, fontWeight: '700' }}>{project.projectName}</h4>
                                        <span className="badge" style={{ background: EMP_THEME.royalPurple, color: '#fff' }}>{project.status}</span>
                                    </div>
                                    <p style={{ color: EMP_THEME.softViolet, fontSize: '0.95rem', lineHeight: '1.6' }}>{project.description}</p>

                                    <div className="d-flex gap-4 mt-4">
                                        <div className="d-flex align-items-center">
                                            <FiCalendar className="me-2" style={{ color: EMP_THEME.royalPurple }} />
                                            <span style={{ color: EMP_THEME.softViolet, fontSize: '0.85rem' }}>
                                                {new Date(project.deadline).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <FiUsers className="me-2" style={{ color: EMP_THEME.royalPurple }} />
                                            <span style={{ color: EMP_THEME.softViolet, fontSize: '0.85rem' }}>
                                                {project.teamMembers?.length || 0} Members
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Project Source Documents (Global, Module & Requirement Files) */}
                                <div className="documents-section mb-4">
                                    <h6 className="mb-3 d-flex align-items-center" style={{ color: EMP_THEME.lilacMist, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', opacity: 0.8 }}>
                                        <FiFolder className="me-2" style={{ color: EMP_THEME.gold }} /> Source & Global Documents
                                    </h6>
                                    {(() => {
                                        // Combine project global files, module files, and requirement attachments
                                        const allFiles = [];

                                        // 1. Root Project Files
                                        if (project.files) {
                                            project.files.forEach(f => allFiles.push({ ...f, source: 'Project' }));
                                        }

                                        // 2. Module Files
                                        project.modules?.forEach(mod => {
                                            if (mod.files) {
                                                mod.files.forEach(f => allFiles.push({ ...f, source: `Module: ${mod.moduleName}` }));
                                            }
                                        });

                                        // 3. Requirement Attachments
                                        project.requirements?.forEach(req => {
                                            if (req.attachments) {
                                                req.attachments.forEach(f => allFiles.push({ ...f, source: `Requirement: ${req.title}` }));
                                            }
                                        });

                                        return allFiles.length > 0 ? (
                                            <div className="d-flex flex-wrap gap-2">
                                                {allFiles.map((file, fIdx) => {
                                                    // Helper to handle both Cloudinary and Local File URLs
                                                    const getFileUrl = (url) => {
                                                        if (!url || typeof url !== 'string') return '#';

                                                        // If it's a remote URL (Cloudinary usually), return as is
                                                        if (url.startsWith('http')) return url;

                                                        // If it's a local path (e.g. uploads\doc...), normalize it
                                                        let cleanUrl = url.replace(/\\/g, '/');
                                                        if (!cleanUrl.startsWith('/')) cleanUrl = '/' + cleanUrl;

                                                        // Get Base URL from API config (remove /api suffix)
                                                        const baseUrl = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : 'http://localhost:5000';
                                                        return `${baseUrl}${cleanUrl}`;
                                                    };

                                                    const fileUrl = getFileUrl(file.fileUrl);

                                                    const getDownloadUrl = (url) => {
                                                        if (url.includes('cloudinary.com') && url.includes('/upload/')) {
                                                            return url.replace('/upload/', '/upload/fl_attachment/');
                                                        }
                                                        return url;
                                                    };

                                                    return (
                                                        <div
                                                            key={`${fIdx}-${file.fileUrl}`}
                                                            className="d-flex align-items-center p-2 rounded-4"
                                                            style={{
                                                                background: `${EMP_THEME.midnightPlum}88`,
                                                                border: `1px solid ${EMP_THEME.softViolet}22`,
                                                                minWidth: '220px'
                                                            }}
                                                        >
                                                            <div className="flex-grow-1 d-flex align-items-center ps-2 overflow-hidden">
                                                                <FiPaperclip className="me-2 text-primary" size={16} />
                                                                <div className="overflow-hidden">
                                                                    <div className="fw-bold text-truncate text-white" style={{ fontSize: '0.8rem' }} title={file.fileName}>
                                                                        {file.fileName || 'Document'}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.65rem', color: EMP_THEME.softViolet, opacity: 0.7 }}>
                                                                        {file.source}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="d-flex gap-1 ms-2">
                                                                <a
                                                                    href={fileUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="btn btn-icon-sm p-1"
                                                                    style={{ color: EMP_THEME.lilacMist }}
                                                                    title="View Document"
                                                                >
                                                                    <FiEye size={16} />
                                                                </a>
                                                                <a
                                                                    href={getDownloadUrl(fileUrl)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="btn btn-icon-sm p-1"
                                                                    style={{ color: '#10b981' }}
                                                                    title="Force Download"
                                                                    download={file.fileName}
                                                                >
                                                                    <FiDownload size={16} />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="p-3 rounded-4 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: `1px dashed ${EMP_THEME.softViolet}11` }}>
                                                <small style={{ color: EMP_THEME.softViolet, fontStyle: 'italic', opacity: 0.6 }}>No documentation shared yet.</small>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Project Requirements Section */}
                                <div className="requirements-section">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="mb-0 d-flex align-items-center" style={{ color: EMP_THEME.lilacMist, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>
                                            <FiShield className="me-2" /> Project Requirements
                                        </h6>
                                        {project.requirements && project.requirements.length > 0 && (
                                            <span className="badge rounded-pill" style={{ background: `${EMP_THEME.royalPurple}22`, color: EMP_THEME.lilacMist, fontSize: '0.65rem' }}>
                                                {project.requirements.length} Items
                                            </span>
                                        )}
                                    </div>

                                    {project.requirements && project.requirements.length > 0 ? (
                                        <div className="row g-2">
                                            {project.requirements.map((req, idx) => (
                                                <div key={idx} className="col-12">
                                                    <div className="p-3 rounded-4" style={{
                                                        background: `${EMP_THEME.deepPlum}66`,
                                                        border: `1px solid ${EMP_THEME.softViolet}11`,
                                                        transition: 'border-color 0.3s'
                                                    }}
                                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = `${EMP_THEME.royalPurple}44`}
                                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = `${EMP_THEME.softViolet}11`}
                                                    >
                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                            <h6 className="mb-0" style={{ color: EMP_THEME.lilacMist, fontWeight: '700', fontSize: '0.9rem' }}>{req.title}</h6>
                                                            <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: EMP_THEME.softViolet, fontSize: '0.6rem' }}>{req.requirementType}</span>
                                                        </div>
                                                        <p className="mb-0" style={{ color: EMP_THEME.softViolet, opacity: 0.7, fontSize: '0.8rem' }}>{req.description}</p>

                                                        {req.attachments && req.attachments.length > 0 && (
                                                            <div className="mt-2 d-flex flex-wrap gap-2">
                                                                {req.attachments.map((file, fIdx) => (
                                                                    <a
                                                                        key={fIdx}
                                                                        href={file.fileUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="btn btn-sm py-1 px-2 d-flex align-items-center border-0"
                                                                        style={{
                                                                            background: `${EMP_THEME.royalPurple}22`,
                                                                            color: EMP_THEME.lilacMist,
                                                                            fontSize: '0.7rem',
                                                                            borderRadius: '8px'
                                                                        }}
                                                                    >
                                                                        <FiPaperclip className="me-1" size={12} /> {file.fileName}
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-3 rounded-4" style={{ background: 'rgba(255,255,255,0.02)', border: `1px dashed ${EMP_THEME.softViolet}22` }}>
                                            <p className="mb-0" style={{ color: EMP_THEME.softViolet, fontSize: '0.8rem', fontStyle: 'italic' }}>No requirements defined for this project.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
