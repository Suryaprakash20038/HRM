import React, { useState, useEffect } from 'react';
import { useAuth } from "../../context/AuthContext";
import employeeService from '../../services/employeeService';
import { FiX, FiCamera, FiUser, FiMail, FiShield, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProfileModal = ({ onClose }) => {
    const { user, fetchUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        profileImage: null
    });
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                profileImage: null
            });
            if (user.profileImage) {
                if (user.profileImage.startsWith('http')) {
                    setPreviewUrl(user.profileImage);
                } else {
                    // Handle local paths, converting Windows backslashes to forward slashes
                    const cleanPath = user.profileImage.replace(/\\/g, '/');
                    setPreviewUrl(`http://localhost:5000/${cleanPath}`);
                }
            } else {
                setPreviewUrl('');
            }
        }
    }, [user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, profileImage: file });
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user?.employeeProfileId) {
            toast.error("No employee profile linked. Cannot update details.");
            return;
        }

        setLoading(true);
        try {
            const updateData = {};
            if (formData.firstName !== user.firstName) updateData.firstName = formData.firstName;
            if (formData.lastName !== user.lastName) updateData.lastName = formData.lastName;
            if (formData.profileImage) updateData.profileImage = formData.profileImage;

            if (Object.keys(updateData).length === 0) {
                toast("No changes to save");
                setLoading(false);
                return;
            }

            await employeeService.updateEmployee(user.employeeProfileId, updateData);

            await fetchUser(); // Refresh global user state
            toast.success("Profile updated successfully!");
            onClose();
        } catch (error) {
            console.error("Profile update error:", error);
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed-top w-100 h-100 d-flex align-items-start justify-content-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060, backdropFilter: 'blur(5px)', paddingTop: '120px' }}>

            <div className="bg-white rounded-3 shadow-lg d-flex flex-column"
                style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>

                {/* Header */}
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                    <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                        <FiUser className="text-primary" /> Edit Profile
                    </h5>
                    <button onClick={onClose} className="btn-close"></button>
                </div>

                {/* Body */}
                <div className="p-4 overflow-auto custom-scrollbar">
                    <form onSubmit={handleSubmit}>
                        <div className="row g-5">
                            {/* Left Column: Image */}
                            <div className="col-md-4 d-flex flex-column align-items-center pt-2">
                                <div className="mb-3 position-relative">
                                    <div className="rounded-circle border overflow-hidden d-flex align-items-center justify-content-center bg-light"
                                        style={{ width: '180px', height: '180px' }}>
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Profile" className="w-100 h-100 object-fit-cover" />
                                        ) : (
                                            <FiUser size={80} className="text-secondary opacity-25" />
                                        )}
                                    </div>
                                </div>
                                <label className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2">
                                    <FiCamera /> Change Photo
                                    <input type="file" className="d-none" accept="image/*" onChange={handleFileChange} />
                                </label>
                                <div className="text-muted small mt-2 text-center opacity-75">
                                    Max 5MB (JPG/PNG)
                                </div>
                            </div>

                            {/* Right Column: Form */}
                            <div className="col-md-8">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-secondary">First Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.firstName}
                                            onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-secondary">Last Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.lastName}
                                            onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label fw-bold small text-secondary">Email Address</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0 text-muted"><FiMail /></span>
                                            <input
                                                type="email"
                                                className="form-control bg-light border-start-0"
                                                value={user?.email || ''}
                                                disabled
                                                style={{ cursor: 'not-allowed' }}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label fw-bold small text-secondary">Role</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0 text-muted"><FiShield /></span>
                                            <input
                                                type="text"
                                                className="form-control bg-light border-start-0 text-capitalize"
                                                value={user?.role || ''}
                                                disabled
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-3 border-top d-flex justify-content-end gap-2 bg-light rounded-bottom">
                    <button type="button" className="btn btn-light border px-4 rounded-pill" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="button" className="btn btn-primary px-4 rounded-pill d-flex align-items-center gap-2" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Saving...' : <><FiSave /> Save Changes</>}
                    </button>
                </div>

            </div>

            <style>
                {`
                    @keyframes popIn {
                        0% { transform: scale(0.8); opacity: 0; }
                        60% { transform: scale(1.05); opacity: 1; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
                    
                    /* Input Focus Styles to match clean look */
                    .form-control:focus {
                        border-color: #3b82f6;
                        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                    }
                    .input-group-text {
                        color: #6c757d;
                    }
                `}
            </style>
        </div>
    );
};

export default ProfileModal;
