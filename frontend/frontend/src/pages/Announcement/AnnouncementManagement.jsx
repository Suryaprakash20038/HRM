import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaBullhorn, FaPlus, FaEdit, FaTrash, FaEye, FaFilter,
    FaCalendarAlt, FaUsers, FaExclamationCircle, FaClock
} from 'react-icons/fa';
import announcementService from '../../services/announcementService';
import CreateAnnouncementModal from '../../components/Dashboard/CreateAnnouncementModal';
import toast from 'react-hot-toast';

const AnnouncementManagement = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterPriority, setFilterPriority] = useState('');
    const [filterAudience, setFilterAudience] = useState('');
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filterPriority) params.priority = filterPriority;
            if (filterAudience) params.targetAudience = filterAudience;

            const data = await announcementService.getAllAnnouncements(params);
            setAnnouncements(data.announcements);
        } catch (error) {
            console.error("Failed to fetch announcements", error);
            toast.error('Failed to load announcements');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, [filterPriority, filterAudience]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            try {
                await announcementService.deleteAnnouncement(id);
                toast.success('Announcement deleted successfully');
                fetchAnnouncements();
            } catch (error) {
                console.error('Failed to delete announcement', error);
                toast.error('Failed to delete announcement');
            }
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Urgent': return 'text-red-600 bg-red-100';
            case 'High': return 'text-orange-600 bg-orange-100';
            case 'Medium': return 'text-[#663399] bg-[#f3e8ff]';
            case 'Low': return 'text-[#059669] bg-[#ecfdf5]';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const stats = {
        total: announcements.length,
        urgent: announcements.filter(a => a.priority === 'Urgent').length,
        allEmployees: announcements.filter(a => a.targetAudience === 'All').length,
        departmentSpecific: announcements.filter(a => a.targetAudience === 'Department').length,
    };

    return (
        <div className="announcement-page" style={{ padding: '30px', paddingBottom: 80 }}>
            <style>{`
                .announcement-page {
                    background-color: #ffffff;
                    background-image:
                        radial-gradient(at 0% 0%, rgba(102, 51, 153, 0.05) 0px, transparent 50%),
                        radial-gradient(at 100% 0%, rgba(163, 119, 157, 0.05) 0px, transparent 50%);
                    min-height: 100vh;
                }
            `}</style>

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: '#2E1A47' }}>
                                <FaBullhorn style={{ color: '#663399' }} />
                                Announcement Management
                            </h1>
                            <p style={{ color: '#A3779D' }} className="mt-1 small">Create and manage company-wide communications and announcements</p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="btn btn-lg shadow-lg hover:scale-105 transition flex items-center gap-2"
                            style={{ backgroundColor: '#663399', color: '#ffffff', fontWeight: 600, border: 'none', borderRadius: '12px' }}
                        >
                            <FaPlus /> New Announcement
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="row g-4 mb-6">
                        <div className="col-md-3">
                            <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: '1px solid #E6C7E6', boxShadow: '0 4px 20px -10px rgba(102, 51, 153, 0.1)' }}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="small mb-1 font-bold" style={{ color: '#A3779D' }}>Total</p>
                                        <p className="text-2xl font-bold m-0" style={{ color: '#2E1A47' }}>{stats.total}</p>
                                    </div>
                                    <div className="p-3" style={{ backgroundColor: '#E6C7E6', borderRadius: '12px', color: '#663399' }}>
                                        <FaBullhorn />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: '1px solid #E6C7E6', boxShadow: '0 4px 20px -10px rgba(102, 51, 153, 0.1)' }}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="small mb-1 font-bold" style={{ color: '#A3779D' }}>Urgent</p>
                                        <p className="text-2xl font-bold m-0 text-red-600">{stats.urgent}</p>
                                    </div>
                                    <div className="p-3 bg-red-100 rounded-lg text-red-600">
                                        <FaExclamationCircle />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: '1px solid #E6C7E6', boxShadow: '0 4px 20px -10px rgba(102, 51, 153, 0.1)' }}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="small mb-1 font-bold" style={{ color: '#A3779D' }}>All Employees</p>
                                        <p className="text-2xl font-bold m-0 text-green-600">{stats.allEmployees}</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-lg text-green-600">
                                        <FaUsers />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: '1px solid #E6C7E6', boxShadow: '0 4px 20px -10px rgba(102, 51, 153, 0.1)' }}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="small mb-1 font-bold" style={{ color: '#A3779D' }}>Department</p>
                                        <p className="text-2xl font-bold m-0" style={{ color: '#663399' }}>{stats.departmentSpecific}</p>
                                    </div>
                                    <div className="p-3" style={{ backgroundColor: '#E6C7E6', borderRadius: '12px', color: '#663399' }}>
                                        <FaFilter />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm mb-6" style={{ border: '1px solid #E6C7E6' }}>
                        <div className="flex items-center gap-4">
                            <FaFilter style={{ color: '#A3779D' }} />
                            <div className="flex gap-4 flex-1">
                                <select
                                    value={filterPriority}
                                    onChange={(e) => setFilterPriority(e.target.value)}
                                    className="form-select border shadow-sm"
                                    style={{ borderColor: '#E6C7E6', color: '#663399', fontWeight: 600, borderRadius: '12px', width: 'auto' }}
                                >
                                    <option value="">All Priorities</option>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Urgent">Urgent</option>
                                </select>
                                <select
                                    value={filterAudience}
                                    onChange={(e) => setFilterAudience(e.target.value)}
                                    className="form-select border shadow-sm"
                                    style={{ borderColor: '#E6C7E6', color: '#663399', fontWeight: 600, borderRadius: '12px', width: 'auto' }}
                                >
                                    <option value="">All Audiences</option>
                                    <option value="All">All Employees</option>
                                    <option value="Department">Department Specific</option>
                                </select>
                            </div>
                            {(filterPriority || filterAudience) && (
                                <button
                                    onClick={() => {
                                        setFilterPriority('');
                                        setFilterAudience('');
                                    }}
                                    className="btn btn-link text-decoration-none fw-bold"
                                    style={{ color: '#663399' }}
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="spinner-border" role="status" style={{ color: '#663399' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p style={{ color: '#A3779D' }} className="mt-3 fw-bold">Synchronizing Announcements...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {announcements.length > 0 ? (
                            announcements.map((announcement, index) => (
                                <motion.div
                                    key={announcement._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden mb-3"
                                    style={{ border: '1px solid #E6C7E6' }}
                                >
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-bold" style={{ color: '#2E1A47' }}>{announcement.title}</h3>
                                                    <span className={`badge px-3 py-2 rounded-pill shadow-sm`} style={{
                                                        backgroundColor: announcement.priority === 'Urgent' ? '#FEE2E2' :
                                                            announcement.priority === 'High' ? '#FEF3C7' : '#E6C7E6',
                                                        color: announcement.priority === 'Urgent' ? '#DC2626' :
                                                            announcement.priority === 'High' ? '#D97706' : '#663399'
                                                    }}>
                                                        {announcement.priority}
                                                    </span>
                                                </div>
                                                <p style={{ color: '#2E1A47' }} className="mb-4 opacity-75">{announcement.content}</p>

                                                <div className="flex flex-wrap gap-4 text-sm">
                                                    <span className="flex items-center gap-1" style={{ color: '#A3779D' }}>
                                                        <FaCalendarAlt style={{ color: '#663399' }} />
                                                        {new Date(announcement.publishDate).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <FaUsers className="text-[#A3779D]" />
                                                        {announcement.targetAudience === 'All'
                                                            ? 'All Employees'
                                                            : `Departments: ${announcement.departments?.join(', ')}`
                                                        }
                                                    </span>
                                                    {announcement.expiryDate && (
                                                        <span className="flex items-center gap-1 text-orange-500">
                                                            <FaClock />
                                                            Expires: {new Date(announcement.expiryDate).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                    <span className="text-gray-400">
                                                        By: {announcement.createdBy?.firstName} {announcement.createdBy?.lastName}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    onClick={() => setSelectedAnnouncement(announcement)}
                                                    className="p-2 text-[#663399] hover:bg-[#f3e8ff] rounded-lg transition"
                                                    title="View Details"
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(announcement._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-white rounded-xl">
                                <FaBullhorn className="text-gray-300 text-6xl mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-600 mb-2">No Announcements Found</h3>
                                <p className="text-gray-400 mb-6">Create your first announcement to get started</p>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="px-6 py-3 bg-[#663399] text-white rounded-xl font-bold shadow-[0_4px_14px_0_rgba(102,51,153,0.39)] hover:shadow-[0_6px_20px_rgba(102,51,153,0.23)] hover:scale-105 transition inline-flex items-center gap-2"
                                >
                                    <FaPlus /> Create Announcement
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <CreateAnnouncementModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreated={() => {
                    fetchAnnouncements();
                    setIsModalOpen(false);
                }}
            />

            {/* View Details Modal */}
            <AnimatePresence>
                {selectedAnnouncement && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setSelectedAnnouncement(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 bg-white">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedAnnouncement.title}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(selectedAnnouncement.priority)}`}>
                                            {selectedAnnouncement.priority}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setSelectedAnnouncement(null)}
                                        className="text-gray-400 hover:text-gray-600 text-2xl"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-700 mb-6 text-lg">{selectedAnnouncement.content}</p>

                                <div className="space-y-3 bg-gray-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2">
                                        <FaCalendarAlt className="text-[#663399]" />
                                        <span className="text-sm text-gray-600">
                                            Published: {new Date(selectedAnnouncement.publishDate).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FaUsers className="text-[#A3779D]" />
                                        <span className="text-sm text-gray-600">
                                            Target: {selectedAnnouncement.targetAudience === 'All'
                                                ? 'All Employees'
                                                : `Departments: ${selectedAnnouncement.departments?.join(', ')}`
                                            }
                                        </span>
                                    </div>
                                    {selectedAnnouncement.expiryDate && (
                                        <div className="flex items-center gap-2">
                                            <FaClock className="text-orange-500" />
                                            <span className="text-sm text-gray-600">
                                                Expires: {new Date(selectedAnnouncement.expiryDate).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">
                                            Created by: {selectedAnnouncement.createdBy?.firstName} {selectedAnnouncement.createdBy?.lastName}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AnnouncementManagement;
