import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaBullhorn } from 'react-icons/fa';
import announcementService from '../../services/announcementService';
import toast from 'react-hot-toast';

const DEPARTMENTS = [
    'IT', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations',
    'Customer Support', 'Development', 'Design', 'Management'
];

const CreateAnnouncementModal = ({ isOpen, onClose, onCreated }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        priority: 'Medium',
        targetAudience: 'All',
        departments: [],
        expiryDate: '',
        image: null
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate department selection
        if (formData.targetAudience === 'Department' && formData.departments.length === 0) {
            toast.error('Please select at least one department');
            return;
        }

        setLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('content', formData.content);
            formDataToSend.append('priority', formData.priority);
            formDataToSend.append('targetAudience', formData.targetAudience);
            if (formData.expiryDate) {
                formDataToSend.append('expiryDate', formData.expiryDate);
            }
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            // Handle departments
            if (formData.targetAudience === 'Department') {
                formData.departments.forEach(dept => {
                    formDataToSend.append('departments', dept);
                });
            }

            await announcementService.createAnnouncement(formDataToSend);
            toast.success('Announcement created successfully!');
            onCreated();
            onClose();
            setFormData({
                title: '',
                content: '',
                priority: 'Medium',
                targetAudience: 'All',
                departments: [],
                expiryDate: '',
                image: null
            });
        } catch (error) {
            console.error(error);
            toast.error('Failed to create announcement');
        } finally {
            setLoading(false);
        }
    };

    const handleDepartmentToggle = (dept) => {
        setFormData(prev => ({
            ...prev,
            departments: prev.departments.includes(dept)
                ? prev.departments.filter(d => d !== dept)
                : [...prev.departments, dept]
        }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <h3 className="text-lg font-bold text-[#2E1A47] flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-[#f3e8ff]">
                                    <FaBullhorn className="text-[#663399]" />
                                </div>
                                New Announcement
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-[#663399] transition">
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-[#2E1A47] mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#663399] focus:ring-2 focus:ring-[#E6C7E6] outline-none transition"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Office Holiday"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#2E1A47] mb-1">Content</label>
                                <textarea
                                    required
                                    rows="4"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#663399] focus:ring-2 focus:ring-[#E6C7E6] outline-none transition resize-none"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Enter announcement details..."
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-bold text-[#2E1A47] mb-1">Image (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#663399] focus:ring-2 focus:ring-[#E6C7E6] outline-none transition"
                                    onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-[#2E1A47] mb-1">Priority</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#663399] focus:ring-2 focus:ring-[#E6C7E6] outline-none transition"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[#2E1A47] mb-1">Audience</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#663399] focus:ring-2 focus:ring-[#E6C7E6] outline-none transition"
                                        value={formData.targetAudience}
                                        onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value, departments: [] })}
                                    >
                                        <option value="All">All Employees</option>
                                        <option value="Department">Specific Departments</option>
                                    </select>
                                </div>
                            </div>

                            {formData.targetAudience === 'Department' && (
                                <div>
                                    <label className="block text-sm font-bold text-[#2E1A47] mb-2">
                                        Select Departments <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 p-4 bg-[#fdfbff] rounded-xl border border-gray-200 max-h-48 overflow-y-auto">
                                        {DEPARTMENTS.map(dept => (
                                            <label key={dept} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded-lg transition">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.departments.includes(dept)}
                                                    onChange={() => handleDepartmentToggle(dept)}
                                                    className="w-4 h-4 text-[#663399] rounded focus:ring-2 focus:ring-[#E6C7E6]"
                                                />
                                                <span className="text-sm text-gray-700">{dept}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {formData.departments.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {formData.departments.map(dept => (
                                                <span key={dept} className="px-3 py-1 bg-[#f3e8ff] text-[#663399] rounded-full text-xs font-bold flex items-center gap-1 border border-[#E6C7E6]">
                                                    {dept}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDepartmentToggle(dept)}
                                                        className="hover:text-[#2E1A47]"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-[#2E1A47] mb-1">
                                    Expiry Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#663399] focus:ring-2 focus:ring-[#E6C7E6] outline-none transition"
                                    value={formData.expiryDate}
                                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                                <p className="text-xs text-[#A3779D] mt-1 font-medium">Announcement will be hidden after this date</p>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-bold transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 rounded-xl bg-[#663399] text-white font-bold shadow-[0_4px_14px_0_rgba(102,51,153,0.39)] hover:shadow-[0_6px_20px_rgba(102,51,153,0.23)] hover:-translate-y-0.5 transition disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Posting...' : 'Post Announcement'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreateAnnouncementModal;
