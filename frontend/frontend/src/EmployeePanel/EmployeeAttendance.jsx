import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaHistory, FaCheckCircle, FaTimesCircle, FaClock, FaCheck, FaExclamationTriangle, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import attendanceService from "../services/attendanceService";
import { leaveService } from "../services/leaveService";
import { useAuth } from "../context/AuthContext";

// ===============================
// 🌟 DESIGN CONSTANTS 🌟
// ===============================
import { EMP_THEME, COMMON_STYLES } from "./theme";

// ===============================
// 🌟 DESIGN CONSTANTS 🌟
// ===============================
const PRIMARY_BLUE = EMP_THEME.royalAmethyst; // Replaced Blue with Theme Primary
const SECONDARY_PURPLE = EMP_THEME.softViolet;
const BACKGROUND_LIGHT = EMP_THEME.lilacMist; // Updated background
const CARD_WHITE = EMP_THEME.white;
const ACCENT_TEXT = EMP_THEME.midnightPlum;
const SUBTLE_TEXT = EMP_THEME.softViolet;
const BORDER_COLOR = EMP_THEME.lilacMist;
const SUCCESS_GREEN = "#10B981"; // Keep semantic colors
const DANGER_RED = "#EF4444";
const WARNING_YELLOW = "#F59E0B";

// --- Utility function for time/date formatting ---
const formatTime = (date) => {
    if (!date) return "--:--";
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return days;
};

const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
};

