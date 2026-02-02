import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaFileAlt, FaDownload, FaEye, FaFilePdf, FaImage, FaCloudDownloadAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import employeeService from '../services/employeeService';
import toast from 'react-hot-toast';
import { EMP_THEME } from './theme';

const EmployeeDocuments = () => {
    const { user } = useAuth();
    const [documents, setDocuments] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const BASE_URL = 'http://localhost:5000';

    const resolveUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        // Handle local paths
        const cleanPath = path.replace(/\\/g, '/');
        // Ensure path doesn't start with / if we are appending
        const normalizedPath = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath;
        return `${BASE_URL}/${normalizedPath}`;
    };

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                let employeeData = null;

                if (user?.employeeProfileId) {
                    employeeData = await employeeService.getEmployeeById(user.employeeProfileId);
                } else if (user?.employeeId) {
                    try {
                        employeeData = await employeeService.getMyProfile();
                    } catch (e) {
                        console.warn("Could not fetch by my-profile, trying other means if available", e);
                    }
                }

                if (employeeData && employeeData.documents) {
                    setDocuments(employeeData.documents);
                }
            } catch (error) {
                console.error("Failed to fetch documents", error);
                toast.error("Could not load documents.");
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDocuments();
        }
    }, [user]);

    const docLabels = {
        tenthMarksheet: "10th Marksheet",
        twelfthMarksheet: "12th Marksheet",
        degreeCertificate: "Degree Certificate",
        consolidatedMarksheet: "Consolidated Marksheet",
        provisionalCertificate: "Provisional Certificate",
        aadharCard: "Aadhar Card",
        panCard: "PAN Card",
        resume: "Resume"
    };

    const getIcon = (url) => {
        if (!url) return <FaFileAlt className="text-secondary" size={40} />;
        if (url.endsWith('.pdf')) return <FaFilePdf className="text-danger" size={40} />;
        if (url.match(/\.(jpg|jpeg|png|gif)$/i)) return <FaImage style={{ color: EMP_THEME.royalAmethyst }} size={40} />;
        return <FaFileAlt className="text-info" size={40} />;
    };

    const handleView = (url) => {
        if (url) {
            setSelectedDocument(url);
        }
    };

    const closePreview = () => setSelectedDocument(null);

    return (
        <div className="container-fluid p-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 d-flex align-items-center justify-content-between"
            >
                <div>
                    <h2 className="fw-bold d-flex align-items-center gap-2" style={{ color: EMP_THEME.midnightPlum }}>
                        <FaFileAlt style={{ color: EMP_THEME.royalAmethyst }} /> My Documents
                    </h2>
                    <p className="text-muted mb-0">Manage and view your uploaded official documents.</p>
                </div>
            </motion.div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border" role="status" style={{ color: EMP_THEME.royalAmethyst }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="row g-4">
                    {Object.entries(docLabels).map(([key, label], index) => {
                        const url = resolveUrl(documents[key]);
                        return (
                            <motion.div
                                key={key}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="col-md-6 col-lg-4 col-xl-3"
                            >
                                <div className="card h-100 border-0 shadow-sm hover-shadow transition-all" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                                    <div className="card-body text-center p-4 d-flex flex-column align-items-center justify-content-center">
                                        <div className="mb-3 p-3 rounded-circle bg-light d-inline-flex">
                                            {getIcon(url)}
                                        </div>
                                        <h5 className="fw-bold mb-1" style={{ color: EMP_THEME.midnightPlum }}>{label}</h5>
                                        <p className="small text-muted mb-4">
                                            {url ? "Document Available" : "Not Uploaded"}
                                        </p>

                                        {url ? (
                                            <div className="d-flex gap-2 w-100 justify-content-center">
                                                <button
                                                    onClick={() => handleView(url)}
                                                    className="btn btn-sm rounded-pill px-4 d-flex align-items-center gap-2"
                                                    style={{ borderColor: EMP_THEME.royalAmethyst, color: EMP_THEME.royalAmethyst }}
                                                >
                                                    <FaEye /> View
                                                </button>
                                                <a
                                                    href={url}
                                                    download
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-sm rounded-pill px-4 d-flex align-items-center gap-2"
                                                    style={{ backgroundColor: EMP_THEME.royalAmethyst, color: 'white', border: 'none' }}
                                                >
                                                    <FaCloudDownloadAlt /> Download
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="badge bg-light text-secondary rounded-pill px-3 py-2 fw-normal">
                                                Pending Upload
                                            </div>
                                        )}
                                    </div>
                                    {url && (
                                        <div className="card-footer border-0 py-2 text-center" style={{ backgroundColor: '#d1e7dd' }}>
                                            <small className="fw-bold d-flex align-items-center justify-content-center gap-1" style={{ color: '#0f5132' }}>
                                                <FaFileAlt size={12} /> Uploaded to Cloud
                                            </small>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Document Preview Modal */}
            {selectedDocument && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered" role="document" style={{ marginLeft: '350px' }}>
                        <div className="modal-content border-0 overflow-hidden" style={{ borderRadius: '16px', height: '90vh' }}>
                            <div className="modal-header border-0 pb-0 justify-content-end bg-white">
                                <button type="button" className="btn-close" onClick={closePreview}></button>
                            </div>
                            <div className="modal-body p-0 h-100 d-flex flex-column">
                                <div className="flex-grow-1 bg-light d-flex align-items-center justify-content-center position-relative p-2">
                                    {selectedDocument.endsWith('.pdf') ? (
                                        <iframe
                                            src={selectedDocument}
                                            title="Document Preview"
                                            className="w-100 h-100 border-0 rounded"
                                        />
                                    ) : (
                                        <img
                                            src={selectedDocument}
                                            alt="Document Preview"
                                            className="img-fluid rounded"
                                            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                        />
                                    )}
                                </div>
                                <div className="p-3 text-center bg-white border-top">
                                    <a
                                        href={selectedDocument}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn rounded-pill px-4"
                                        style={{ backgroundColor: EMP_THEME.royalAmethyst, color: 'white', border: 'none' }}
                                    >
                                        Open in New Tab <FaEye className="ms-2" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeDocuments;
