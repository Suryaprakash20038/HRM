import React, { useState, useEffect } from 'react';
import timeLogService from '../../services/timeLogService';
import { FiChevronDown, FiChevronUp, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function TimeManagement() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [viewMode, setViewMode] = useState('recent'); // 'recent' | 'all'

    useEffect(() => {
        fetchLogs();
    }, [viewMode]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = { view: viewMode };
            const response = await timeLogService.getAllLogs(params);
            if (response && response.data) {
                setLogs(response.data);
            } else if (Array.isArray(response)) {
                setLogs(response);
            } else {
                setLogs([]);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch time logs');
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const exportToExcel = () => {
        if (logs.length === 0) {
            toast.error('No data to export');
            return;
        }
        // Flatten data for export
        const dataToExport = logs.map(log => ({
            Employee: `${log.employee?.firstName || ''} ${log.employee?.lastName || ''}`,
            Date: new Date(log.date).toLocaleDateString(),
            ShiftIn: log.shiftSnapshot?.startTime || '-',
            ShiftOut: log.shiftSnapshot?.endTime || '-',
            FirstCheckIn: log.sessions[0]?.checkIn ? new Date(log.sessions[0].checkIn).toLocaleTimeString() : '-',
            LastCheckOut: (log.sessions.length > 0 && log.sessions[log.sessions.length - 1].checkOut) ? new Date(log.sessions[log.sessions.length - 1].checkOut).toLocaleTimeString() : '-',
            ProperCheckIn: log.statusFlags?.properCheckIn ? 'Yes' : 'No',
            ProperCheckOut: (log.sessions.length > 0 && !log.sessions[log.sessions.length - 1].checkOut) ? '-' : (log.statusFlags?.properCheckOut ? 'Yes' : 'No'),
            TotalSessions: log.sessions.length,
            TotalHours: log.totalWorkingHours,
            AttendanceStatus: log.totalWorkingHours >= 8 ? 'Present' : (log.totalWorkingHours >= 4 ? 'Half Day' : 'Absent')
        }));

        // CSV Convert
        const headers = Object.keys(dataToExport[0]).join(',');
        const rows = dataToExport.map(obj => Object.values(obj).map(v => `"${v}"`).join(',')); // Quote values
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "time_management_report.csv");
        document.body.appendChild(link);
        link.click();
    };

    // Status Badge Helper
    const StatusBadge = ({ success, label }) => (
        <span className={`badge px-2 py-1`} style={{
            backgroundColor: success ? '#E6C7E6' : '#FEE2E2',
            color: success ? '#663399' : '#DC2626',
            border: success ? '1px solid #66339940' : '1px solid #DC262640'
        }}>
            {label}
        </span>
    );

    return (
        <div className="container-fluid py-4 time-management-page" style={{ paddingBottom: 100 }}>
            <style>{`
                .time-management-page {
                    background-color: #ffffff;
                    background-image:
                        radial-gradient(at 0% 0%, rgba(102, 51, 153, 0.05) 0px, transparent 50%),
                        radial-gradient(at 100% 0%, rgba(163, 119, 157, 0.05) 0px, transparent 50%);
                    min-height: 100vh;
                }
            `}</style>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold" style={{ color: '#2E1A47' }}>Time Management</h2>
                <div className="d-flex gap-2">
                    <div className="btn-group" role="group">
                        <button
                            type="button"
                            className="btn"
                            style={{
                                backgroundColor: viewMode === 'recent' ? '#663399' : 'transparent',
                                color: viewMode === 'recent' ? '#ffffff' : '#663399',
                                border: '1px solid #663399',
                                fontWeight: 600
                            }}
                            onClick={() => setViewMode('recent')}
                        >
                            Recent (48h)
                        </button>
                        <button
                            type="button"
                            className="btn"
                            style={{
                                backgroundColor: viewMode === 'all' ? '#663399' : 'transparent',
                                color: viewMode === 'all' ? '#ffffff' : '#663399',
                                border: '1px solid #663399',
                                fontWeight: 600
                            }}
                            onClick={() => setViewMode('all')}
                        >
                            History
                        </button>
                    </div>
                    <button className="btn" style={{ backgroundColor: '#663399', color: '#ffffff', fontWeight: 600 }} onClick={exportToExcel}>
                        <FiDownload className="me-2" /> Export
                    </button>
                </div>
            </div>

            <div className="card border-0 shadow-sm" style={{ borderRadius: 24, border: '1px solid #E6C7E6' }}>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead style={{ backgroundColor: '#f8fafc' }}>
                            <tr className="small text-uppercase">
                                <th className="ps-4 py-4 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Employee</th>
                                <th className="py-4 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Date</th>
                                <th className="py-4 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Shift</th>
                                <th className="py-4 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Proper Check-In</th>
                                <th className="py-4 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Proper Check-Out</th>
                                <th className="text-center py-4 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Sessions</th>
                                <th className="text-center py-4 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Total Hours</th>
                                <th className="py-4 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan="8" className="text-center py-4">Loading...</td></tr> :
                                logs.length > 0 ? (
                                    logs.map(log => (
                                        <React.Fragment key={log._id}>
                                            <tr style={{ cursor: 'pointer' }} onClick={() => toggleExpand(log._id)}>
                                                <td className="ps-4 fw-bold" style={{ color: '#2E1A47' }}>
                                                    {log.employee?.firstName} {log.employee?.lastName}
                                                </td>
                                                <td style={{ color: '#A3779D', fontWeight: 500 }}>{new Date(log.date).toLocaleDateString()}</td>
                                                <td><span className="badge border" style={{ backgroundColor: '#ffffff', color: '#663399', borderColor: '#E6C7E6' }}>{log.shift?.shiftName || 'Default'}</span></td>
                                                <td>
                                                    <StatusBadge success={log.statusFlags?.properCheckIn} label={log.statusFlags?.properCheckIn ? 'Yes' : 'No'} />
                                                    {log.statusFlags?.lateLogin && <span className="ms-1 badge" style={{ fontSize: '0.7em', backgroundColor: '#FEF3C7', color: '#D97706' }}>Late</span>}
                                                </td>
                                                <td>
                                                    {log.sessions && log.sessions.length > 0 && !log.sessions[log.sessions.length - 1].checkOut ? (
                                                        <span className="fw-bold" style={{ fontSize: '1.2em', paddingLeft: '10px', color: '#A3779D' }}>-</span>
                                                    ) : (
                                                        <>
                                                            <StatusBadge success={log.statusFlags?.properCheckOut} label={log.statusFlags?.properCheckOut ? 'Yes' : 'No'} />
                                                            {log.statusFlags?.earlyLogout && <span className="ms-1 badge" style={{ fontSize: '0.7em', backgroundColor: '#FEE2E2', color: '#DC2626' }}>Early</span>}
                                                            {log.statusFlags?.lateLogout && <span className="ms-1 badge" style={{ fontSize: '0.7em', backgroundColor: '#E0F2FE', color: '#0284C7' }}>Late</span>}
                                                            {log.statusFlags?.autoLogout && <span className="ms-1 badge" style={{ fontSize: '0.7em', backgroundColor: '#f8fafc', color: '#663399', border: '1px solid #E6C7E6' }}>Auto</span>}
                                                        </>
                                                    )}
                                                </td>
                                                <td className="text-center">{log.sessions?.length || 0}</td>
                                                <td className="text-center fw-bold" style={{ color: '#2E1A47' }}>
                                                    {(() => {
                                                        let totalH = log.totalWorkingHours || 0;
                                                        // Check for active session
                                                        const lastSess = log.sessions[log.sessions.length - 1];
                                                        if (lastSess && !lastSess.checkOut) {
                                                            const diff = new Date().getTime() - new Date(lastSess.checkIn).getTime();
                                                            totalH += (diff / (1000 * 60 * 60));
                                                        }
                                                        return `${Math.floor(totalH)}h ${Math.round((totalH % 1) * 60)}m`;
                                                    })()}
                                                </td>
                                                <td>
                                                    <button className="btn btn-sm" style={{ backgroundColor: '#E6C7E6', color: '#663399', borderRadius: '50%' }}>
                                                        {expandedId === log._id ? <FiChevronUp /> : <FiChevronDown />}
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedId === log._id && (
                                                <tr className="bg-light">
                                                    <td colSpan="8" className="p-4">
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <h6 className="fw-bold mb-3" style={{ color: '#663399' }}>Session Details</h6>
                                                                <div className="table-responsive bg-white rounded-3 shadow-sm p-3 border" style={{ borderColor: '#E6C7E6' }}>
                                                                    <table className="table table-sm mb-0">
                                                                        <thead>
                                                                            <tr style={{ color: '#A3779D' }} className="small">
                                                                                <th>In</th>
                                                                                <th>Out</th>
                                                                                <th>Duration</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {log.sessions.map((sess, idx) => {
                                                                                // Calculate live duration if active
                                                                                let duration = sess.duration;
                                                                                if (!sess.checkOut && !duration) {
                                                                                    const diff = new Date().getTime() - new Date(sess.checkIn).getTime();
                                                                                    duration = Math.floor(diff / 60000);
                                                                                }
                                                                                return (
                                                                                    <tr key={idx}>
                                                                                        <td className="fw-medium" style={{ color: '#2E1A47' }}>{new Date(sess.checkIn).toLocaleTimeString()}</td>
                                                                                        <td>{sess.checkOut ? <span style={{ color: '#2E1A47' }}>{new Date(sess.checkOut).toLocaleTimeString()}</span> : <span className="badge" style={{ backgroundColor: '#E6C7E6', color: '#663399' }}>Active</span>}</td>
                                                                                        <td style={{ color: '#663399', fontWeight: 600 }}>{duration} min</td>
                                                                                    </tr>
                                                                                )
                                                                            })}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <h6 className="fw-bold mb-3" style={{ color: '#663399' }}>Shift & Status Analysis</h6>
                                                                <ul className="list-group shadow-sm border-0">
                                                                    <li className="list-group-item border-0 d-flex justify-content-between align-items-center bg-transparent border-bottom" style={{ borderColor: '#E6C7E6' }}>
                                                                        <span style={{ color: '#A3779D' }}>Assigned Shift</span>
                                                                        <span className="fw-bold" style={{ color: '#663399' }}>{log.shift?.shiftName || 'Default Profile Shift'}</span>
                                                                    </li>
                                                                    <li className="list-group-item border-0 d-flex justify-content-between align-items-center">
                                                                        <span className="text-muted">Shift Time</span>
                                                                        <span className="fw-medium">{log.shiftSnapshot?.startTime || 'N/A'} - {log.shiftSnapshot?.endTime || 'N/A'}</span>
                                                                    </li>
                                                                    <li className="list-group-item border-0 d-flex justify-content-between align-items-center">
                                                                        <span className="text-muted">Grace Time</span>
                                                                        <span>{log.shiftSnapshot?.graceTime || 0} mins</span>
                                                                    </li>
                                                                    <li className="list-group-item border-0 d-flex justify-content-between align-items-center">
                                                                        <span className="text-muted">Late Login</span>
                                                                        <span className={log.statusFlags?.lateLogin ? 'text-danger fw-bold' : 'text-success'}>
                                                                            {log.statusFlags?.lateLogin ? 'Yes' : 'No'}
                                                                        </span>
                                                                    </li>
                                                                    <li className="list-group-item border-0 d-flex justify-content-between align-items-center">
                                                                        <span className="text-muted">Early Logout</span>
                                                                        {log.sessions && log.sessions.length > 0 && !log.sessions[log.sessions.length - 1].checkOut ? (
                                                                            <span className="fw-medium text-muted">-</span>
                                                                        ) : (
                                                                            <span className={log.statusFlags?.earlyLogout ? 'text-danger fw-bold' : 'text-success'}>
                                                                                {log.statusFlags?.earlyLogout ? 'Yes' : 'No'}
                                                                            </span>
                                                                        )}
                                                                    </li>
                                                                    <li className="list-group-item border-0 d-flex justify-content-between align-items-center">
                                                                        <span className="text-muted">Late Logout</span>
                                                                        {log.sessions && log.sessions.length > 0 && !log.sessions[log.sessions.length - 1].checkOut ? (
                                                                            <span className="fw-medium text-muted">-</span>
                                                                        ) : (
                                                                            <span className={log.statusFlags?.lateLogout ? 'text-info fw-bold' : 'text-muted'}>
                                                                                {log.statusFlags?.lateLogout ? 'Yes' : 'No'}
                                                                            </span>
                                                                        )}
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))) : (
                                    <tr><td colSpan="8" className="text-center py-4 text-muted">No records found</td></tr>
                                )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
