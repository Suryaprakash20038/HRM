import React, { useState, useEffect } from "react";
import { FiX, FiSend, FiAlertTriangle, FiCheck } from "react-icons/fi";
import axios from "../../services/api";

const CATEGORIES = [
    { id: "Warning / Disciplinary", label: "Warning / Disciplinary", icon: "⚠️", color: "text-danger" },
    { id: "Attendance / Leave Related", label: "Attendance / Leave Related", icon: "📅", color: "text-warning" },
    { id: "Performance / Appraisal", label: "Performance / Appraisal", icon: "📈", color: "text-primary" },
    { id: "Policy / Rules Update", label: "Policy / Rules Update", icon: "📋", color: "text-info" },
    { id: "Training / Meeting", label: "Training / Meeting", icon: "🤝", color: "text-success" },
    { id: "Appreciation / Reward", label: "Appreciation / Reward", icon: "🏆", color: "text-warning" },
    { id: "General Announcement", label: "General Announcement", icon: "📢", color: "text-secondary" },
];

const SendEmailModal = ({ isOpen, onClose, employee }) => {
    const [formData, setFormData] = useState({
        category: "General Announcement",
        subject: "",
        severity: "Low",
        message: ""
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: "", message: "" });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                category: "General Announcement",
                subject: "",
                severity: "Low",
                message: ""
            });
            setStatus({ type: "", message: "" });
        }
    }, [isOpen]);

    useEffect(() => {
        // Auto-fill subject based on category
        if (formData.category) {
            let prefix = "";
            switch (formData.category) {
                case "Warning / Disciplinary": prefix = "Warning: "; break;
                case "Attendance / Leave Related": prefix = "Update regarding Attendance: "; break;
                case "Performance / Appraisal": prefix = "Performance Review: "; break;
                case "Appreciation / Reward": prefix = "Congratulations! "; break;
                default: prefix = "";
            }
            setFormData(prev => ({ ...prev, subject: prefix }));
        }
    }, [formData.category]);

    if (!isOpen || !employee) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: "", message: "" });

        try {
            await axios.post(`/employees/${employee.id}/communication`, {
                ...formData,
                id: employee.id // Ensure ID is passed if needed by route, though usually in URL
            });

            setStatus({ type: "success", message: `Email sent successfully to ${employee.name}!` });
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            console.error("Failed to send email:", error);
            setStatus({
                type: "error",
                message: error.response?.data?.message || "Failed to send email. Please try again."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 shadow-lg">

                    {/* Header */}
                    <div className="modal-header bg-white border-bottom">
                        <h5 className="modal-title d-flex align-items-center gap-2 fw-bold text-dark">
                            <span className="bg-light p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                                📢
                            </span>
                            Send HR Communication
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body p-4 text-start">

                            {/* Employee Info */}
                            <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded-3">
                                <div className="position-relative">
                                    <img
                                        src={employee.photoUrl || `https://ui-avatars.com/api/?name=${employee.name}&background=random`}
                                        alt={employee.name}
                                        className="rounded-circle object-fit-cover shadow-sm"
                                        style={{ width: 48, height: 48 }}
                                    />
                                </div>
                                <div>
                                    <div className="fw-bold text-dark">{employee.name}</div>
                                    <div className="small text-muted">{employee.email} • {employee.position}</div>
                                </div>
                            </div>

                            {status.message && (
                                <div className={`alert ${status.type === "success" ? "alert-success" : "alert-danger"} d-flex align-items-center gap-2 mb-4`}>
                                    {status.type === "success" ? <FiCheck /> : <FiAlertTriangle />}
                                    {status.message}
                                </div>
                            )}

                            <div className="row g-3">

                                {/* Category Selection */}
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold text-secondary small text-uppercase">Communication Type</label>
                                    <select
                                        className="form-select border-2"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.icon}  {cat.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Severity (Only for Warning) */}
                                {formData.category === "Warning / Disciplinary" && (
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold text-danger small text-uppercase">Severity Level</label>
                                        <select
                                            className="form-select border-2 border-danger text-danger fw-bold"
                                            value={formData.severity}
                                            onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                                        >
                                            <option value="Low">Low - Verbal Warning</option>
                                            <option value="Medium">Medium - Written Warning</option>
                                            <option value="High">High - Serious Misconduct</option>
                                            <option value="Critical">Critical - Termination Warning</option>
                                        </select>
                                    </div>
                                )}

                                {/* Subject */}
                                <div className="col-12">
                                    <label className="form-label fw-semibold text-secondary small text-uppercase">Subject</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        placeholder="Email Subject"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    />
                                </div>

                                {/* Message */}
                                <div className="col-12">
                                    <label className="form-label fw-semibold text-secondary small text-uppercase">Message Content</label>
                                    <textarea
                                        className="form-control"
                                        required
                                        rows="6"
                                        placeholder="Write your message here..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    ></textarea>
                                    <div className="form-text">
                                        This message will be sent via email to the employee. Proper formatting is recommended.
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer bg-light border-top p-3">
                            <button type="button" className="btn btn-link text-muted text-decoration-none fw-semibold" onClick={onClose}>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <FiSend /> Send Communication
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SendEmailModal;
