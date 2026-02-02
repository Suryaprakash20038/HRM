import React from 'react';
import './ContentForm.css';

const ContentForm = ({ formData, onFormChange, letterType = 'Offer', customTemplates = [] }) => {
    // Check selected template type
    const selectedTemplate = customTemplates.find(t => t._id === formData.designId);
    const isFixedPdf = selectedTemplate && selectedTemplate.isFixedPdf;

    const handleChange = (e) => {
        const { name, value } = e.target;
        onFormChange({ ...formData, [name]: value });
    };

    // Prevent HTML input
    const handleBodyChange = (e) => {
        const value = e.target.value;
        const sanitized = value.replace(/<[^>]*>/g, '');
        onFormChange({ ...formData, bodyContent: sanitized });
    };

    return (
        <div className="content-form">
            <h3 className="content-form-title">
                <i className="bi bi-pencil-square"></i> Enter Letter Content
            </h3>
            <p className="content-form-subtitle">
                Fill in the details below. Only plain text is allowed.
            </p>

            {/* IF FIXED PDF, SHOW PREVIEW IFRAME */}
            {isFixedPdf ? (
                <div className="form-grid-content">
                    <div className="form-field full-width">
                        <div style={{ position: 'relative', height: '60vh', background: '#f8fafc', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            <iframe
                                src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/recruitment-settings/templates/${selectedTemplate._id}/preview?token=${localStorage.getItem('token')}`}
                                width="100%"
                                height="100%"
                                style={{ border: 'none' }}
                                title="Template Preview"
                            ></iframe>
                        </div>
                        <p className="text-muted text-center mt-2 small">
                            <i className="bi bi-info-circle me-1"></i> This document will be sent exactly as shown.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="form-grid-content">
                    {/* ... fields ... */}
                    {/* Candidate/Employee Name */}
                    <div className="form-field">
                        <label className="field-label">
                            <i className="bi bi-person-fill"></i> Candidate / Employee Name *
                        </label>
                        <input
                            type="text"
                            name="employeeName"
                            className="field-input"
                            value={formData.employeeName || ''}
                            onChange={handleChange}
                            placeholder="e.g., John Doe"
                            required
                        />
                    </div>

                    {/* Designation */}
                    <div className="form-field">
                        <label className="field-label">
                            <i className="bi bi-briefcase-fill"></i> Designation / Role *
                        </label>
                        <input
                            type="text"
                            name="designation"
                            className="field-input"
                            value={formData.designation || ''}
                            onChange={handleChange}
                            placeholder="e.g., Senior Software Engineer"
                            required
                        />
                    </div>

                    {/* Joining Date (for Offer/Appointment) */}
                    {(letterType === 'Offer' || letterType === 'Appointment') && (
                        <div className="form-field">
                            <label className="field-label">
                                <i className="bi bi-calendar-check-fill"></i> Joining Date
                            </label>
                            <input
                                type="date"
                                name="joiningDate"
                                className="field-input"
                                value={formData.joiningDate || ''}
                                onChange={handleChange}
                            />
                        </div>
                    )}

                    {/* Salary (optional) */}
                    {(letterType === 'Offer' || letterType === 'Appointment') && (
                        <div className="form-field">
                            <label className="field-label">
                                <i className="bi bi-currency-dollar"></i> Salary / CTC (Optional)
                            </label>
                            <input
                                type="number"
                                name="salary"
                                className="field-input"
                                value={formData.salary || ''}
                                onChange={handleChange}
                                placeholder="e.g., 500000"
                            />
                        </div>
                    )}

                    {/* --- INTERVIEW SPECIFIC FIELDS --- */}
                    {(letterType === 'Interview' || letterType === 'Interview Call' || letterType === 'Next Round') && (
                        <>
                            <div className="form-field">
                                <label className="field-label">
                                    <i className="bi bi-calendar-event"></i> Interview Date *
                                </label>
                                <input
                                    type="date"
                                    name="interviewDate"
                                    className="field-input"
                                    value={formData.interviewDate || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label className="field-label">
                                    <i className="bi bi-clock"></i> Interview Time *
                                </label>
                                <input
                                    type="time"
                                    name="interviewTime"
                                    className="field-input"
                                    value={formData.interviewTime || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label className="field-label">
                                    <i className="bi bi-camera-video"></i> Interview Mode
                                </label>
                                <select
                                    name="interviewMode"
                                    className="field-input"
                                    value={formData.interviewMode || 'Online'}
                                    onChange={handleChange}
                                >
                                    <option value="Online">Online (Video Call)</option>
                                    <option value="Offline">Offline (In-Person)</option>
                                    <option value="Telephonic">Telephonic</option>
                                </select>
                            </div>

                            <div className="form-field">
                                <label className="field-label">
                                    <i className="bi bi-geo-alt"></i> Link / Location *
                                </label>
                                <input
                                    type="text"
                                    name="interviewLocation"
                                    className="field-input"
                                    value={formData.interviewLocation || ''}
                                    onChange={handleChange}
                                    placeholder={formData.interviewMode === 'Online' ? 'e.g., Zoom/Google Meet Link' : 'e.g., Office Address'}
                                    required
                                />
                            </div>
                        </>
                    )}

                    {/* --- EXPERIENCE / RELIEVING SPECIFIC FIELDS --- */}
                    {(letterType === 'Experience' || letterType === 'Relieving') && (
                        <>
                            <div className="form-field">
                                <label className="field-label">
                                    <i className="bi bi-calendar-plus"></i> Joining Date
                                </label>
                                <input
                                    type="date"
                                    name="joiningDate"
                                    className="field-input"
                                    value={formData.joiningDate || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-field">
                                <label className="field-label">
                                    <i className="bi bi-calendar-x"></i> Last Working Day
                                </label>
                                <input
                                    type="date"
                                    name="lastWorkingDay"
                                    className="field-input"
                                    value={formData.lastWorkingDay || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </>
                    )}

                    {/* HR Name */}
                    <div className="form-field">
                        <label className="field-label">
                            <i className="bi bi-person-badge-fill"></i> HR Manager Name *
                        </label>
                        <input
                            type="text"
                            name="hrName"
                            className="field-input"
                            value={formData.hrName || ''}
                            onChange={handleChange}
                            placeholder="e.g., Sarah Johnson"
                            required
                        />
                    </div>

                    {/* Body Content - Full Width */}
                    <div className="form-field full-width">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label className="field-label" style={{ marginBottom: 0 }}>
                                <i className="bi bi-file-text-fill"></i> Letter Body Content *
                            </label>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => {
                                    let content = formData.bodyContent || '';
                                    const map = {
                                        '{{candidate_name}}': formData.employeeName,
                                        '{{designation}}': formData.designation,
                                        '{{joining_date}}': formData.joiningDate ? new Date(formData.joiningDate).toLocaleDateString() : '',
                                        '{{ctc}}': formData.salary ? Number(formData.salary).toLocaleString() : '',
                                        '{{hr_name}}': formData.hrName,
                                        '{{interview_date}}': formData.interviewDate ? new Date(formData.interviewDate).toLocaleDateString() : '',
                                        '{{interview_time}}': formData.interviewTime,
                                        '{{interview_mode}}': formData.interviewMode,
                                        '{{interview_location}}': formData.interviewLocation,
                                        '{{last_working_day}}': formData.lastWorkingDay ? new Date(formData.lastWorkingDay).toLocaleDateString() : '',
                                        '{{current_date}}': new Date().toLocaleDateString()
                                    };

                                    Object.keys(map).forEach(key => {
                                        if (map[key]) {
                                            content = content.replaceAll(key, map[key]);
                                        }
                                    });
                                    onFormChange({ ...formData, bodyContent: content });
                                }}
                            >
                                <i className="bi bi-magic"></i> Auto-fill Variables
                            </button>
                        </div>
                        <textarea
                            name="bodyContent"
                            className="field-textarea"
                            value={formData.bodyContent || ''}
                            onChange={(e) => onFormChange({ ...formData, bodyContent: e.target.value })}
                            placeholder="Enter the main content of the letter here."
                            rows="10"
                            required
                        />
                        <small className="field-hint">
                            <i className="bi bi-code-slash"></i> HTML is allowed for formatting. Click "Auto-fill Variables" to replace placeholders.
                        </small>
                    </div>
                </div>
            )}

            <div className="content-form-notice">
                <i className="bi bi-shield-check"></i>
                <div>
                    <strong>Design Protection:</strong> The header, footer, and styling are locked and cannot be modified.
                    You can only edit the content fields above.
                </div>
            </div>
        </div>
    );
};

export default ContentForm;