const EmployeeAttendance = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [historyData, setHistoryData] = useState([]);
    const [summary, setSummary] = useState({
        present: 0,
        absent: 0,
        leaves: 0,
        late: 0
    });
    const [selectedDate, setSelectedDate] = useState(new Date());

    const handleMonthChange = (offset) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setSelectedDate(newDate);
    };

    const calculateStatus = (day, today, attendanceRecords, leaveRecords) => {
        // If Future
        if (day > today) return "Upcoming";

        // Check Attendance
        const att = attendanceRecords.find(r => isSameDay(new Date(r.date), day));

        // Check Leave
        const leave = leaveRecords.find(l => {
            const start = new Date(l.startDate);
            const end = new Date(l.endDate);
            // Reset hours for comparison to be safe
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            const checkDay = new Date(day);
            checkDay.setHours(12, 0, 0, 0); // Mid-day
            return checkDay >= start && checkDay <= end && l.status === 'Approved';
        });

        if (att) return { status: "Present", data: att };
        if (leave) return { status: "Leave", data: leave, leaveType: leave.leaveType };

        const dayOfWeek = day.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) return "Weekend";

        if (isSameDay(day, today)) return "Today"; // Not yet marked

        return "Absent"; // Past working day with no record
    };

    const fetchAttendanceHistory = async () => {
        try {
            setLoading(true);
            setLoading(true);
            const today = new Date(); // Keep today for checking future/past status logic

            const year = selectedDate.getFullYear();
            const month = selectedDate.getMonth();

            const firstDay = new Date(year, month, 1).toISOString();
            const lastDay = new Date(year, month + 1, 0).toISOString();

            const attendanceRes = await attendanceService.getAttendance({
                startDate: firstDay,
                endDate: lastDay
            });
            const attendanceRecords = attendanceRes.attendance || [];

            const leaveRes = await leaveService.getLeaves({
                employeeId: user?._id || user?.id,
                startDate: firstDay,
                endDate: lastDay
            });
            const leaveRecords = leaveRes?.data?.leaves || leaveRes?.leaves || [];

            const daysInMonth = getDaysInMonth(year, month);

            // Filter out future days immediately
            const relevantDays = daysInMonth.filter(day => day <= today);

            let presentCount = 0;
            let absentCount = 0;
            let leaveCount = 0;

            const history = relevantDays.map(day => {
                const statusResult = calculateStatus(day, today, attendanceRecords, leaveRecords);

                let item = { date: day };

                if (typeof statusResult === 'string') {
                    item.status = statusResult;
                } else {
                    item.status = statusResult.status;
                    if (statusResult.data) {
                        item.checkIn = statusResult.data.checkIn;
                        item.checkOut = statusResult.data.checkOut;
                        item.leaveType = statusResult.leaveType;
                    }
                }

                // Stats calc (excluding today if pending)
                if (item.status === 'Present') presentCount++;
                if (item.status === 'Absent') absentCount++;
                if (item.status === 'Leave') leaveCount++;

                return item;
            }).reverse();

            setHistoryData(history);
            setSummary({ present: presentCount, absent: absentCount, leaves: leaveCount, late: 0 });

        } catch (error) {
            console.error("Error fetching attendance history:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchAttendanceHistory();
        }
    }, [user, selectedDate]);

    const getStatusBadge = (item) => {
        const style = { padding: "6px 12px", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "6px" };
        switch (item.status) {
            case "Present":
                return <span style={{ ...style, background: "#D1FAE5", color: "#065F46" }}><FaCheckCircle /> Present</span>;
            case "Absent":
                return <span style={{ ...style, background: "#FEE2E2", color: "#991B1B" }}><FaTimesCircle /> Absent</span>;
            case "Leave":
                return <span style={{ ...style, background: "#FEF3C7", color: "#92400E" }}><FaExclamationTriangle /> {item.leaveType || "Leave"}</span>;
            case "Weekend":
                return <span style={{ ...style, background: "#F3F4F6", color: "#4B5563" }}>Weekend</span>;
            case "Today":
                return <span style={{ ...style, background: "#DBEAFE", color: "#1E40AF" }}><FaClock /> Processing</span>;
            default:
                return <span>-</span>;
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: BACKGROUND_LIGHT,
            padding: "30px",
            fontFamily: "'Inter', sans-serif",
            color: ACCENT_TEXT
        }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5"
                >
                    <h1 className="fw-bold mb-2" style={{ color: ACCENT_TEXT, fontSize: "2rem" }}>Attendance History</h1>
                    <p style={{ color: SUBTLE_TEXT }}>Overview of your attendance for this month.</p>
                </motion.div>

                {/* Summary Cards */}
                <div className="row g-4 mb-5">
                    <div className="col-md-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="p-4 rounded-4 shadow-sm"
                            style={{ background: `linear-gradient(135deg, ${SUCCESS_GREEN} 0%, #059669 100%)`, color: "white" }}
                        >
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="mb-1" style={{ opacity: 0.9 }}>Present Days</p>
                                    <h2 className="fw-bold mb-0">{summary.present}</h2>
                                </div>
                                <div style={{ background: "rgba(255,255,255,0.2)", padding: "12px", borderRadius: "12px" }}>
                                    <FaCheck size={24} />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                    <div className="col-md-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="p-4 rounded-4 shadow-sm"
                            style={{ background: `linear-gradient(135deg, ${DANGER_RED} 0%, #B91C1C 100%)`, color: "white" }}
                        >
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="mb-1" style={{ opacity: 0.9 }}>Absent Days</p>
                                    <h2 className="fw-bold mb-0">{summary.absent}</h2>
                                </div>
                                <div style={{ background: "rgba(255,255,255,0.2)", padding: "12px", borderRadius: "12px" }}>
                                    <FaTimesCircle size={24} />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                    <div className="col-md-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="p-4 rounded-4 shadow-sm"
                            style={{ background: `linear-gradient(135deg, ${WARNING_YELLOW} 0%, #D97706 100%)`, color: "white" }}
                        >
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="mb-1" style={{ opacity: 0.9 }}>Leaves Taken</p>
                                    <h2 className="fw-bold mb-0">{summary.leaves}</h2>
                                </div>
                                <div style={{ background: "rgba(255,255,255,0.2)", padding: "12px", borderRadius: "12px" }}>
                                    <FaCalendarAlt size={24} />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* History Table */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="card border-0 shadow-sm"
                    style={{ borderRadius: "20px", overflow: "hidden" }}
                >
                    <div className="card-header bg-white border-0 py-4 px-4">
                        <div className="d-flex justify-content-between align-items-center w-100">
                            <h5 className="fw-bold mb-0 text-dark d-flex align-items-center">
                                <FaHistory className="me-2 text-primary" />
                                Attendance History
                            </h5>
                            <div className="d-flex align-items-center gap-2 bg-light rounded-pill px-3 py-1 border">
                                <button className="btn btn-sm btn-link text-decoration-none text-secondary p-0" onClick={() => handleMonthChange(-1)}>
                                    <FaChevronLeft />
                                </button>
                                <span className="fw-bold text-dark mx-2" style={{ minWidth: '120px', textAlign: 'center' }}>
                                    {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </span>
                                <button
                                    className="btn btn-sm btn-link text-decoration-none text-secondary p-0"
                                    onClick={() => handleMonthChange(1)}
                                    disabled={selectedDate.getMonth() === new Date().getMonth() && selectedDate.getFullYear() === new Date().getFullYear()}
                                >
                                    <FaChevronRight />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="px-4 py-3 border-0 text-secondary fw-bold text-uppercase small">Date</th>
                                    <th className="px-4 py-3 border-0 text-secondary fw-bold text-uppercase small">Status</th>
                                    <th className="px-4 py-3 border-0 text-secondary fw-bold text-uppercase small">Check In</th>
                                    <th className="px-4 py-3 border-0 text-secondary fw-bold text-uppercase small">Check Out</th>
                                    <th className="px-4 py-3 border-0 text-secondary fw-bold text-uppercase small">Working Hrs</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : historyData.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">
                                            No attendance records found.
                                        </td>
                                    </tr>
                                ) : (
                                    historyData.map((item, i) => {
                                        let hours = "--";
                                        if (item.checkIn && item.checkOut) {
                                            const diff = new Date(item.checkOut) - new Date(item.checkIn);
                                            const h = Math.floor(diff / (1000 * 60 * 60));
                                            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                            hours = `${h}h ${m}m`;
                                        }

                                        return (
                                            <tr key={i} style={{ borderBottom: `1px solid rgba(163, 119, 157, 0.2)` }}>
                                                <td className="px-4 py-3">
                                                    <div className="fw-bold" style={{ color: ACCENT_TEXT }}>
                                                        {new Date(item.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                                    </div>
                                                    <div className="small text-muted">
                                                        {new Date(item.date).toLocaleDateString(undefined, { weekday: 'long' })}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {getStatusBadge(item)}
                                                </td>
                                                <td className="px-4 py-3 font-monospace text-secondary">
                                                    {item.checkIn ? formatTime(item.checkIn) : "--:--"}
                                                </td>
                                                <td className="px-4 py-3 font-monospace text-secondary">
                                                    {item.checkOut ? formatTime(item.checkOut) : "--:--"}
                                                </td>
                                                <td className="px-4 py-3 font-monospace text-secondary fw-bold">
                                                    {hours}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div >
                </motion.div >
            </div >
        </div >
    );
};

export default EmployeeAttendance;
