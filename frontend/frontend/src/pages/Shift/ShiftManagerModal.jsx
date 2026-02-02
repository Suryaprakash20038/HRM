import React, { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2, FiEdit2, FiClock, FiSettings } from 'react-icons/fi';
import shiftService from '../../services/shiftService';

// --- Premium Modal Styles (Matching TaskForm/AddEmployee) ---
const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.85)",
    backdropFilter: "blur(5px)",
    zIndex: 10000,
    display: "grid",
    placeItems: "center",
    padding: "20px",
    overflowY: "auto"
};

const modalContentStyle = {
    background: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    width: "95vw",
    maxWidth: "800px", // Smaller max-width for this specific modal
    maxHeight: "90vh",
    minHeight: "500px",
    overflowY: "hidden",
    display: "flex",
    flexDirection: "column",
    border: "1px solid rgba(0,0,0,0.05)",
    position: "relative",
    margin: "auto"
};

const headerStyle = {
    padding: "20px 30px",
    borderBottom: "2px solid #E6C7E6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#ffffff",
    position: "sticky",
    top: 0,
    zIndex: 10
};

const footerStyle = {
    padding: "20px 30px",
    borderTop: "1px solid #E6C7E6",
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    background: "#ffffff",
    borderRadius: "0 0 16px 16px"
};

const sectionTitleStyle = {
    fontSize: "0.85rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#6b7280",
    fontWeight: 600,
    marginBottom: "1rem",
    marginTop: "1.5rem",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "0.5rem"
};

const inputStyle = (hasError) => ({
    width: "100%",
    padding: "0.625rem 0.875rem",
    fontSize: "0.95rem",
    lineHeight: "1.25rem",
    color: "#1f2937",
    background: "#fff",
    border: hasError ? "1px solid #ef4444" : "1px solid #d1d5db",
    borderRadius: "0.5rem",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    transition: "all 0.2s",
    outline: "none"
});

const labelStyle = {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#374151",
    marginBottom: "0.5rem"
};

