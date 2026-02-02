import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBullhorn, FaCalendarAlt, FaExclamationCircle, FaUsers } from 'react-icons/fa';
import announcementService from '../services/announcementService';
import { useAuth } from '../context/AuthContext';
import { EMP_THEME } from './theme';

const EmployeeAnnouncements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                // Get employee's department from user context
                const department = user?.department || user?.employeeProfile?.department || user?.department;

                const data = await announcementService.getEmployeeAnnouncements({ department });
                setAnnouncements(data.announcements || []);
            } catch (error) {
                console.error("Failed to fetch announcements", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, [user]);

    const getPriorityStyles = (priority) => {
        switch (priority) {
            case 'Urgent': return { borderLeft: '5px solid #dc3545', background: '#fff5f5' };
            case 'High': return { borderLeft: '5px solid #fd7e14', background: '#fff9f0' };
            case 'Medium': return { borderLeft: `5px solid ${EMP_THEME.royalAmethyst}`, background: '#f8f4fc' };
            case 'Low': return { borderLeft: '5px solid #198754', background: '#f0fdf4' };
            default: return { borderLeft: '5px solid #6c757d', background: '#f8f9fa' };
        }
    };

    const getBadgeStyle = (priority) => {
        switch (priority) {
            case 'Urgent': return { backgroundColor: '#dc3545', color: 'white' };
            case 'High': return { backgroundColor: '#ffc107', color: 'black' };
            case 'Medium': return { backgroundColor: EMP_THEME.royalAmethyst, color: 'white' };
            case 'Low': return { backgroundColor: '#198754', color: 'white' };
            default: return { backgroundColor: '#6c757d', color: 'white' };
        }
    };

    return (
        <div className="container-fluid p-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
            >
                <h2 className="fw-bold d-flex align-items-center gap-2" style={{ color: EMP_THEME.midnightPlum }}>
                    <FaBullhorn style={{ color: EMP_THEME.royalAmethyst }} /> Announcements
                </h2>
                <p style={{ color: EMP_THEME.softViolet }}>Stay updated with the latest news and updates.</p>
            </motion.div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border" role="status" style={{ color: EMP_THEME.royalAmethyst }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="row g-4">
                    {announcements.length > 0 ? (
                        announcements.map((ann, index) => (
                            <motion.div
                                key={ann._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="col-md-6 col-lg-4"
                            >
                                <div
                                    className="card h-100 border-0 shadow-sm hover-shadow"
                                    style={{
                                        ...getPriorityStyles(ann.priority),
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <h5 className="card-title fw-bold mb-0" style={{ color: EMP_THEME.midnightPlum }}>{ann.title}</h5>
                                            <span className="badge rounded-pill d-flex align-items-center gap-1" style={getBadgeStyle(ann.priority)}>
                                                {ann.priority === 'Urgent' && <FaExclamationCircle />}
                                                {ann.priority}
                                            </span>
                                        </div>

                                        {ann.imageUrl && (
                                            <div className="mb-3 rounded overflow-hidden" style={{ maxHeight: '200px' }}>
                                                <img
                                                    src={ann.imageUrl}
                                                    alt={ann.title}
                                                    className="w-100 object-fit-cover"
                                                    style={{ height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>
                                        )}
                                        <p className="card-text mb-4" style={{ color: EMP_THEME.softViolet }}>
                                            {ann.content}
                                        </p>
                                        <div className="d-flex flex-column gap-2">
                                            <div className="d-flex justify-content-between align-items-center small border-top pt-3" style={{ color: EMP_THEME.softViolet }}>
                                                <span className="d-flex align-items-center gap-1">
                                                    <FaCalendarAlt /> {new Date(ann.createdAt).toLocaleDateString()}
                                                </span>
                                                <span>
                                                    By: {ann.createdBy?.firstName} {ann.createdBy?.lastName}
                                                </span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center small" style={{ color: EMP_THEME.softViolet }}>
                                                <span className="d-flex align-items-center gap-1">
                                                    <FaUsers style={{ color: EMP_THEME.royalAmethyst }} />
                                                    {ann.targetAudience === 'All' ? 'All Employees' : ann.departments?.join(', ')}
                                                </span>
                                                {ann.expiryDate && (
                                                    <span className="text-danger small">
                                                        Expires: {new Date(ann.expiryDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-12 text-center py-5">
                            <div className="text-muted mb-3 opacity-50">
                                <FaBullhorn size={48} />
                            </div>
                            <h4 className="text-muted">No announcements yet</h4>
                            <p className="text-muted small">Check back later for updates.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EmployeeAnnouncements;
