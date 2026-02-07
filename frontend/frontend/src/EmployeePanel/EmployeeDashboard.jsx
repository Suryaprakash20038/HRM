import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    FaCalendarCheck, FaClock, FaBullhorn,
    FaTasks, FaUserClock, FaCheckCircle,
    FaArrowUp, FaArrowDown, FaCalendarAlt, FaClipboardList
} from "react-icons/fa";
import toast from "react-hot-toast";
import attendanceService from "../services/attendanceService";
import timeLogService from "../services/timeLogService"; // Import timeLogService
import { leaveService } from "../services/leaveService";
import announcementService from "../services/announcementService";
import taskService from "../services/taskService";
import shiftService from "../services/shiftService"; // Import shift service
import { useAuth } from "../context/AuthContext";
import api from "../services/api"; // Importing api for holidays
import resignationService from "../services/resignationService"; // Import resignation service
import { useNavigate } from "react-router-dom";
import bannerImg from "../assets/avathar.png";
import { Search, Bell, Mail, ChevronDown, CheckCircle, Wallet, TrendingUp, TrendingDown, Users, Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, LayoutGrid, Plus, FileText, X } from "lucide-react";
import { getTeamReports } from "../services/dailyReportService";

import { EMP_THEME } from "./theme";

// ===============================
// 🌟 DESIGN CONSTANTS 🌟
// ===============================
const PRIMARY_PURPLE = EMP_THEME.royalAmethyst;    // Royal Amethyst
const SECONDARY_PURPLE = EMP_THEME.softViolet;  // Soft Violet
const BACKGROUND_LIGHT = EMP_THEME.lilacMist;  // Lilac Mist - Light background
const DARK_PURPLE = EMP_THEME.midnightPlum;       // Midnight Plum
const CARD_WHITE = EMP_THEME.white;
const ACCENT_TEXT = EMP_THEME.midnightPlum;       // Midnight Plum for text
const SUBTLE_TEXT = EMP_THEME.softViolet;       // Soft Violet for secondary text
const BORDER_COLOR = EMP_THEME.lilacMist;      // Lilac Mist for borders

