import React, { useState, useEffect } from 'react';
import shiftService from '../../services/shiftService';
import employeeService from '../../services/employeeService';
import { FiChevronLeft, FiChevronRight, FiPlus, FiCalendar, FiSettings, FiTrash2, FiEdit2 } from 'react-icons/fi';
import ShiftManagerModal from './ShiftManagerModal';

const glass = {
    background: "#ffffff",
    borderRadius: 24,
    border: "1px solid #E6C7E6",
    boxShadow: "0 10px 30px -10px rgba(102, 51, 153, 0.1)",
};

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
    maxWidth: "1400px",
    height: "90vh",
    maxHeight: "90vh",
    overflowY: "hidden",
    display: "flex", // Ensure flex is set for column layout
    flexDirection: "column", // Ensure column layout
    border: "1px solid rgba(0,0,0,0.05)",
    position: "relative",
    margin: "auto"
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

const headerStyle = {
    padding: "20px 30px",
    borderBottom: "1px solid #f3f4f6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(255,255,255,0.9)",
    position: "sticky",
    top: 0,
    zIndex: 10,
    backdropFilter: "blur(8px)"
};

const footerStyle = {
    padding: "20px 30px",
    borderTop: "1px solid #f3f4f6",
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    background: "#f9fafb",
    borderRadius: "0 0 16px 16px"
};

const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
};

const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