export default function ShiftManagerModal({ onClose, onShiftUpdated }) {
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list' or 'form'
    const [editingShift, setEditingShift] = useState(null);

    // Default timings
    const DEFAULTS = {
        Morning: { start: "06:00", end: "14:00" },
        Afternoon: { start: "14:00", end: "22:00" },
        Night: { start: "22:00", end: "06:00" }
    };

    const resetToStandardShifts = async () => {
        if (!window.confirm("This will configure standard shifts (Morning, Afternoon, Night). Continue?")) return;
        setLoading(true);
        try {
            const standards = [
                { match: ['Morning', 'Shift 1'], data: { shiftName: 'Morning Shift', startTime: '06:00', endTime: '14:00', shiftType: 'Morning' } },
                { match: ['Afternoon', 'Shift 2', 'Swing'], data: { shiftName: 'Afternoon Shift', startTime: '14:00', endTime: '22:00', shiftType: 'Afternoon' } },
                { match: ['Night', 'Shift 3', 'Graveyard'], data: { shiftName: 'Night Shift', startTime: '22:00', endTime: '06:00', shiftType: 'Night' } }
            ];

            for (const std of standards) {
                const existing = shifts.find(s =>
                    std.match.some(m => s.shiftName.toLowerCase().includes(m.toLowerCase())) ||
                    s.shiftType === std.data.shiftType
                );

                if (existing) {
                    await shiftService.updateShift(existing._id, std.data);
                } else {
                    await shiftService.createShift(std.data);
                }
            }
            await loadShifts();
            if (onShiftUpdated) onShiftUpdated();
        } catch (error) {
            console.error(error);
            alert("Error updating shifts");
        } finally {
            setLoading(false);
        }
    };

    const [formData, setFormData] = useState({
        shiftName: '',
        startTime: '09:00',
        endTime: '18:00',
        shiftType: 'Day'
    });

    useEffect(() => {
        loadShifts();
    }, []);

    const loadShifts = async () => {
        try {
            setLoading(true);
            const data = await shiftService.getAllShifts();
            setShifts(data.shifts || []);
        } catch (error) {
            console.error("Failed to load shifts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingShift) {
                await shiftService.updateShift(editingShift._id, formData);
            } else {
                await shiftService.createShift(formData);
            }
            setView('list');
            loadShifts();
            if (onShiftUpdated) onShiftUpdated();
        } catch (error) {
            alert("Failed to save shift");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this shift?")) return;
        try {
            await shiftService.deleteShift(id);
            loadShifts();
            if (onShiftUpdated) onShiftUpdated();
        } catch (error) {
            alert("Failed to delete shift");
        }
    };

    const startEdit = (shift) => {
        setEditingShift(shift);
        setFormData({
            shiftName: shift.shiftName,
            startTime: shift.startTime,
            endTime: shift.endTime,
            shiftType: shift.shiftType || 'Day'
        });
        setView('form');
    };

    const startAdd = () => {
        setEditingShift(null);
        setFormData({
            shiftName: '',
            startTime: '09:00',
            endTime: '18:00',
            shiftType: 'Day'
        });
        setView('form');
    };

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle} className="animate__animated animate__fadeInUp animate__faster">

                {/* Header */}
                <div style={headerStyle}>
                    <div>
                        <h5 className="m-0 fw-bold" style={{ color: '#663399' }}>{view === 'list' ? 'Shift Types' : (editingShift ? 'Edit Shift' : 'New Shift')}</h5>
                        <p className="m-0 small" style={{ color: '#A3779D' }}>
                            {view === 'list' ? 'Manage your organization\'s work shifts' : 'Define shift timings and category'}
                        </p>
                    </div>
                    <button type="button" onClick={onClose} className="btn-close shadow-none" aria-label="Close"></button>
                </div>

                {/* Content */}
                <div style={{ padding: "30px", flex: 1, overflowY: "auto" }}>

                    {view === 'list' ? (
                        <>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <button className="btn btn-sm d-flex align-items-center" style={{ borderRadius: "8px", border: '1px solid #E6C7E6', color: '#663399', fontWeight: 600 }} onClick={resetToStandardShifts}>
                                    <FiSettings className="me-2" /> Reset Defaults
                                </button>
                                <button className="btn btn-sm d-flex align-items-center" style={{ borderRadius: "8px", background: "#663399", color: '#ffffff', border: "none", fontWeight: 600 }} onClick={startAdd}>
                                    <FiPlus className="me-2" /> Add Shift
                                </button>
                            </div>

                            <div className="list-group list-group-flush border rounded-3" style={{ overflow: 'hidden' }}>
                                {shifts.map(s => (
                                    <div key={s._id} className="list-group-item d-flex justify-content-between align-items-center p-3" style={{ borderBottomColor: '#E6C7E6' }}>
                                        <div className="d-flex align-items-center gap-3">
                                            <div style={{
                                                width: '40px', height: '40px', background: '#E6C7E6', color: '#663399',
                                                borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <FiClock size={18} />
                                            </div>
                                            <div>
                                                <div className="fw-bold" style={{ color: '#2E1A47' }}>{s.shiftName}</div>
                                                <div className="small" style={{ color: '#A3779D' }}>
                                                    {s.startTime} - {s.endTime}
                                                    <span className="badge ms-2" style={{ background: '#fdfbff', color: '#663399', border: '1px solid #E6C7E6', fontWeight: 600 }}>
                                                        {s.shiftType}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <button className="btn btn-sm btn-light text-primary" onClick={() => startEdit(s)}>
                                                <FiEdit2 />
                                            </button>
                                            <button className="btn btn-sm btn-light text-danger" onClick={() => handleDelete(s._id)}>
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {shifts.length === 0 && !loading && (
                                    <div className="text-center py-5 text-muted">
                                        <p>No shifts defined.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <form id="shiftForm" onSubmit={handleSubmit}>
                            <div className="section-title" style={{ ...sectionTitleStyle, marginTop: 0 }}>Shift Details</div>

                            <div className="mb-4">
                                <label style={{ ...labelStyle, color: '#2E1A47', fontWeight: 'bold' }}>Shift Name <span className="text-danger">*</span></label>
                                <input
                                    style={{ ...inputStyle(false), borderColor: '#E6C7E6', borderRadius: '12px' }}
                                    value={formData.shiftName}
                                    onChange={e => setFormData({ ...formData, shiftName: e.target.value })}
                                    placeholder="e.g. Morning Shift"
                                    required
                                />
                            </div>

                            <div className="row g-4 mb-4">
                                <div className="col-6">
                                    <label style={labelStyle}>Start Time <span className="text-danger">*</span></label>
                                    <input
                                        type="time"
                                        style={inputStyle(false)}
                                        value={formData.startTime}
                                        onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="col-6">
                                    <label style={labelStyle}>End Time <span className="text-danger">*</span></label>
                                    <input
                                        type="time"
                                        style={inputStyle(false)}
                                        value={formData.endTime}
                                        onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label style={labelStyle}>Shift Type</label>
                                <select
                                    style={inputStyle(false)}
                                    value={['Day', 'Morning', 'Afternoon', 'Night'].includes(formData.shiftType) ? formData.shiftType : 'Other'}
                                    onChange={e => {
                                        const type = e.target.value;
                                        if (type === 'Other') {
                                            setFormData({ ...formData, shiftType: 'Other' });
                                            return;
                                        }
                                        const defaults = DEFAULTS[type];
                                        if (defaults) {
                                            setFormData({ ...formData, shiftType: type, startTime: defaults.start, endTime: defaults.end });
                                        } else {
                                            setFormData({ ...formData, shiftType: type });
                                        }
                                    }}
                                >
                                    <option value="Day">Day</option>
                                    <option value="Morning">Morning (6AM-2PM)</option>
                                    <option value="Afternoon">Afternoon (2PM-10PM)</option>
                                    <option value="Night">Night (10PM-6AM)</option>
                                    <option value="Other">Other</option>
                                </select>

                                {(!['Day', 'Morning', 'Afternoon', 'Night'].includes(formData.shiftType)) && (
                                    <input
                                        type="text"
                                        className="mt-2"
                                        value={formData.shiftType === 'Other' ? '' : formData.shiftType}
                                        onChange={(e) => setFormData(s => ({ ...s, shiftType: e.target.value }))}
                                        style={inputStyle(false)}
                                        placeholder="Specify Shift Type"
                                    />
                                )}
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div style={footerStyle}>
                    {view === 'form' ? (
                        <>
                            <button type="button" className="btn btn-lg px-4" style={{ borderRadius: "12px", fontWeight: 600, border: "1px solid #E6C7E6", color: '#663399' }} onClick={() => setView('list')}>
                                Cancel
                            </button>
                            <button type="submit" form="shiftForm" className="btn btn-lg px-4 shadow-sm" style={{ borderRadius: "12px", fontWeight: 600, background: "#663399", color: '#ffffff', border: "none" }}>
                                Save Shift
                            </button>
                        </>
                    ) : (
                        <button type="button" className="btn btn-lg px-4 shadow-sm" style={{ borderRadius: "12px", fontWeight: 600, border: "1px solid #E6C7E6", color: '#663399' }} onClick={onClose}>
                            Close
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