// --- Utility function for time/date formatting ---
const formatTime = (date) => {
    if (!date) return "--:--";
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

// --- Reusable Info Card Component ---
const InfoCard = ({ label, value, icon: Icon, color, bgColor, delay, onClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay }}
            className="col-md-6 col-lg-3"
        >
            <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                className="p-4 rounded-[20px] cursor-pointer relative overflow-hidden group transition-all duration-300 shadow-lg hover:shadow-2xl h-100"
                onClick={onClick}
                style={{
                    backgroundColor: PRIMARY_PURPLE,
                    border: `1px solid ${SECONDARY_PURPLE}33`,
                    boxShadow: `0 4px 20px ${PRIMARY_PURPLE}26`
                }}
            >
                <div className="flex justify-between items-start z-10 relative">
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold opacity-75 uppercase tracking-[0.15em] text-white/70 leading-tight">{label}</span>
                        <h3 className="text-2xl font-extrabold tracking-tight stats-number text-white" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>{value}</h3>
                    </div>

                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg ml-auto" style={{ backgroundColor: SECONDARY_PURPLE, boxShadow: `0 4px 12px ${SECONDARY_PURPLE}4d` }}>
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                </div>

                {/* Subtle shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </motion.div>
        </motion.div>
    );
};

const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
};

// --- Main Component ---
const EmployeeDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // State
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [checkInTime, setCheckInTime] = useState(null);
    const [isCheckedOut, setIsCheckedOut] = useState(false);
    const [checkOutTime, setCheckOutTime] = useState(null);
    const [loading, setLoading] = useState(true);

    const [recentAnnouncements, setRecentAnnouncements] = useState([]);
    const [upcomingHolidays, setUpcomingHolidays] = useState([]);
    const [todayShift, setTodayShift] = useState(null); // State for shift
    const [weeklySchedule, setWeeklySchedule] = useState([]); // State for weekly schedule
    const [defaultShift, setDefaultShift] = useState(null); // State for default shift

    // Check Out Modal State
    const [showCheckOutModal, setShowCheckOutModal] = useState(false);
    const [manualTime, setManualTime] = useState("");

    // Late Login Modal State
    const [showLateModal, setShowLateModal] = useState(false);
    const [lateReason, setLateReason] = useState("");
    const [hasPermission, setHasPermission] = useState(false);

    // Team Reports State (For TL/Manager)
    const [showReportsModal, setShowReportsModal] = useState(false);
    const [teamReports, setTeamReports] = useState([]);
    const [loadingReports, setLoadingReports] = useState(false);
    const [reportFilters, setReportFilters] = useState({ days: 7, search: '' });
    const [selectedReport, setSelectedReport] = useState(null);

    const isApprover = React.useMemo(() => {
        if (!user) return false;
        const role = (user.role || '').toLowerCase();
        const pos = (user.position || '').toLowerCase();
        return ['teamlead', 'manager', 'admin', 'hr'].includes(role) ||
            pos.includes('manager') || pos.includes('lead') || pos.includes('tl');
    }, [user]);

    // Simplified stats state
    const [stats, setStats] = useState([
        { label: "Present Days", value: "0", icon: FaCalendarCheck, color: PRIMARY_PURPLE, bgColor: BACKGROUND_LIGHT },
        { label: "Pending Tasks", value: "0", icon: FaTasks, color: SECONDARY_PURPLE, bgColor: BACKGROUND_LIGHT },
        { label: "Hours Worked", value: "0", icon: FaUserClock, color: DARK_PURPLE, bgColor: BACKGROUND_LIGHT },
        { label: "Leaves Taken", value: "0", icon: FaClipboardList, color: PRIMARY_PURPLE, bgColor: BACKGROUND_LIGHT },
    ]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        // Initial fetch
        fetchDashboardData();

        // Optional: Poll every minute for updates (good for shift changes)
        const pollTimer = setInterval(fetchDashboardData, 60000);

        return () => {
            clearInterval(timer);
            clearInterval(pollTimer);
        };
    }, []);


    // --- Fetch Data Logic ---
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth();

            // 1. Fetch Time Logs (Current Day Status)
            // Initialize counters for stats calculation later
            let totalHours = 0;
            let presentCount = 0;

            try {
                // We use timeLogService to check specific session status
                // But passing employee ID might be redundant if backend uses req.user
                // Let's rely on getMyLogs which generally fetches for the logged in user
                const logsRes = await timeLogService.getMyLogs();
                const logs = logsRes.data || logsRes || [];

                // Find today's log
                const todayLog = logs.find(log => isSameDay(new Date(log.date), today));

                if (todayLog && todayLog.sessions && todayLog.sessions.length > 0) {
                    const lastSession = todayLog.sessions[todayLog.sessions.length - 1];

                    if (!lastSession.checkOut) {
                        // Currently Checked In
                        setIsCheckedIn(true);
                        setCheckInTime(lastSession.checkIn);
                        setIsCheckedOut(false);
                        setCheckOutTime(null);
                    } else {
                        // Currently Checked Out (but can check in again)
                        setIsCheckedIn(false);
                        setCheckInTime(todayLog.sessions[0].checkIn); // Show first checkin time for reference
                        setIsCheckedOut(true); // This just means "Not currently in"
                        setCheckOutTime(lastSession.checkOut);
                    }
                } else {
                    // No logs today
                    setIsCheckedIn(false);
                    setIsCheckedOut(false);
                    setCheckInTime(null);
                    setCheckOutTime(null);
                }

                // Calculate total hours from logs for stats
                logs.forEach(log => {
                    const logDate = new Date(log.date);
                    if (logDate.getMonth() === month && logDate.getFullYear() === year) {
                        let hours = log.totalWorkingHours || 0;

                        // If it's today and there is an active session, add the duration so far
                        if (isSameDay(logDate, today) && log.sessions && log.sessions.length > 0) {
                            const lastSess = log.sessions[log.sessions.length - 1];
                            if (!lastSess.checkOut) {
                                const diff = new Date().getTime() - new Date(lastSess.checkIn).getTime();
                                hours += (diff / (1000 * 60 * 60));
                            }
                        }

                        // Count as present if hours > 0 or if it is today (implied by log existence)
                        if (hours > 0 || isSameDay(logDate, today)) {
                            totalHours += hours;
                            presentCount++;
                        }
                    }
                });

            } catch (err) {
                console.error("Time Log fetch error", err);
            }

            // 2. Fetch Tasks Statistics
            let pendingTasksCount = "0";
            if (user?.employeeProfileId) {
                try {
                    const tasksRes = await taskService.getMyTasks({});
                    if (tasksRes.success && tasksRes.data?.statistics) {
                        const taskStats = tasksRes.data.statistics;
                        // Calculate pending as Total - Completed
                        const pending = (taskStats.total || 0) - (taskStats.completed || 0);
                        pendingTasksCount = pending.toString();
                    }
                } catch (taskError) {
                    console.error("Task stats fetch error:", taskError);
                }
            }

            // 3. Fetch Leaves
            let leavesTaken = "0";
            if (user?._id) {
                try {
                    // Fetching all leaves for the employee to count approved ones
                    const leavesRes = await leaveService.getLeaves({ employeeId: user._id, limit: 1000 });
                    if (leavesRes.data?.data?.leaves) {
                        const approvedLeaves = leavesRes.data.data.leaves.filter(l => l.status === 'Approved');
                        // Sum up the total days of approved leaves
                        const totalDaysTaken = approvedLeaves.reduce((acc, curr) => acc + (curr.totalDays || 0), 0);
                        leavesTaken = totalDaysTaken.toString();
                    }
                } catch (leaveError) {
                    console.error("Leave fetch error:", leaveError);
                }
            }

            // 4. Fetch Announcements
            try {
                // Fetch announcements - filtered for employee relevance
                const announcementsRes = await announcementService.getEmployeeAnnouncements({
                    page: 1,
                    limit: 3,
                    department: user?.department
                });
                // Handles different response structures if needed, defaulting to empty array
                setRecentAnnouncements(announcementsRes.announcements || announcementsRes || []);
            } catch (annError) {
                console.error("Announcements fetch error:", annError);
            }

            // 5. Fetch Holidays (Upcoming)
            try {
                const holidaysRes = await api.get(`/holidays?year=${year}`);
                if (holidaysRes.data?.status === 'success') {
                    const allHolidays = holidaysRes.data.data.holidays || [];
                    const todayStr = new Date().toISOString().split('T')[0];
                    const next = allHolidays
                        .filter(h => new Date(h.date).toISOString().split('T')[0] >= todayStr)
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .slice(0, 3);
                    setUpcomingHolidays(next);
                }
            } catch (holError) {
                console.error("Holidays fetch error:", holError);
            }

            // 6. Fetch Today's Shift
            try {
                const shiftData = await shiftService.getMyTodayShift();
                if (shiftData) {
                    setTodayShift(shiftData);
                }
            } catch (shiftError) {
                console.error("Shift fetch error:", shiftError);
            }

            // 6.5. Fetch Weekly Schedule
            try {
                const weeklyData = await shiftService.getMyWeeklySchedule();
                if (weeklyData) {
                    setWeeklySchedule(weeklyData.schedules || []);
                    setDefaultShift(weeklyData.defaultShift);
                }
            } catch (weeklyError) {
                console.error("Weekly Schedule fetch error:", weeklyError);
            }

            // 7. Fetch Pending Resignations (For TL/Manager/Admin)
            let pendingApprovals = "0";
            const userRoleRaw = user?.role || '';
            const userRole = userRoleRaw.toLowerCase().trim();
            const userPos = (user?.position || '').toLowerCase(); // Add position check

            // Use comprehensive check: Role matches OR Position matches
            const isApprover = ['teamlead', 'manager', 'admin', 'hr'].includes(userRole) ||
                userPos.includes('manager') ||
                userPos.includes('lead') ||
                userPos.includes('tl');

            if (isApprover) {
                let totalPending = 0;

                // 1. Resignations
                try {
                    let res;
                    // Determine effective role for API call
                    if (userRole === 'teamlead' || userPos.includes('lead') || userPos.includes('tl')) {
                        res = await resignationService.getTLResignations();
                    } else if (userRole === 'manager' || userPos.includes('manager')) {
                        res = await resignationService.getManagerResignations();
                    } else if (userRole === 'admin' || userRole === 'hr') {
                        res = await resignationService.getHRResignations();
                    }

                    if (res && res.data) {
                        totalPending += res.data.length;
                    }
                } catch (resigError) {
                    console.error("Resignation stats error:", resigError);
                }

                // 2. Leaves
                try {
                    const leavesRes = await leaveService.getLeaves({ status: 'Pending' });
                    const allLeaves = leavesRes.data?.data?.leaves || [];

                    const myPendingLeaves = allLeaves.filter(l => {
                        if (userRole === 'teamlead' || userPos.includes('lead') || userPos.includes('tl')) {
                            return l.currentStage === 'TeamLead';
                        }
                        if (userRole === 'manager' || userPos.includes('manager')) {
                            return l.currentStage === 'Manager';
                        }
                        return true; // Admin/HR sees all
                    });

                    totalPending += myPendingLeaves.length;
                } catch (leaveError) {
                    console.error("Leave pending stats error:", leaveError);
                }

                pendingApprovals = totalPending.toString();
            }

            const newStats = [
                { label: "Present Days", value: presentCount.toString(), icon: FaCalendarCheck, color: PRIMARY_PURPLE, bgColor: BACKGROUND_LIGHT },
                { label: "Pending Tasks", value: pendingTasksCount, icon: FaTasks, color: SECONDARY_PURPLE, bgColor: BACKGROUND_LIGHT },
                { label: "Hours Worked", value: `${Math.floor(totalHours)}h ${Math.round((totalHours % 1) * 60)}m`, icon: FaUserClock, color: DARK_PURPLE, bgColor: BACKGROUND_LIGHT },
                { label: "Leaves Taken", value: leavesTaken, icon: FaClipboardList, color: PRIMARY_PURPLE, bgColor: BACKGROUND_LIGHT },
            ];

            if (isApprover) {
                newStats.unshift({
                    label: "Pending Approvals",
                    value: pendingApprovals,
                    icon: FaUserClock,
                    color: "#A3779D",
                    bgColor: "#E6C7E6",
                    onClick: () => navigate('/employee/approvals')
                });
                // Keep only 4 cards strictly? Or allow 5? Grid is col-lg-3 (4 per row). 
                // If 5, it wraps. Let's keep it clean.
                // Maybe replace "Leaves Taken" or "Hours Worked" if specific role?
                // Or just let it wrap.
            }

            setStats(newStats);

        } catch (error) {
            console.error("Dashboard data fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);


    // --- 2-Hour Report Reminder ---
    useEffect(() => {
        const checkInterval = setInterval(() => {
            if (isCheckedIn && !isCheckedOut && checkInTime) {
                const start = new Date(checkInTime);
                const now = new Date();
                const diff = now - start;
                const minutes = Math.floor(diff / 60000);

                // Check for 2 hour intervals (120, 240, 360...)
                if (minutes > 0 && minutes % 120 === 0) {
                    const alertKey = `report-alert-${now.toDateString()}-${minutes}`;
                    if (!sessionStorage.getItem(alertKey)) {
                        toast("Please update your report", {
                            icon: '📝',
                            duration: 6000,
                            style: { border: '2px solid #3B82F6', fontWeight: 'bold' }
                        });
                        // Timeout to let toast render
                        setTimeout(() => alert("Please update your report"), 500);
                        sessionStorage.setItem(alertKey, "true");
                    }
                }
            }
        }, 1000);
        return () => clearInterval(checkInterval);
    }, [isCheckedIn, isCheckedOut, checkInTime]);

    // --- Team Reports Logic ---
    const loadTeamReports = async () => {
        try {
            setLoadingReports(true);
            const response = await getTeamReports(reportFilters.days, reportFilters.search);
            if (response.data?.success) {
                setTeamReports(response.data.data.reports || []);
            }
        } catch (error) {
            console.error("Error loading team reports:", error);
            toast.error("Failed to load reports");
        } finally {
            setLoadingReports(false);
        }
    };

    useEffect(() => {
        if (showReportsModal) {
            loadTeamReports();
        }
    }, [showReportsModal, reportFilters.days]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (showReportsModal) loadTeamReports();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [reportFilters.search]);

    // Handlers
    // Handlers
    const parseTimeStr = (timeStr) => {
        if (!timeStr) return null;
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') hours = '00';
        if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
        const d = new Date();
        d.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        return d;
    };

    const handleCheckInClick = () => {
        // Check for late login if shift info is available AND this is the first check-in of the day
        // If isCheckedOut is true, it means they have been here before today and are checking in *again*.
        // We only want to show Late Modal on the absolute first check-in.

        // Wait, isCheckedOut is true if they checked out. 
        // We need to know if there are *any* prior sessions today.
        // We can check `checkInTime`. If `checkInTime` is set (from previous session), it implies they were here.
        // Or better: check if `todayLog` existed in fetchDashboardData. But we don't have `todayLog` in scope here.
        // Let's rely on `isCheckedOut`. 
        // If `isCheckedOut` is true, it means they are currently "Checked Out" but *have* a record for today.
        // If they had NO record, `isCheckedOut` would be false (default) and `isCheckedIn` false.

        // Let's refine:
        // Case 1: First time today -> isCheckedIn=false, isCheckedOut=false. -> Show Late Modal if late.
        // Case 2: Checked out previously -> isCheckedIn=false, isCheckedOut=true. -> Do NOT show Late Modal (not late for *first* login).

        if (!isCheckedOut && todayShift && todayShift.startTime) {
            const now = new Date();
            const shiftStart = parseTimeStr(todayShift.startTime);
            // Default to 15 mins if 0 or undefined, as requested
            const graceTime = todayShift.graceTime || 15;

            if (shiftStart) {
                const lateThreshold = new Date(shiftStart.getTime() + graceTime * 60000);
                if (now > lateThreshold) {
                    // It is late
                    setShowLateModal(true);
                    return;
                }
            }
        }
        // If not late, or subsequent check-in, or no shift info, just check in
        handleCheckIn({});
    };

    const handleCheckInConfirm = () => {
        handleCheckIn({
            lateReason: lateReason,
            hasPermission: hasPermission
        });
        setShowLateModal(false);
        setLateReason("");
        setHasPermission(false);
    };

    const handleCheckIn = async (data = {}) => {
        try {
            // Updated to use timeLogService
            await timeLogService.checkIn({
                employeeId: user._id,
                ...data
            });
            toast.success("Checked in successfully!");
            fetchDashboardData();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Check-in failed");
        }
    }

    const handleCheckOutClick = () => {
        // Set default time to current time formatted as HH:MM
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        setManualTime(`${hours}:${minutes}`);
        setShowCheckOutModal(true);
    };

    const confirmCheckOut = async () => {
        try {
            if (!manualTime) {
                toast.error("Please enter a time");
                return;
            }

            const today = new Date();
            const [hours, minutes] = manualTime.split(':');
            const checkOutDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);

            // Updated to use timeLogService
            await timeLogService.checkOut({
                employeeId: user._id,
            });
            toast.success("Checked out successfully!");
            setShowCheckOutModal(false);
            fetchDashboardData();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Check-out failed");
        }
    };


    return (
        <div style={{
            minHeight: "100vh",
            background: BACKGROUND_LIGHT,
            paddingBottom: "2rem",
            paddingTop: "2rem",
            fontFamily: "'Inter', sans-serif",
            color: ACCENT_TEXT
        }}>
            <div className="container-fluid px-4" style={{ maxWidth: "1180px", margin: "0 auto" }}>

                {/* --- PREMIUM BANNER (Combined Welcome & Attendance) --- */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative w-full rounded-[24px] overflow-hidden bg-gradient-to-r from-[#663399] to-[#2E1A47] shadow-xl shadow-purple-200/30 min-h-[120px] flex items-center mb-6 border border-white/10"
                >
                    {/* Geometric Background Pattern */}
                    <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
                        style={{
                            backgroundImage: `linear-gradient(45deg, #ffffff 25%, transparent 25%), 
                                              linear-gradient(-45deg, #ffffff 25%, transparent 25%), 
                                              linear-gradient(45deg, transparent 75%, #ffffff 75%), 
                                              linear-gradient(-45deg, transparent 75%, #ffffff 75%)`,
                            backgroundSize: '40px 40px',
                            backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px'
                        }}>
                    </div>

                    {/* Content Area */}
                    <div className="relative z-10 w-full px-6 py-3 md:px-10">
                        <div className="d-flex flex-column flex-lg-row align-items-center justify-content-between gap-4">

                            {/* LEFT: Identity Section */}
                            <div className="d-flex align-items-center gap-4">
                                <div className="d-none d-md-flex w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md items-center justify-center text-white border border-white/20 shadow-lg">
                                    <FaCalendarCheck size={22} />
                                </div>
                                <div className="flex flex-col">
                                    <div className="d-flex align-items-center gap-3">
                                        <h2 className="text-white text-2xl md:text-3xl font-black tracking-tight mb-0">
                                            Hello, {user?.firstName?.split(' ')[0] || "Employee"}! <span className="animate-wave">👋</span>
                                        </h2>
                                    </div>
                                    <div className="d-flex flex-wrap align-items-center gap-2 mt-1">
                                        <div className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border d-flex align-items-center gap-1.5 ${isCheckedIn ? 'bg-green-400/20 text-green-300 border-green-500/30' : 'bg-white/10 text-white/50 border-white/20'}`}>
                                            <div className={`w-1 h-1 rounded-full ${isCheckedIn ? 'bg-green-400 animate-pulse' : 'bg-white/40'}`}></div>
                                            {isCheckedIn ? "Active Status" : "Offline"}
                                        </div>
                                        <span className="text-white/30 text-xs">•</span>
                                        <span className="text-blue-100 text-[10px] font-bold uppercase tracking-widest opacity-80">{user?.position || "Member"}</span>
                                        <span className="text-white/30 text-xs">•</span>
                                        <div className="bg-white/10 px-2 py-0.5 rounded-md text-[9px] font-black text-blue-200 border border-white/5 uppercase tracking-wider">
                                            {user?.employeeId || "EMP-001"}
                                        </div>
                                        <span className="text-white/30 text-xs">•</span>
                                        <div className="text-blue-100 text-[10px] font-bold opacity-70">
                                            {todayShift ? `${todayShift.startTime} - ${todayShift.endTime}` : "--:-- - --:--"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CENTER: Unified Time & Calendar Capsule */}
                            <div className="d-none d-xl-flex flex-grow-1 justify-content-center px-4">
                                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 px-3 flex items-center gap-4 shadow-lg">
                                    {/* Calendar Date */}
                                    <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col items-center w-14 h-14 flex-shrink-0">
                                        <div className="bg-[#FF3B30] w-full py-0.5 text-center">
                                            <span className="text-[9px] font-black text-white uppercase tracking-widest block leading-none">
                                                {currentTime.toLocaleString('default', { month: 'short' })}
                                            </span>
                                        </div>
                                        <div className="flex-1 flex items-center justify-center bg-white w-full">
                                            <span className="text-xl font-black text-slate-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                {currentTime.getDate()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="w-[1px] h-8 bg-white/20"></div>

                                    {/* Digital Clock */}
                                    <div>
                                        <div className="d-flex align-items-baseline gap-1 text-white leading-none">
                                            <span className="text-3xl font-black tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif", textShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
                                                {formatTime(currentTime).split(' ')[0]}
                                            </span>
                                            <span className="text-xs font-bold text-purple-200 uppercase tracking-widest mb-1">
                                                {formatTime(currentTime).split(' ')[1]}
                                            </span>
                                        </div>
                                        <div className="text-[10px] font-medium text-purple-100/70 mt-1">
                                            {formatDate(currentTime).split(',')[0]} {/* Day Name */}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: Action & Image Section */}
                            <div className="d-flex align-items-center gap-6 flex-shrink-0 relative h-full">
                                <div className="z-10 relative">
                                    {loading && !isCheckedIn && !isCheckedOut ? (
                                        <button className="bg-white/10 text-white border border-white/10 px-6 py-2.5 rounded-xl font-bold italic text-xs shadow-lg backdrop-blur-sm" disabled>
                                            Syncing...
                                        </button>
                                    ) : !isCheckedIn ? (
                                        <motion.button
                                            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(255, 255, 255, 0.4)" }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleCheckInClick}
                                            className="bg-white text-[#663399] px-6 py-2.5 rounded-xl font-black shadow-xl border-0 d-flex align-items-center justify-content-center gap-2 transition-all text-xs uppercase tracking-widest"
                                        >
                                            <FaClock className="text-sm" /> <span>Check In</span>
                                        </motion.button>
                                    ) : (
                                        <motion.button
                                            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(255, 59, 48, 0.4)" }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleCheckOutClick}
                                            className="bg-[#FF3B30] text-white px-6 py-2.5 rounded-xl font-black shadow-xl border-0 d-flex align-items-center justify-content-center gap-2 transition-all text-xs uppercase tracking-widest"
                                        >
                                            <FaUserClock className="text-sm" /> <span>Check Out</span>
                                        </motion.button>
                                    )}
                                </div>

                                {/* Banner Image - Positioned Absolutely to overlap bottom if needed or sit perfectly */}
                                <div className="d-none d-xl-block relative h-[120px] w-[200px] flex items-end justify-center">
                                    <img
                                        src={bannerImg}
                                        alt="Team"
                                        className="h-[200px] w-auto object-contain drop-shadow-2xl"
                                        style={{ filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.3))" }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Late Login Modal */}
                {
                    showLateModal && (
                        <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                            <div className="modal-dialog modal-dialog-centered" role="document">
                                <div className="modal-content border-0 shadow-lg">
                                    <div className="modal-header bg-warning text-dark border-0">
                                        <h5 className="modal-title fw-bold">
                                            <FaClock className="me-2" /> Late Check-In Detected
                                        </h5>
                                    </div>
                                    <div className="modal-body p-4">
                                        <p className="text-muted mb-4">You are checking in after the grace period ({todayShift?.graceTime || 15} mins). Please provide a reason.</p>

                                        <div className="mb-3">
                                            <div className="form-check form-switch custom-switch-lg">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="permissionSwitch"
                                                    checked={hasPermission}
                                                    onChange={(e) => setHasPermission(e.target.checked)}
                                                />
                                                <label className="form-check-label fw-bold ms-2" htmlFor="permissionSwitch">
                                                    I have permission
                                                </label>
                                            </div>
                                            <small className="text-muted d-block mt-1 ms-1">Toggle this if you have obtained prior approval.</small>
                                        </div>

                                        <div className="form-group">
                                            <label className="fw-semibold mb-2">Reason (Optional)</label>
                                            <textarea
                                                className="form-control bg-light border-0"
                                                rows="3"
                                                placeholder="e.g. Traffic, Doctor Appointment..."
                                                value={lateReason}
                                                onChange={(e) => setLateReason(e.target.value)}
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="modal-footer border-0 p-3">
                                        <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowLateModal(false)}>Cancel</button>
                                        <button type="button" className="btn btn-primary rounded-pill px-4" onClick={handleCheckInConfirm}>Confirm Check-In</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* --- Stats Grid --- */}
                <div className="row g-4 mb-5">
                    {stats.map((stat, index) => (
                        <InfoCard
                            key={index}
                            {...stat}
                            delay={0.2 + index * 0.1}
                        />
                    ))}
                </div>

            </div>

            {/* --- Manager/TL Section: Employee Reports --- */}
            {isApprover && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5"
                >
                    <div
                        className="p-5 rounded-[24px] cursor-pointer relative overflow-hidden group shadow-lg"
                        style={{
                            background: `linear-gradient(135deg, ${EMP_THEME.royalPurple}, ${EMP_THEME.vibrantViolet})`,
                            boxShadow: `0 10px 30px ${EMP_THEME.royalPurple}44`,
                        }}
                        onClick={() => setShowReportsModal(true)}
                    >
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <FileText size={120} color="white" />
                        </div>
                        <div className="d-flex align-items-center justify-content-between relative z-10">
                            <div className="d-flex align-items-center gap-4">
                                <div className="p-3.5 rounded-2xl backdrop-blur-md bg-white/20 shadow-inner">
                                    <FileText size={32} className="text-white" />
                                </div>
                                <div>
                                    <h4 className="text-white text-2xl font-black mb-1">Employee Daily Reports</h4>
                                    <p className="text-purple-100/80 font-medium mb-0">View latest activity logs from your team</p>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white group-hover:text-purple-600 transition-all duration-300">
                                <ChevronRight size={20} className="text-white group-hover:text-[#663399]" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* --- Manager/TL Section: Employee Reports --- */}
            {isApprover && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5"
                >
                    <div
                        className="p-5 rounded-[24px] cursor-pointer relative overflow-hidden group shadow-lg"
                        style={{
                            background: `linear-gradient(135deg, ${EMP_THEME.royalPurple}, ${EMP_THEME.vibrantViolet})`,
                            boxShadow: `0 10px 30px ${EMP_THEME.royalPurple}44`,
                        }}
                        onClick={() => setShowReportsModal(true)}
                    >
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <FileText size={120} color="white" />
                        </div>
                        <div className="d-flex align-items-center justify-content-between relative z-10">
                            <div className="d-flex align-items-center gap-4">
                                <div className="p-3.5 rounded-2xl backdrop-blur-md bg-white/20 shadow-inner">
                                    <FileText size={32} className="text-white" />
                                </div>
                                <div>
                                    <h4 className="text-white text-2xl font-black mb-1">Employee Daily Reports</h4>
                                    <p className="text-purple-100/80 font-medium mb-0">View latest activity logs from your team</p>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white group-hover:text-purple-600 transition-all duration-300">
                                <ChevronRight size={20} className="text-white group-hover:text-[#663399]" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* --- Weekly Shift Schedule --- */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-[28px] shadow-lg overflow-hidden mb-5"
                style={{ border: `1px solid ${BORDER_COLOR}` }}
            >
                <div className="p-4 px-5 flex justify-between items-center" style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                    <h5 className="text-lg font-bold flex items-center gap-3" style={{ color: ACCENT_TEXT }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: BACKGROUND_LIGHT, color: PRIMARY_PURPLE }}>
                            <Clock size={18} />
                        </div>
                        Weekly Shift Schedule
                    </h5>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                </div>
                <div className="p-5">
                    <div className="row g-3">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => {
                            // Find shift for this day of the week
                            const daySchedule = weeklySchedule.find(s => new Date(s.date).getDay() === idx);
                            const isToday = new Date().getDay() === idx;

                            return (
                                <div key={idx} className="col">
                                    <div className={`p-3 rounded-2xl border transition-all duration-300 ${isToday ? 'border-[#663399] bg-[#663399]/5 shadow-sm' : 'border-slate-100 bg-slate-50'}`}>
                                        <div className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isToday ? 'text-[#663399]' : 'text-slate-400'}`}>
                                            {day}
                                        </div>
                                        {daySchedule ? (
                                            <>
                                                <div className="text-[11px] font-bold text-slate-800 truncate mb-1" title={daySchedule.shift?.shiftName || 'Custom'}>
                                                    {daySchedule.shift?.shiftName || 'Custom'}
                                                </div>
                                                <div className="text-[10px] text-[#663399] font-medium leading-none">
                                                    {daySchedule.startTime} - {daySchedule.endTime}
                                                </div>
                                            </>
                                        ) : defaultShift ? (
                                            <>
                                                <div className="text-[11px] font-bold text-slate-800 truncate mb-1" title={defaultShift.shiftName}>
                                                    {defaultShift.shiftName}
                                                </div>
                                                <div className="text-[10px] text-[#663399] font-medium leading-none">
                                                    {defaultShift.startTime} - {defaultShift.endTime}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-[10px] font-medium text-slate-300">
                                                No Shift
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>

            {/* --- Dynamic Content Area --- */}
            <div className="row g-4 mb-5">
                {/* Announcements */}
                <div className="col-lg-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="bg-white rounded-[28px] shadow-lg overflow-hidden h-100"
                        style={{ border: `1px solid ${BORDER_COLOR}` }}
                    >
                        <div className="p-4 px-5 flex justify-between items-center" style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                            <h5 className="text-lg font-bold flex items-center gap-3" style={{ color: ACCENT_TEXT }}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: BACKGROUND_LIGHT, color: PRIMARY_PURPLE }}>
                                    <FaBullhorn size={18} />
                                </div>
                                Latest Announcements
                            </h5>
                            <button className="text-xs font-bold text-[#663399] hover:text-[#2E1A47] uppercase tracking-widest transition-colors">
                                View All
                            </button>
                        </div>
                        <div className="p-5">
                            {recentAnnouncements.length > 0 ? (
                                <div className="flex flex-col gap-4">
                                    {recentAnnouncements.map((item, i) => (
                                        <div key={i} className="group p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-[#E6C7E6] hover:bg-white hover:shadow-md transition-all duration-300">
                                            <div className="flex gap-4">
                                                {item.imageUrl && (
                                                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                                                        <img src={item.imageUrl} alt="" className="w-100 h-100 object-cover" />
                                                    </div>
                                                )}
                                                <div className="flex-grow">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h6 className="font-bold text-[#2E1A47] group-hover:text-[#663399] transition-colors">{item.title}</h6>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                            {new Date(item.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 leading-relaxed mb-0 line-clamp-2">
                                                        {item.content || item.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <FaBullhorn size={24} />
                                    </div>
                                    <p className="text-sm font-medium text-slate-400">No new announcements at this time.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Upcoming Holidays */}
                <div className="col-lg-4">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="bg-white rounded-[28px] shadow-lg overflow-hidden h-100"
                        style={{ border: `1px solid ${BORDER_COLOR}` }}
                    >
                        <div className="p-4 px-5 flex justify-between items-center" style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                            <h5 className="text-lg font-bold flex items-center gap-3" style={{ color: ACCENT_TEXT }}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: BACKGROUND_LIGHT, color: SECONDARY_PURPLE }}>
                                    <FaCalendarAlt size={18} />
                                </div>
                                Holidays
                            </h5>
                        </div>
                        <div className="p-5">
                            {upcomingHolidays.length > 0 ? (
                                <div className="flex flex-col gap-4">
                                    {upcomingHolidays.map((holiday, i) => (
                                        <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                                            <div className="w-12 h-14 rounded-xl bg-white border border-slate-100 shadow-sm flex flex-col items-center justify-center flex-shrink-0">
                                                <span className="text-[9px] font-black uppercase text-rose-500 leading-none mb-1">
                                                    {new Date(holiday.date).toLocaleString('default', { month: 'short' })}
                                                </span>
                                                <span className="text-lg font-bold text-slate-800 leading-none">
                                                    {new Date(holiday.date).getDate()}
                                                </span>
                                            </div>
                                            <div className="flex-grow">
                                                <h6 className="text-sm font-bold text-slate-800 mb-0.5">{holiday.holidayName}</h6>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-medium text-slate-500">
                                                        {new Date(holiday.date).toLocaleDateString('en-US', { weekday: 'long' })}
                                                    </span>
                                                    {holiday.type && (
                                                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[9px] font-bold text-blue-600 uppercase tracking-wider">
                                                            {holiday.type}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <FaCalendarAlt size={24} />
                                    </div>
                                    <p className="text-sm font-medium text-slate-400">No upcoming holidays.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* --- Check Out Modal --- */}
            {showCheckOutModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                    background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1050
                }}>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white p-5 rounded-4 shadow-lg text-center"
                        style={{ maxWidth: "400px", width: "90%" }}
                    >
                        <h3 className="fw-bold mb-3">🕒 Check Out Time</h3>
                        <p className="text-muted mb-4">Please enter your check-out time manually to proceed.</p>

                        <input
                            type="time"
                            className="form-control form-control-lg mb-4 text-center fw-bold"
                            value={manualTime}
                            onChange={(e) => setManualTime(e.target.value)}
                            style={{ fontSize: '1.5rem', border: `2px solid ${BORDER_COLOR}` }}
                        />

                        <div className="d-flex gap-3 justify-content-center">
                            <button
                                className="btn btn-light px-4 py-2 rounded-pill fw-bold"
                                onClick={() => setShowCheckOutModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-danger px-4 py-2 rounded-pill fw-bold"
                                onClick={confirmCheckOut}
                            >
                                Confirm Check Out
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>

    );
};

export default EmployeeDashboard;