export default function ShiftRoster({ shifts: availableShifts, employees = [], onRefreshShifts }) {
    const [viewMode, setViewMode] = useState('Week'); // 'Week' or 'Month'
    const [currentStart, setCurrentStart] = useState(getStartOfWeek(new Date()));
    const [selectedDept, setSelectedDept] = useState('All');

    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [showManagerModal, setShowManagerModal] = useState(false);
    const [empSearch, setEmpSearch] = useState("");
    const [assignForm, setAssignForm] = useState({
        employeeIds: [],
        shiftId: "",
        startDate: formatDate(new Date()),
        endDate: formatDate(new Date()),
        isManual: false,
        startTime: "09:00",
        endTime: "18:00",
        type: "Regular",
        assignmentType: 'fixed',
        rotationFrequency: 'weekly',
        rotationShifts: []
    });

    const [editingSchedule, setEditingSchedule] = useState(null);

    const handleEditClick = (s) => {
        setEditingSchedule({
            _id: s._id,
            shiftId: s.shift ? s.shift._id : '',
            isManual: !s.shift,
            startTime: s.startTime,
            endTime: s.endTime,
            type: s.type
        });
    };

    const handleUpdateSchedule = async (e) => {
        e.preventDefault();
        try {
            await shiftService.updateSchedule(editingSchedule._id, {
                shiftId: editingSchedule.shiftId,
                startTime: editingSchedule.startTime,
                endTime: editingSchedule.endTime,
                type: editingSchedule.type,
                isManual: editingSchedule.isManual
            });
            setEditingSchedule(null);
            fetchData();
        } catch (error) {
            alert("Failed to update shift");
        }
    };

    const handleAddShiftToCell = (empId, date) => {
        const dateStr = formatDate(date);
        setAssignForm({
            employeeIds: [empId],
            startDate: dateStr,
            endDate: dateStr,
            assignmentType: 'fixed',
            isManual: false,
            shiftId: "",
            startTime: "09:00",
            endTime: "18:00",
            type: "Regular",
            rotationFrequency: 'weekly',
            rotationShifts: []
        });
        setShowAssignModal(true);
    };

    // Calculate dates to display based on viewMode
    const datesToDisplay = React.useMemo(() => {
        if (viewMode === 'Week') {
            return Array.from({ length: 7 }, (_, i) => addDays(currentStart, i));
        } else {
            // Month view: Start from 1st of month to End of month
            const year = currentStart.getFullYear();
            const month = currentStart.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const startOfMonth = new Date(year, month, 1);
            return Array.from({ length: daysInMonth }, (_, i) => addDays(startOfMonth, i));
        }
    }, [currentStart, viewMode]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const start = datesToDisplay[0];
            const end = datesToDisplay[datesToDisplay.length - 1];

            const scheds = await shiftService.getSchedule({
                startDate: formatDate(start),
                endDate: formatDate(end)
            });
            setSchedule(scheds || []);
        } catch (error) {
            console.error("Roster load error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // When switching to Month, set currentStart to 1st of month
        if (viewMode === 'Month') {
            const d = new Date(currentStart);
            d.setDate(1);
            setCurrentStart(d);
        } else {
            // When switching to Week, set currentStart to start of week of current selection
            setCurrentStart(getStartOfWeek(currentStart));
        }
    }, [viewMode]);

    useEffect(() => {
        fetchData();
    }, [currentStart, viewMode]); // Re-fetch when dates change or view mode changes

    const handleDeleteSchedule = async (scheduleId) => {
        if (!window.confirm("Delete this shift assignment?")) return;
        try {
            await shiftService.deleteSchedule(scheduleId);
            if (onRefreshShifts) onRefreshShifts();
            fetchData(); // Re-fetch to update the schedule display
        } catch (e) {
            console.error(e);
            alert("Failed to delete shift");
        }
    };

    const handleNavigate = (direction) => {
        if (viewMode === 'Week') {
            setCurrentStart(d => addDays(d, direction * 7));
        } else {
            setCurrentStart(d => {
                const newDate = new Date(d);
                newDate.setMonth(newDate.getMonth() + direction);
                return newDate;
            });
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            await shiftService.assignSchedule(assignForm);
            alert("Schedule Assigned!");
            setShowAssignModal(false);
            fetchData();
        } catch (error) {
            alert("Failed to assign");
        }
    };

    const getShiftsForCell = (empId, dateObj) => {
        const dateStr = formatDate(dateObj);
        return schedule.filter(s =>
            s.employee._id === empId &&
            s.date.startsWith(dateStr)
        );
    };

    const handleSelectAllEmployees = () => {
        const filteredEmps = selectedDept === 'All'
            ? employees
            : employees.filter(e => e.department === selectedDept);

        if (assignForm.employeeIds.length === filteredEmps.length) {
            setAssignForm(f => ({ ...f, employeeIds: [] }));
        } else {
            setAssignForm(f => ({ ...f, employeeIds: filteredEmps.map(e => e._id) }));
        }
    };

    // Get unique departments
    const departments = ['All', ...new Set(employees.map(e => e.department).filter(Boolean))].sort();

    // Filter employees for grid
    const displayedEmployees = employees
        .filter(e => selectedDept === 'All' || e.department === selectedDept)
        .sort((a, b) => {
            const getRank = (p) => {
                const pos = (p || "").toLowerCase();
                if (pos.includes('manager')) return 1;
                if (pos.includes('lead') || pos.includes('tl')) return 2;
                return 3;
            };
            // Use 'position' directly from employee object
            return getRank(a.position) - getRank(b.position);
        });

    return (
        <div className="pt-3">
            {/* Toolbar */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div className="d-flex align-items-center gap-3">
                    {/* View Mode Toggle */}
                    {/* View Mode Toggle */}
                    <div className="btn-group shadow-sm">
                        <button
                            className="btn btn-sm"
                            style={{
                                backgroundColor: viewMode === 'Week' ? '#663399' : '#ffffff',
                                color: viewMode === 'Week' ? '#ffffff' : '#663399',
                                border: '1px solid #663399',
                                fontWeight: 600
                            }}
                            onClick={() => setViewMode('Week')}
                        >
                            Week
                        </button>
                        <button
                            className="btn btn-sm"
                            style={{
                                backgroundColor: viewMode === 'Month' ? '#663399' : '#ffffff',
                                color: viewMode === 'Month' ? '#ffffff' : '#663399',
                                border: '1px solid #663399',
                                fontWeight: 600
                            }}
                            onClick={() => setViewMode('Month')}
                        >
                            Month
                        </button>
                    </div>

                    {/* Department Filter */}
                    <select
                        className="form-select shadow-sm"
                        style={{ maxWidth: 200, borderColor: '#E6C7E6', color: '#663399', fontWeight: 600 }}
                        value={selectedDept}
                        onChange={e => setSelectedDept(e.target.value)}
                    >
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>

                    <div className="vr h-100 mx-1" style={{ backgroundColor: '#E6C7E6' }}></div>

                    {/* Date Navigation */}
                    <div className="btn-group shadow-sm">
                        <button className="btn btn-light border" style={{ borderColor: '#E6C7E6' }} onClick={() => handleNavigate(-1)}>
                            <FiChevronLeft style={{ color: '#663399' }} />
                        </button>
                        <button className="btn btn-light border fw-bold px-3" disabled style={{ minWidth: 160, borderColor: '#E6C7E6', backgroundColor: '#f8fafc', color: '#663399' }}>
                            {viewMode === 'Week' ? (
                                <>
                                    {datesToDisplay[0]?.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    {' - '}
                                    {datesToDisplay[datesToDisplay.length - 1]?.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </>
                            ) : (
                                datesToDisplay[0]?.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
                            )}
                        </button>
                        <button className="btn btn-light border" style={{ borderColor: '#E6C7E6' }} onClick={() => handleNavigate(1)}>
                            <FiChevronRight style={{ color: '#663399' }} />
                        </button>
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button className="btn btn-outline-dark shadow-sm" style={{ borderColor: '#2E1A47', color: '#2E1A47', fontWeight: 600 }} onClick={() => setShowManagerModal(true)}>
                        <FiSettings className="me-2" />
                        Manage Shifts
                    </button>
                    <button className="btn shadow-sm" style={{ backgroundColor: '#663399', color: '#ffffff', fontWeight: 600 }} onClick={() => setShowAssignModal(true)}>
                        <FiPlus className="me-2" />
                        Assign Shifts
                    </button>
                    <button className="btn shadow-sm" style={{ border: '1px solid #E6C7E6', color: '#663399', fontWeight: 600 }} onClick={() => setShowStatsModal(true)}>
                        View Stats
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="table-responsive" style={{ ...glass, padding: 0, overflowX: 'auto' }}>
                <table className="table table-bordered mb-0" style={{ fontSize: '0.85rem' }}>
                    <thead style={{ backgroundColor: '#f8fafc', position: 'sticky', top: 0, zIndex: 5 }}>
                        <tr>
                            <th className="p-4 border-bottom shadow-sm position-sticky start-0" style={{ minWidth: 200, left: 0, zIndex: 6, backgroundColor: '#f8fafc', color: '#663399', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Employee</th>
                            {datesToDisplay.map(d => (
                                <th key={d.toISOString()} className="p-2 text-center border-bottom" style={{ minWidth: viewMode === 'Week' ? 140 : 60, color: '#663399' }}>
                                    <div className="small text-muted text-uppercase" style={{ fontSize: '0.7em', color: '#A3779D' }}>{d.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                                    <div className="fw-bold fs-5">{d.getDate()}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {displayedEmployees.map(emp => (
                            <tr key={emp._id}>
                                <td className="p-3 bg-white position-sticky start-0 border-end shadow-sm" style={{ left: 0, zIndex: 4 }}>
                                    <div className="d-flex align-items-center gap-2">
                                        {emp.profileImage ? (
                                            <img src={emp.profileImage.startsWith('http') ? emp.profileImage : `http://localhost:5000/${emp.profileImage}`} className="rounded-2" width="40" height="40" style={{ objectFit: 'cover' }} />
                                        ) : (
                                            <div className="rounded-2 d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40, fontSize: 16, backgroundColor: '#E6C7E6', color: '#663399' }}>
                                                {emp.firstName?.[0]}
                                            </div>
                                        )}
                                        <div>
                                            <div className="fw-bold" style={{ color: '#2E1A47' }}>{emp.firstName} {emp.lastName}</div>
                                            <div className="small" style={{ color: '#A3779D' }}>
                                                {emp.domain ? `${emp.position} (${emp.domain})` : emp.position}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                {datesToDisplay.map(d => {
                                    const shifts = getShiftsForCell(emp._id, d);
                                    return (
                                        <td key={d.toISOString()} className="p-2 align-middle bg-light bg-opacity-10 position-relative">
                                            <div className="position-absolute top-0 end-0 p-1" style={{ zIndex: 5 }}>
                                                <button
                                                    className="btn btn-link p-0 text-muted opacity-50 text-decoration-none"
                                                    onClick={() => handleAddShiftToCell(emp._id, d)}
                                                    title="Add Shift"
                                                >
                                                    <FiPlus size={14} />
                                                </button>
                                            </div>

                                            <div className="pt-3">
                                                {shifts.map((s, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`badge w-100 text-start p-2 mb-1 shadow-sm position-relative ${s.isDoubleShift ? 'bg-danger bg-opacity-75' : ''}`}
                                                        style={{
                                                            fontWeight: 'normal',
                                                            paddingRight: '45px',
                                                            backgroundColor: s.isDoubleShift ? undefined : '#fdfbff',
                                                            color: s.isDoubleShift ? undefined : '#663399',
                                                            border: s.isDoubleShift ? undefined : '1px solid #E6C7E6'
                                                        }}
                                                    >
                                                        <div className="fw-bold small">{s.shift ? s.shift.shiftName : s.type}</div>
                                                        <div className="small opacity-75">{s.startTime} - {s.endTime}</div>
                                                        {s.isDoubleShift && <div className="badge bg-warning text-dark mt-1" style={{ fontSize: '0.65em' }}>Double</div>}

                                                        <div className="position-absolute top-0 end-0 mt-1 me-1 d-flex gap-1" style={{ zIndex: 10 }}>
                                                            <button
                                                                className="btn btn-link p-0 text-secondary"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditClick(s);
                                                                }}
                                                                title="Edit Assignment"
                                                            >
                                                                <FiEdit2 size={12} />
                                                            </button>
                                                            <button
                                                                className="btn btn-link p-0 text-danger"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteSchedule(s._id);
                                                                }}
                                                                title="Delete Assignment"
                                                            >
                                                                <FiTrash2 size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {shifts.length === 0 && (
                                                    <div
                                                        className="text-center text-muted opacity-25"
                                                        style={{ fontSize: 20, cursor: 'pointer' }}
                                                        onClick={() => handleAddShiftToCell(emp._id, d)}
                                                    >
                                                        -
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal - Manager */}
            {showManagerModal && (
                <ShiftManagerModal
                    onClose={() => setShowManagerModal(false)}
                    onShiftUpdated={onRefreshShifts}
                />
            )}

            {/* Modal - Assign */}
            {showAssignModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle} className="animate__animated animate__fadeInUp animate__faster">
                        {/* Header */}
                        <div style={{ ...headerStyle, borderBottom: '2px solid #E6C7E6' }}>
                            <div>
                                <h5 className="m-0 fw-bold" style={{ color: '#663399' }}>Bulk Assign Schedule</h5>
                                <p className="m-0 small" style={{ color: '#A3779D' }}>Assign shifts to multiple employees</p>
                            </div>
                            <button className="btn-close shadow-none" onClick={() => setShowAssignModal(false)}></button>
                        </div>

                        {/* Body - Scrollable */}
                        <div style={{ padding: "30px", flex: 1, overflowY: "auto" }}>
                            <form id="assignForm" onSubmit={handleAssign}>
                                <div className="row g-4">
                                    {/* Date Range */}
                                    <div className="col-md-6">
                                        <label style={{ ...labelStyle, color: '#2E1A47', fontWeight: 'bold' }}>From Date</label>
                                        <input type="date" style={{ ...inputStyle(false), borderColor: '#E6C7E6', borderRadius: '12px' }} value={assignForm.startDate} onChange={e => setAssignForm({ ...assignForm, startDate: e.target.value })} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label style={{ ...labelStyle, color: '#2E1A47', fontWeight: 'bold' }}>To Date</label>
                                        <input type="date" style={{ ...inputStyle(false), borderColor: '#E6C7E6', borderRadius: '12px' }} value={assignForm.endDate} onChange={e => setAssignForm({ ...assignForm, endDate: e.target.value })} required />
                                    </div>

                                    {/* Shift Selection */}
                                    <div className="col-12">
                                        <div style={{ ...sectionTitleStyle, color: '#663399', borderBottom: '1px solid #E6C7E6' }}>Shift Configuration</div>
                                        <div className="d-flex gap-3 mb-4">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="assignType"
                                                    id="typeStandard"
                                                    checked={assignForm.assignmentType === 'fixed' && !assignForm.isManual}
                                                    onChange={() => setAssignForm(f => ({ ...f, assignmentType: 'fixed', isManual: false, shiftId: "" }))}
                                                />
                                                <label className="form-check-label fw-bold small" htmlFor="typeStandard">Standard</label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="assignType"
                                                    id="typeRotation"
                                                    checked={assignForm.assignmentType === 'rotation'}
                                                    onChange={() => setAssignForm(f => ({ ...f, assignmentType: 'rotation', isManual: false, shiftId: "" }))}
                                                />
                                                <label className="form-check-label fw-bold small" htmlFor="typeRotation">Rotation Pattern</label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="assignType"
                                                    id="typeManual"
                                                    checked={assignForm.assignmentType === 'fixed' && assignForm.isManual}
                                                    onChange={() => setAssignForm(f => ({ ...f, assignmentType: 'fixed', isManual: true, shiftId: "manual" }))}
                                                />
                                                <label className="form-check-label fw-bold small" htmlFor="typeManual">Manual Time</label>
                                            </div>
                                        </div>

                                        {assignForm.assignmentType === 'rotation' ? (
                                            <div className="bg-light p-4 rounded-4 mb-3 border" style={{ borderColor: '#E6C7E6' }}>
                                                <div className="mb-3">
                                                    <label className="small fw-bold" style={{ color: '#2E1A47' }}>Rotation Frequency</label>
                                                    <select
                                                        className="form-select w-auto mt-1 border"
                                                        style={{ borderColor: '#E6C7E6', borderRadius: '8px' }}
                                                        value={assignForm.rotationFrequency}
                                                        onChange={e => setAssignForm({ ...assignForm, rotationFrequency: e.target.value })}
                                                    >
                                                        <option value="weekly">Weekly (Change every 7 days)</option>
                                                        <option value="daily">Daily (Change every day)</option>
                                                    </select>
                                                </div>

                                                <label className="small fw-bold" style={{ color: '#2E1A47' }}>Build Pattern Sequence</label>
                                                <div className="d-flex gap-2 mb-2">
                                                    <select
                                                        className="form-select border"
                                                        style={{ maxWidth: 300, borderColor: '#E6C7E6', borderRadius: '8px' }}
                                                        value={assignForm.shiftId}
                                                        onChange={e => setAssignForm({ ...assignForm, shiftId: e.target.value })}
                                                    >
                                                        <option value="">-- Select Shift --</option>
                                                        {availableShifts.map(s => (
                                                            <option key={s._id} value={s._id}>{s.shiftName} ({s.startTime}-{s.endTime})</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        className="btn px-3"
                                                        style={{ backgroundColor: '#663399', color: '#ffffff', borderRadius: '8px' }}
                                                        disabled={!assignForm.shiftId}
                                                        onClick={() => {
                                                            if (assignForm.shiftId) {
                                                                setAssignForm(f => ({
                                                                    ...f,
                                                                    rotationShifts: [...f.rotationShifts, f.shiftId],
                                                                    shiftId: ""
                                                                }));
                                                            }
                                                        }}
                                                    >
                                                        Add to Pattern
                                                    </button>
                                                </div>

                                                <div className="d-flex flex-wrap gap-2 mt-3">
                                                    {assignForm.rotationShifts.map((sid, idx) => {
                                                        const s = availableShifts.find(x => x._id === sid);
                                                        return (
                                                            <div key={idx} className="badge bg-white text-dark border p-2 d-flex align-items-center gap-2 shadow-sm">
                                                                <span className="badge bg-secondary rounded-circle">{idx + 1}</span>
                                                                <span>{s ? s.shiftName : 'Unknown'}</span>
                                                                <button
                                                                    type="button"
                                                                    className="btn-close btn-close-sm"
                                                                    aria-label="Remove"
                                                                    onClick={() => {
                                                                        setAssignForm(f => ({
                                                                            ...f,
                                                                            rotationShifts: f.rotationShifts.filter((_, i) => i !== idx)
                                                                        }));
                                                                    }}
                                                                ></button>
                                                            </div>
                                                        );
                                                    })}
                                                    {assignForm.rotationShifts.length === 0 && (
                                                        <div className="text-muted small fst-italic">No shifts added to pattern yet.</div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : !assignForm.isManual ? (
                                            <select
                                                style={{ ...inputStyle(false), borderColor: '#E6C7E6', borderRadius: '12px' }}
                                                value={assignForm.shiftId}
                                                onChange={e => setAssignForm(f => ({ ...f, shiftId: e.target.value }))}
                                            >
                                                <option value="">-- Choose a Standard Shift --</option>
                                                {availableShifts.map(s => (
                                                    <option key={s._id} value={s._id}>{s.shiftName} ({s.startTime} - {s.endTime})</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="bg-light p-3 rounded-4 mb-3 border" style={{ borderColor: '#E6C7E6' }}>
                                                <div className="row g-2">
                                                    <div className="col-4">
                                                        <label className="small fw-bold" style={{ color: '#2E1A47' }}>Start Time</label>
                                                        <input type="time" className="form-control border" style={{ borderColor: '#E6C7E6', borderRadius: '8px' }} value={assignForm.startTime} onChange={e => setAssignForm({ ...assignForm, startTime: e.target.value })} />
                                                    </div>
                                                    <div className="col-4">
                                                        <label className="small fw-bold" style={{ color: '#2E1A47' }}>End Time</label>
                                                        <input type="time" className="form-control border" style={{ borderColor: '#E6C7E6', borderRadius: '8px' }} value={assignForm.endTime} onChange={e => setAssignForm({ ...assignForm, endTime: e.target.value })} />
                                                    </div>
                                                    <div className="col-4">
                                                        <label className="small fw-bold" style={{ color: '#2E1A47' }}>Type</label>
                                                        <select className="form-select border" style={{ borderColor: '#E6C7E6', borderRadius: '8px' }} value={assignForm.type} onChange={e => setAssignForm({ ...assignForm, type: e.target.value })}>
                                                            <option>Regular</option>
                                                            <option>Overtime</option>
                                                            <option>Morning</option>
                                                            <option>Night</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Employees */}
                                    <div className="col-12">
                                        <div style={{ ...sectionTitleStyle, color: '#663399', borderBottom: '1px solid #E6C7E6' }}>Employees Selection</div>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <label style={{ ...labelStyle, color: '#2E1A47', fontWeight: 'bold' }}>Assign to ({assignForm.employeeIds.length})</label>
                                            <button type="button" className="btn btn-sm btn-link text-decoration-none fw-bold" style={{ color: '#663399' }} onClick={handleSelectAllEmployees}>
                                                {assignForm.employeeIds.length === employees.length ? "Deselect All" : "Select All"}
                                            </button>
                                        </div>

                                        <input
                                            type="text"
                                            style={{ ...inputStyle(false), borderColor: '#E6C7E6', borderRadius: '12px' }}
                                            className="mb-3"
                                            placeholder="Search employees by name or department..."
                                            value={empSearch}
                                            onChange={e => setEmpSearch(e.target.value)}
                                        />

                                        <div className="border rounded shadow-inner bg-light" style={{ maxHeight: '40vh', overflowY: 'auto' }}>
                                            {(() => {
                                                const filtered = employees.filter(e => {
                                                    const fullName = ((e.firstName || '') + ' ' + (e.lastName || '')).toLowerCase();
                                                    const dept = (e.department || '').toLowerCase();
                                                    const term = empSearch.toLowerCase();
                                                    return fullName.includes(term) || dept.includes(term);
                                                });

                                                if (filtered.length === 0) {
                                                    return <div className="text-muted small w-100 text-center py-4">No employees found matching "{empSearch}"</div>;
                                                }

                                                const grouped = filtered.reduce((acc, emp) => {
                                                    const dept = emp.department || 'Unassigned';
                                                    if (!acc[dept]) acc[dept] = [];
                                                    acc[dept].push(emp);
                                                    return acc;
                                                }, {});

                                                return Object.keys(grouped).sort().map(dept => (
                                                    <div key={dept} className="bg-white">
                                                        <div className="p-2 px-3 small fw-bold text-uppercase border-bottom border-top sticky-top" style={{ top: 0, zIndex: 1, backgroundColor: '#fdfbff', color: '#663399' }}>
                                                            {dept} <span className="fw-normal text-muted ms-1">({grouped[dept].length})</span>
                                                        </div>
                                                        {grouped[dept].map(emp => {
                                                            const isSelected = assignForm.employeeIds.includes(emp._id);
                                                            return (
                                                                <div
                                                                    key={emp._id}
                                                                    onClick={() => {
                                                                        setAssignForm(f => {
                                                                            const ids = f.employeeIds.includes(emp._id)
                                                                                ? f.employeeIds.filter(id => id !== emp._id)
                                                                                : [...f.employeeIds, emp._id];
                                                                            return { ...f, employeeIds: ids };
                                                                        });
                                                                    }}
                                                                    className={`d-flex align-items-center p-2 px-3 border-bottom cursor-pointer ${isSelected ? 'bg-primary-subtle' : 'hover-bg-light'}`}
                                                                    style={{ cursor: 'pointer', transition: 'background-color 0.2s', backgroundColor: isSelected ? '#E6C7E6' : undefined }}
                                                                >
                                                                    <div className="form-check m-0 pointer-events-none">
                                                                        <input
                                                                            className="form-check-input"
                                                                            type="checkbox"
                                                                            checked={isSelected}
                                                                            style={{ accentColor: '#663399' }}
                                                                            readOnly
                                                                        />
                                                                    </div>
                                                                    <div className="ms-3">
                                                                        <div className="fw-bold" style={{ color: isSelected ? '#663399' : '#2E1A47' }}>{emp.firstName} {emp.lastName}</div>
                                                                        <div className="small" style={{ color: isSelected ? '#663399' : '#A3779D' }}>{emp.position}</div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div style={{ ...footerStyle, backgroundColor: '#ffffff', borderTop: '1px solid #E6C7E6' }}>
                            <button type="button" className="btn btn-lg px-4" style={{ borderRadius: "12px", fontWeight: 600, border: "1px solid #E6C7E6", color: '#663399' }} onClick={() => setShowAssignModal(false)}>Cancel</button>
                            <button type="submit" form="assignForm" className="btn btn-lg px-5 shadow-sm" style={{ borderRadius: "12px", fontWeight: 600, backgroundColor: '#663399', color: '#ffffff', border: "none" }}>Assign Schedule</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal - Edit Schedule */}
            {editingSchedule && (
                <div style={modalOverlayStyle}>
                    <div style={{ ...modalContentStyle, maxWidth: '600px', maxHeight: 'auto', minHeight: 'auto' }} className="animate__animated animate__fadeInUp animate__faster">
                        {/* Header */}
                        <div style={headerStyle}>
                            <div>
                                <h5 className="m-0 fw-bold">Edit Shift</h5>
                                <p className="m-0 small text-muted">Update shift details</p>
                            </div>
                            <button className="btn-close shadow-none" onClick={() => setEditingSchedule(null)}></button>
                        </div>

                        <div style={{ padding: "30px", flex: 1 }}>
                            <form id="editForm" onSubmit={handleUpdateSchedule}>
                                <div className="mb-4">
                                    <label style={labelStyle}>Shift Mode</label>
                                    <div className="d-flex gap-3">
                                        <div className="form-check">
                                            <input className="form-check-input" type="radio" checked={!editingSchedule.isManual} onChange={() => setEditingSchedule(s => ({ ...s, isManual: false, shiftId: "" }))} />
                                            <label className="form-check-label small fw-bold">Standard Shift</label>
                                        </div>
                                        <div className="form-check">
                                            <input className="form-check-input" type="radio" checked={editingSchedule.isManual} onChange={() => setEditingSchedule(s => ({ ...s, isManual: true, shiftId: "manual" }))} />
                                            <label className="form-check-label small fw-bold">Manual Time</label>
                                        </div>
                                    </div>
                                </div>

                                {!editingSchedule.isManual ? (
                                    <div className="mb-3">
                                        <label style={labelStyle}>Select Shift</label>
                                        <select style={inputStyle(false)} value={editingSchedule.shiftId} onChange={e => setEditingSchedule(s => ({ ...s, shiftId: e.target.value }))} required>
                                            <option value="">-- Select Shift --</option>
                                            {availableShifts.map(sh => (
                                                <option key={sh._id} value={sh._id}>{sh.shiftName} ({sh.startTime}-{sh.endTime})</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="row g-2 mb-3">
                                        <div className="col-6">
                                            <label style={labelStyle}>Start</label>
                                            <input type="time" style={inputStyle(false)} value={editingSchedule.startTime} onChange={e => setEditingSchedule(s => ({ ...s, startTime: e.target.value }))} />
                                        </div>
                                        <div className="col-6">
                                            <label style={labelStyle}>End</label>
                                            <input type="time" style={inputStyle(false)} value={editingSchedule.endTime} onChange={e => setEditingSchedule(s => ({ ...s, endTime: e.target.value }))} />
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>

                        <div style={footerStyle}>
                            <button type="button" className="btn btn-light px-4" style={{ borderRadius: "8px", fontWeight: 600, border: "1px solid #d1d5db" }} onClick={() => setEditingSchedule(null)}>Cancel</button>
                            <button type="submit" form="editForm" className="btn btn-primary px-4" style={{ borderRadius: "8px", fontWeight: 600, background: "#4f46e5", border: "none" }}>Update</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal - Stats */}
            {showStatsModal && (
                <StatsModal
                    startDate={formatDate(datesToDisplay[0])}
                    endDate={formatDate(datesToDisplay[datesToDisplay.length - 1])}
                    onClose={() => setShowStatsModal(false)}
                />
            )}
        </div>
    );
}

function StatsModal({ onClose, startDate, endDate }) { // Modal for displaying stats
    const [stats, setStats] = useState([]);
    const [dates, setDates] = useState({
        start: startDate,
        end: endDate
    });
    const [loading, setLoading] = useState(false);

    // Sync with props initially, but allow override
    useEffect(() => {
        setDates({ start: startDate, end: endDate });
    }, []);

    const loadStats = async () => {
        setLoading(true);
        try {
            const data = await shiftService.getStats({ startDate: dates.start, endDate: dates.end });
            setStats(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, [dates]);

    const handleFilter = (type) => {
        const now = new Date();
        let start, end;

        switch (type) {
            case 'thisMonth':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'prevMonth':
                start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                end = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case 'last6Months':
                start = new Date(now);
                start.setMonth(start.getMonth() - 6);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'thisYear':
                start = new Date(now.getFullYear(), 0, 1);
                end = new Date(now.getFullYear(), 11, 31);
                break;
            default:
                start = new Date(now);
                start.setMonth(start.getMonth() - 1);
                end = new Date(now);
                break;
        }

        // Adjust to locale string yyyy-mm-dd (handle timezone offset manually or just use simple string parts)
        const toDateStr = (d) => {
            const pad = n => n < 10 ? '0' + n : n;
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        };

        setDates({
            start: toDateStr(start),
            end: toDateStr(end)
        });
    };

    return (
        <div style={modalOverlayStyle}>
            <div style={{ ...modalContentStyle, maxWidth: '900px' }} className="animate__animated animate__fadeInUp animate__faster">

                {/* Header */}
                <div style={headerStyle}>
                    <div>
                        <h5 className="m-0 fw-bold">Shift Statistics</h5>
                        <p className="m-0 small text-muted">View breakdown of shifts by employee</p>
                    </div>
                    <button className="btn-close shadow-none" onClick={onClose}></button>
                </div>

                <div style={{ padding: "30px", flex: 1, overflowY: "auto" }}>
                    {/* Quick Filters */}
                    <div className="d-flex flex-wrap gap-2 mb-4">
                        <button className="btn btn-outline-secondary btn-sm" style={{ borderRadius: 6 }} onClick={() => setDates({ start: startDate, end: endDate })}>
                            Current View
                        </button>
                        <button className="btn btn-outline-primary btn-sm" style={{ borderRadius: 6 }} onClick={() => handleFilter('thisMonth')}>
                            This Month
                        </button>
                        <button className="btn btn-outline-primary btn-sm" style={{ borderRadius: 6 }} onClick={() => handleFilter('prevMonth')}>
                            Last Month
                        </button>
                        <button className="btn btn-outline-primary btn-sm" style={{ borderRadius: 6 }} onClick={() => handleFilter('last6Months')}>
                            Last 6 Months
                        </button>
                        <button className="btn btn-outline-primary btn-sm" style={{ borderRadius: 6 }} onClick={() => handleFilter('thisYear')}>
                            This Year
                        </button>
                    </div>

                    <div className="d-flex gap-3 mb-4 align-items-end p-4 bg-light rounded-3 border">
                        <div className="flex-grow-1">
                            <label style={{ ...labelStyle, marginBottom: '0.25rem' }}>From Date</label>
                            <input type="date" style={inputStyle(false)} value={dates.start} onChange={e => setDates({ ...dates, start: e.target.value })} />
                        </div>
                        <div className="flex-grow-1">
                            <label style={{ ...labelStyle, marginBottom: '0.25rem' }}>To Date</label>
                            <input type="date" style={inputStyle(false)} value={dates.end} onChange={e => setDates({ ...dates, end: e.target.value })} />
                        </div>
                        <div className="align-self-end">
                            <button className="btn btn-primary px-4" style={{ height: '42px', fontWeight: 600, background: '#4f46e5', border: 'none' }} onClick={loadStats} disabled={loading}>
                                {loading ? 'Loading...' : 'Refresh'}
                            </button>
                        </div>
                    </div>

                    <div className="table-responsive border rounded-3 overflow-hidden">
                        <table className="table table-hover mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="p-3 border-bottom text-muted small text-uppercase fw-bold">Employee</th>
                                    <th className="p-3 border-bottom text-center text-muted small text-uppercase fw-bold">Total Shifts</th>
                                    <th className="p-3 border-bottom text-center text-muted small text-uppercase fw-bold">Double Shifts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="3" className="text-center p-5 text-muted">Loading statistics...</td></tr>
                                ) : stats.length === 0 ? (
                                    <tr><td colSpan="3" className="text-center p-5 text-muted">No data available for this period</td></tr>
                                ) : (
                                    stats.map((s, i) => (
                                        <tr key={i}>
                                            <td className="p-3 align-middle">
                                                <div className="fw-bold text-dark">{s.employeeName || (s.employee ? `${s.employee.firstName} ${s.employee.lastName}` : 'Unknown')}</div>
                                                <div className="small text-muted">{s.department || (s.employee ? s.employee.department : '')}</div>
                                            </td>
                                            <td className="p-3 align-middle text-center fw-bold text-primary" style={{ fontSize: '1.1em' }}>{s.totalShifts}</td>
                                            <td className="p-3 align-middle text-center">
                                                {s.doubleShifts > 0 ? (
                                                    <span className="badge bg-danger rounded-pill px-3">{s.doubleShifts}</span>
                                                ) : (
                                                    <span className="text-muted opacity-25">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style={footerStyle}>
                    <button className="btn btn-light px-4" style={{ borderRadius: "8px", fontWeight: 600, border: "1px solid #d1d5db" }} onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
