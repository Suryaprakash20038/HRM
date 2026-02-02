import { useState, useEffect } from 'react';
import { FiClock, FiPlay, FiPause, FiLogOut, FiCalendar, FiMapPin, FiCoffee, FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import timeLogService from '../../../services/timeLogService';
import { useAuth } from '../../../context/AuthContext';
import './TimeTracking.css';

const StatusIndicator = ({ status }) => {
    let color = '#CBD5E1';
    let label = 'Ready';
    if (status === 'working') { color = '#22C55E'; label = 'Working'; }
    if (status === 'break') { color = '#F59E0B'; label = 'On Break'; }
    if (status === 'completed') { color = '#3B82F6'; label = 'Clocked Out'; }

    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '6px 14px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }}></span>
            {label}
        </div>
    );
};

export default function TimeTracking() {
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());

    // Live Session State
    const [status, setStatus] = useState('ready');
    const [elapsedTime, setElapsedTime] = useState(0);
    const [sessionStart, setSessionStart] = useState(null);

    // Data State
    const [logs, setLogs] = useState([]);
    const [summary, setSummary] = useState({
        workingDays: 0, presentDays: 0, halfDays: 0, leaveDays: 0, lopDays: 0, regularisationUsed: 0
    });
    const [requests, setRequests] = useState([]); // Pending requests
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showRegModal, setShowRegModal] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [regForm, setRegForm] = useState({ newCheckIn: '', newCheckOut: '', reason: '' });

    // Initial Load
    useEffect(() => {
        if (user) {
            loadDashboardData();
        }
    }, [user]);

    // Clock Tick
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Session Timer
    useEffect(() => {
        let interval;
        if (status === 'working' && sessionStart) {
            interval = setInterval(() => {
                const now = new Date();
                const diff = Math.floor((now - new Date(sessionStart)) / 1000);
                setElapsedTime(diff > 0 ? diff : 0);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [status, sessionStart]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [logsRes, summaryRes, reqsRes] = await Promise.all([
                timeLogService.getMyLogs({ view: 'month' }), // or recent
                timeLogService.getSummary({}),
                timeLogService.getRegularisationRequests()
            ]);

            // Process Logs
            const logList = Array.isArray(logsRes) ? logsRes : (logsRes.data || []);
            setLogs(logList);

            // Process Summary
            const summaryData = summaryRes.data || summaryRes || {};
            setSummary(prev => ({ ...prev, ...summaryData }));

            // Process Requests
            const reqList = Array.isArray(reqsRes) ? reqsRes : (reqsRes.data || []);
            setRequests(reqList);

            // Determine Current Status from Today's Log
            const todayStr = new Date().toDateString();
            const todayRecord = logList.find(l => new Date(l.date).toDateString() === todayStr);

            if (todayRecord) {
                const lastSession = todayRecord.sessions[todayRecord.sessions.length - 1];
                if (lastSession && !lastSession.checkOut) {
                    setStatus('working');
                    setSessionStart(lastSession.checkIn);
                    setElapsedTime(Math.floor((new Date() - new Date(lastSession.checkIn)) / 1000));
                } else if (todayRecord.sessions.length > 0) {
                    // Check if shift just ended or on break logic? 
                    // Simplified: If last session closed, assume 'break' or 'completed' depending on button choice logic. 
                    // We'll set to 'break' if not explicitly completed, but usually system marks completion.
                    // For now, if active session closed, show 'completed' unless we track break state explicitly.
                    // Let's assume 'break' if button clicked, but here from fresh load?
                    // Safe default: Completed if lengthy, Break if short? 
                    // Let's set 'break' so they can Resume or End.
                    setStatus('break');
                }
            }

        } catch (error) {
            console.error(error);
            toast.error("Failed to load time data");
        } finally {
            setLoading(false);
        }
    };

    const handleClockAction = async (action) => {
        try {
            if (action === 'clockIn' || action === 'resume') {
                await timeLogService.checkIn({ employeeId: user._id });
                setStatus('working');
                setSessionStart(new Date());
                toast.success("Clocked In");
            } else {
                await timeLogService.checkOut({ employeeId: user._id });
                setStatus(action === 'break' ? 'break' : 'completed');
                setSessionStart(null);
                setElapsedTime(0);
                toast.success(action === 'break' ? "Break Started" : "Clocked Out");
            }
            loadDashboardData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Action failed");
        }
    };

    const formatDuration = (seconds) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const handleRegulariseClick = (log) => {
        setSelectedLog(log);
        // Pre-fill
        const sess = log.sessions || [];
        const firstIn = sess.length > 0 ? new Date(sess[0].checkIn).toTimeString().slice(0, 5) : '';
        const lastOut = (sess.length > 0 && sess[sess.length - 1].checkOut) ? new Date(sess[sess.length - 1].checkOut).toTimeString().slice(0, 5) : '';

        setRegForm({
            newCheckIn: firstIn,
            newCheckOut: lastOut,
            reason: ''
        });
        setShowRegModal(true);
    };

    const submitRegularisation = async (e) => {
        e.preventDefault();
        try {
            if (summary.regularisationUsed >= 3) {
                toast.error("Regularisation limit exceeded for this month");
                return;
            }

            // Construct Date objects
            const logDate = new Date(selectedLog.date);
            const inTime = new Date(logDate);
            const outTime = new Date(logDate);

            const [inH, inM] = regForm.newCheckIn.split(':');
            const [outH, outM] = regForm.newCheckOut.split(':');

            inTime.setHours(inH, inM, 0);
            outTime.setHours(outH, outM, 0);

            // Handle Cross-Date (Night Shift) - Simple heuristic: if out < in, assume next day
            // Or rely on user to pick dates? Simplified requirement: "Editable check-in and check-out time".
            // Implementation: Assume same day unless user inputs implies next day.
            // For robust UI, better to use full datetime picker, but standard is time picker.
            if (outTime < inTime) {
                outTime.setDate(outTime.getDate() + 1);
            }

            await timeLogService.requestRegularisation({
                employeeId: user._id,
                timeLogId: selectedLog._id,
                date: selectedLog.date,
                newCheckIn: inTime,
                newCheckOut: outTime,
                reason: regForm.reason
            });

            toast.success("Request submitted to Admin");
            setShowRegModal(false);
            loadDashboardData(); // Refresh to update counts/status
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit request");
        }
    };

    return (
        <div className="time-tracking-container">
            {/* Header */}
            <div className="header-row">
                <div>
                    <h2 className="page-title">Time Tracking</h2>
                    <p style={{ color: '#64748b', margin: 0 }}>Manage your daily work schedule</p>
                </div>
                <div className="current-date-badge">
                    <FiCalendar style={{ marginRight: 8 }} />
                    {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Live Session Card */}
            <div className={`main-card ${status}`}>
                <div className="card-content">
                    <div>
                        <div className="digital-clock">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                            <FiMapPin style={{ marginRight: 5 }} /> Office • {user?.position || 'General Shift'}
                        </div>
                        <StatusIndicator status={status} />
                    </div>

                    <div className="timer-ring">
                        <div className="timer-value">
                            {status === 'working' ? formatDuration(elapsedTime) : '00:00:00'}
                        </div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', marginTop: 5, letterSpacing: 1 }}>Session Duration</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {status === 'ready' && (
                            <button className="action-btn btn-success-gradient" onClick={() => handleClockAction('clockIn')}>
                                <FiPlay /> Clock In
                            </button>
                        )}
                        {status === 'working' && (
                            <>
                                <button className="action-btn btn-warning-gradient" onClick={() => handleClockAction('break')}>
                                    <FiCoffee /> Take Break
                                </button>
                                <button className="action-btn btn-danger-gradient" onClick={() => handleClockAction('clockOut')}>
                                    <FiLogOut /> Clock Out
                                </button>
                            </>
                        )}
                        {(status === 'break' || status === 'completed') && (
                            <button className="action-btn btn-primary-gradient" onClick={() => handleClockAction('resume')}>
                                <FiPlay /> {status === 'completed' ? 'Start New Session' : 'Resume Work'}
                            </button>
                        )}
                        {status === 'break' && (
                            <button className="action-btn" style={{ background: '#f1f5f9', color: '#475569' }} onClick={() => handleClockAction('clockOut')}>
                                End Shift
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Monthly Summary */}
            <h5 style={{ fontWeight: 600, color: '#475569', marginBottom: '1rem' }}>Monthly Summary</h5>
            <div className="summary-grid">
                <div className="summary-item">
                    <div className="summary-label">Working Days</div>
                    <div className="summary-value">{summary.workingDays}</div>
                    <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>Total Checked-in</div>
                </div>
                <div className="summary-item">
                    <div className="summary-label">Present</div>
                    <div className="summary-value" style={{ color: '#22c55e' }}>{summary.presentDays}</div>
                    <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>&gt;= 8 Hrs</div>
                </div>
                <div className="summary-item">
                    <div className="summary-label">Half Days</div>
                    <div className="summary-value" style={{ color: '#eab308' }}>{summary.halfDays}</div>
                    <div style={{ fontSize: '0.8rem', color: '#a0aec0' }} title="Approved Leave: Violet, Otherwise: Red">Color coded in logs</div>
                </div>
                <div className="summary-item">
                    <div className="summary-label">Absence / LOP</div>
                    <div className="summary-value" style={{ color: '#ef4444' }}>{summary.lopDays}</div>
                    <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>Includes Late</div>
                </div>
                <div className="summary-item">
                    <div className="summary-label">Regularisations</div>
                    <div className="summary-value" style={{ color: summary.regularisationUsed >= 3 ? '#ef4444' : '#3b82f6' }}>
                        {summary.regularisationUsed} <span style={{ fontSize: '1rem', color: '#cbd5e1' }}>/ 3</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>Monthly Limit</div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="logs-section">
                <div className="table-header">
                    <h5 style={{ fontWeight: 600, color: '#334155', margin: 0 }}>Attendance Log</h5>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn btn-sm btn-outline-secondary">This Month</button>
                        {/* Placeholder for filters */}
                    </div>
                </div>

                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Shift & Mode</th>
                            <th>Attendance Visual</th>
                            <th>Effective Hrs</th>
                            <th>Gross Hrs</th>
                            <th>Status</th>
                            <th>Arrival</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                        ) : logs.length > 0 ? (
                            logs.map(log => {
                                const isToday = new Date(log.date).toDateString() === new Date().toDateString();
                                const isActive = log.sessions && log.sessions.length > 0 && !log.sessions[log.sessions.length - 1].checkOut;

                                // Calculate dynamic values if this is today's active log
                                let displayNetHours = log.netWorkingHours || 0;
                                let displayGrossHours = log.grossWorkingHours || 0;

                                if (isToday && isActive && status === 'working') {
                                    const currentSessionHrs = elapsedTime / 3600;
                                    displayNetHours += currentSessionHrs;
                                    displayGrossHours += currentSessionHrs;
                                }

                                // Round for display
                                const finalNet = parseFloat(displayNetHours.toFixed(2));
                                const finalGross = parseFloat(displayGrossHours.toFixed(2));

                                const pendingReq = requests.find(r => r.timeLog === log._id && r.status === 'Pending');

                                return (
                                    <tr key={log._id}>
                                        <td style={{ fontWeight: 500 }}>
                                            {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.9rem' }}>{log.shift?.shiftName || 'General'}</div>
                                            <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>Office</span>
                                        </td>
                                        <td>
                                            <div className="attendance-bar-bg">
                                                <div
                                                    className={`attendance-bar-fill ${finalNet >= 8 ? 'full' : 'short'}`}
                                                    style={{ width: `${Math.min(100, (finalNet / 8) * 100)}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 600, color: finalNet >= 8 ? '#22c55e' : '#1e293b' }}>
                                            {Math.floor(finalNet)}h {Math.round((finalNet % 1) * 60)}m
                                        </td>
                                        <td style={{ color: '#64748b' }}>{Math.floor(finalGross)}h {Math.round((finalGross % 1) * 60)}m</td>
                                        <td>
                                            {(() => {
                                                if (isActive) return <span className="status-badge" style={{ background: '#dbeafe', color: '#2563eb' }}>Working</span>;

                                                let badgeClass = 'status-absent';
                                                let statusText = log.attendanceStatus;

                                                // Dynamic Status Update for Display
                                                if (finalNet >= 8) { statusText = 'Present'; badgeClass = 'status-present'; }
                                                else if (finalNet >= 4) { statusText = 'Half Day'; badgeClass = 'status-halfday'; }

                                                // Override if backend already set valid status
                                                if (log.attendanceStatus === 'Present') { statusText = 'Present'; badgeClass = 'status-present'; }

                                                return <span className={`status-badge ${badgeClass}`}>{statusText}</span>;
                                            })()}
                                        </td>
                                        <td>
                                            {log.statusFlags?.lateLogin ? (
                                                <span style={{ color: '#ef4444', fontWeight: 500, fontSize: '0.85rem' }}>Late</span>
                                            ) : (
                                                <span style={{ color: '#22c55e', fontSize: '0.85rem' }}>On Time</span>
                                            )}
                                        </td>
                                        <td>
                                            {pendingReq ? (
                                                <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 500 }}>
                                                    <FiClock style={{ marginRight: 4 }} /> Pending
                                                </span>
                                            ) : (
                                                <button
                                                    className="btn btn-sm btn-link"
                                                    style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}
                                                    onClick={() => handleRegulariseClick(log)}
                                                    disabled={summary.regularisationUsed >= 3}
                                                    title={summary.regularisationUsed >= 3 ? "Monthly limit reached" : "Regularise"}
                                                >
                                                    Regularise
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr><td colSpan="8" style={{ textAlign: 'center', color: '#94a3b8' }}>No logs found for this month</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Regularisation Modal */}
            {showRegModal && (
                <div className="modal-overlay">
                    <div className="modal-content-custom">
                        <h4 style={{ margin: '0 0 1.5rem 0', fontWeight: 700 }}>Regularise Attendance</h4>
                        <form onSubmit={submitRegularisation}>
                            <div className="form-group">
                                <label className="form-label">Date</label>
                                <input type="text" className="form-control" value={new Date(selectedLog?.date).toDateString()} disabled style={{ background: '#f8fafc' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">New Check-In</label>
                                    <input
                                        type="time"
                                        className="form-control"
                                        required
                                        value={regForm.newCheckIn}
                                        onChange={e => setRegForm({ ...regForm, newCheckIn: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">New Check-Out</label>
                                    <input
                                        type="time"
                                        className="form-control"
                                        required
                                        value={regForm.newCheckOut}
                                        onChange={e => setRegForm({ ...regForm, newCheckOut: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Reason</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    required
                                    placeholder="Why are you regularising?"
                                    value={regForm.reason}
                                    onChange={e => setRegForm({ ...regForm, reason: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="action-btn" style={{ width: 'auto', background: '#f1f5f9', color: '#64748b' }} onClick={() => setShowRegModal(false)}>Cancel</button>
                                <button type="submit" className="action-btn btn-primary-gradient" style={{ width: 'auto' }}>Submit Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
