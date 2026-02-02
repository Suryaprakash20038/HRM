import React, { useState, useEffect } from "react";
import { glass } from "../utils/glassStyle";
import { FiPlus, FiClock, FiCheckCircle, FiXCircle, FiCalendar } from "react-icons/fi";
import { leaveService } from "../services/leaveService";
import employeeService from "../services/employeeService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { EMP_THEME } from "./theme";

export default function EmployeeLeave() {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Employee profile state
    const [employeeProfile, setEmployeeProfile] = useState({
        profileImage: ""
    });

    // Form state
    const [formData, setFormData] = useState({
        leaveType: "Sick Leave",
        startDate: "",
        endDate: "",
        reason: ""
    });

    useEffect(() => {
        if (user) {
            fetchLeaves();
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const employee = await employeeService.getMyProfile();
            if (employee) {
                setEmployeeProfile({
                    profileImage: employee.profileImage || ""
                });
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        }
    };

    const fetchLeaves = async () => {
        try {
            const response = await leaveService.getLeaves({ employeeId: user._id });
            if (response.data.status === 'success') {
                setLeaves(response.data.data.leaves);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching leaves:", error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Use FormData for file upload
            const data = new FormData();

            // Handle custom leave type
            const finalLeaveType = formData.leaveType === 'Other'
                ? formData.customLeaveType
                : formData.leaveType;

            data.append('leaveType', finalLeaveType);
            data.append('startDate', formData.startDate);
            data.append('endDate', formData.endDate);
            data.append('reason', formData.reason);
            data.append('employee', user._id);
            if (formData.document) {
                data.append('document', formData.document);
            }

            const response = await leaveService.applyLeave(data);

            if (response.data.status === 'success') {
                toast.success("Leave application submitted successfully!");
                setShowModal(false);
                fetchLeaves(); // Refresh list

                // Reset form
                setFormData({
                    leaveType: "Sick Leave",
                    startDate: "",
                    endDate: "",
                    reason: "",
                    document: null
                });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to submit leave application";
            const validationErrors = error.response?.data?.errors;

            if (validationErrors && validationErrors.length > 0) {
                // Show the first validation error
                toast.error(`${errorMessage}: ${validationErrors[0].message}`);
            } else {
                toast.error(errorMessage);
            }
        }
    };

    const getStageIcon = (status) => {
        if (status === 'Approved') return <FiCheckCircle className="text-success" />;
        if (status === 'Rejected') return <FiXCircle className="text-danger" />;
        return <FiClock className="text-warning" />;
    };

    const getStageClass = (status) => {
        if (status === 'Approved') return 'bg-success-subtle text-success border-success';
        if (status === 'Rejected') return 'bg-danger-subtle text-danger border-danger';
        return 'bg-warning-subtle text-warning border-warning';
    };

    // Helper to get image URL (same as EmployeeProfile.jsx)
    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://localhost:5000/${path.replace(/\\/g, '/')}`;
    };

    const getRejectionDetails = (leave) => {
        if (leave.approvalChain?.teamLead?.status === 'Rejected') {
            return {
                role: 'Team Lead',
                reason: leave.approvalChain.teamLead.comment,
                by: leave.approvalChain.teamLead.by
            };
        }
        if (leave.approvalChain?.hr?.status === 'Rejected') {
            return {
                role: 'HR',
                reason: leave.approvalChain.hr.comment,
                by: leave.approvalChain.hr.by
            };
        }
        if (leave.approvalChain?.md?.status === 'Rejected') {
            return {
                role: 'MD',
                reason: leave.approvalChain.md.comment,
                by: leave.approvalChain.md.by
            };
        }
        return { role: 'System', reason: leave.rejectionReason, by: null };
    };

    return (
        <div className="p-4 container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-3">
                    {employeeProfile.profileImage && (
                        <div style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            overflow: "hidden",
                            border: "2px solid white",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                        }}>
                            <img
                                src={getImageUrl(employeeProfile.profileImage)}
                                alt="Profile"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        </div>
                    )}
                    <div>
                        <h2 className="fw-bold mb-0">My Leaves</h2>
                        <div className="text-muted">{user?.firstName} {user?.lastName} | {user?.email}</div>
                    </div>
                </div>
                <button className="btn d-flex align-items-center gap-2" style={{ backgroundColor: EMP_THEME.royalAmethyst, color: 'white', border: 'none' }} onClick={() => setShowModal(true)}>
                    <FiPlus /> Apply Leave
                </button>
            </div>

            {/* Leave History Table */}
            <div style={glass} className="p-4">
                <h5 className="fw-bold mb-3">Leave History</h5>
                <div className="table-responsive">
                    <table className="table align-middle table-hover">
                        <thead className="table-light">
                            <tr>
                                <th>Type</th>
                                <th>Duration</th>
                                <th>Days</th>
                                <th>Status</th>
                                <th>Reason</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaves.map(leave => {
                                const rejection = leave.status === 'Rejected' ? getRejectionDetails(leave) : null;
                                return (
                                    <tr key={leave._id}>
                                        <td>
                                            <span className="fw-bold">{leave.leaveType}</span>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2 text-muted">
                                                <FiCalendar />
                                                {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td>{leave.totalDays} Days</td>
                                        <td>
                                            {leave.status === 'Approved' && (
                                                <span className="badge bg-success">Approved</span>
                                            )}
                                            {leave.status === 'Pending' && (
                                                <span className="badge bg-warning text-dark">Pending</span>
                                            )}
                                            {leave.status === 'Rejected' && (
                                                <span className="badge bg-danger">Rejected</span>
                                            )}
                                        </td>
                                        <td>
                                            {leave.status === 'Rejected' && rejection ? (
                                                <div className="text-danger" style={{ fontSize: '0.9rem' }}>
                                                    {rejection.reason || "No reason provided"}
                                                </div>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                            {leaves.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-muted">No leave requests found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Apply Leave Modal */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Apply for Leave</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Leave Type</label>
                                        <select
                                            className="form-select"
                                            value={formData.leaveType}
                                            onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                                            required
                                        >
                                            <option value="Sick Leave">Sick Leave</option>
                                            <option value="Casual Leave">Casual Leave</option>
                                            <option value="Annual Leave">Annual Leave</option>
                                            <option value="Maternity Leave">Maternity Leave</option>
                                            <option value="Paternity Leave">Paternity Leave</option>
                                            <option value="Unpaid Leave">Unpaid Leave</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    {formData.leaveType === 'Other' && (
                                        <div className="mb-3">
                                            <label className="form-label">Custom Leave Title</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.customLeaveType || ''}
                                                onChange={(e) => setFormData({ ...formData, customLeaveType: e.target.value })}
                                                placeholder="Enter leave title (e.g., Marriage Leave)"
                                                required
                                            />
                                        </div>
                                    )}
                                    <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Start Date</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={formData.startDate}
                                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">End Date</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={formData.endDate}
                                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    {formData.startDate && formData.endDate && (
                                        <div className="mb-3">
                                            <div className="alert alert-info py-2">
                                                <small className="fw-bold">
                                                    Total Days: {
                                                        Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) + 1 > 0
                                                            ? Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) + 1
                                                            : 0
                                                    }
                                                </small>
                                            </div>
                                        </div>
                                    )}
                                    <div className="mb-3">
                                        <label className="form-label">Reason</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={formData.reason}
                                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                            placeholder="Please describe the reason for your leave..."
                                            required
                                            minLength={3}
                                        ></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Proof / Supporting Document (Optional)</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            onChange={(e) => setFormData({ ...formData, document: e.target.files[0] })}
                                            accept="image/*,application/pdf"
                                        />
                                        <div className="form-text">Upload any supporting document (e.g. Medical certificate, Wedding invitation) (Image/PDF)</div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn" style={{ backgroundColor: EMP_THEME.royalAmethyst, color: 'white' }}>Submit Request</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
