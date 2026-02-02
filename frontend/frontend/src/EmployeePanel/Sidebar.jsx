import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FaTachometerAlt, FaUser, FaCalendarCheck, FaMoneyBill,
    FaClock, FaClipboardList, FaBullhorn, FaFileAlt,
    FaHandHoldingUsd, FaBars, FaSignOutAlt, FaFolder, FaTicketAlt, FaVideo
} from "react-icons/fa";
import { FaRobot } from "react-icons/fa6";
import { FiImage } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { EMP_THEME } from "./theme";
import { useChat } from "../context/ChatContext";

const Sidebar = ({ collapsed, setCollapsed, darkMode }) => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const { totalUnreadCount } = useChat();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const menuItems = [
        { path: "/employee/dashboard", label: "Dashboard", icon: <FaTachometerAlt />, color: "#6366f1" },
        {
            path: "/employee/ai-assistant",
            label: " AIChat",
            icon: <FaRobot />,
            color: "#8B5CF6",
            badge: totalUnreadCount > 0 ? totalUnreadCount : null
        }, // Updated path
        { path: "/employee/meetings", label: "Meetings", icon: <FaVideo />, color: "#E11D48" },
        { path: "/employee/time-tracking", label: "Time Tracking", icon: <FaClock />, color: "#22c55e" },

        { path: "/employee/profile", label: "My Profile", icon: <FaUser />, color: "#8b5cf6" },
        { path: "/employee/projects", label: "My Projects", icon: <FaFolder />, color: "#14b8a6" },
        { path: "/employee/tasks", label: "My Tasks", icon: <FaClipboardList />, color: "#ec4899" },
        { path: "/employee/attendance", label: "Attendance", icon: <FaCalendarCheck />, color: "#10b981" },
        { path: "/employee/leave", label: "Leave Requests", icon: <FaClipboardList />, color: "#f59e0b" },
        { path: "/employee/payslips", label: "Payslips", icon: <FaMoneyBill />, color: "#3b82f6" },
        { path: "/employee/documents", label: "Documents", icon: <FaFileAlt />, color: "#64748B" },
        { path: "/employee/announcements", label: "Announcements", icon: <FaBullhorn />, color: "#A855F7" },
        { path: "/employee/daily-report", label: "Daily Report", icon: <FaFileAlt />, color: "#EC4899" },
        { path: "/employee/media-log", label: "Job Posting", icon: <FiImage />, color: "#F59E0B" },
        { path: "/employee/holidays", label: "My Holidays", icon: <FaCalendarCheck />, color: "#8B5CF6" },
        { path: "/employee/tickets", label: "Support Tickets", icon: <FaTicketAlt />, color: "#F43F5E" },
        { path: "/employee/resignation", label: "Resignation", icon: <FaSignOutAlt />, color: "#EF4444" },
    ];

    // Check if user is an approver (Manager or TL)
    const isApprover = user && (
        ['manager', 'teamlead'].includes((user.role || '').toLowerCase()) ||
        /manager|lead|tl/i.test(user.position || '')
    );

    if (isApprover) {
        menuItems.push({
            path: "/employee/approvals",
            label: "Approvals",
            icon: <FaClipboardList />,
            color: "#F59E0B"
        });
    }

    const sidebarStyle = {
        width: collapsed ? "80px" : "280px",
        transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        overflowY: "auto",
        overflowX: "hidden",
        paddingTop: "24px",
        zIndex: 1100,
        background: EMP_THEME.midnightPlum, // Midnight Plum
        borderRight: `1px solid ${EMP_THEME.softViolet}33`, // 20% opacity approx
        color: EMP_THEME.lilacMist, // Lilac Mist
        boxShadow: "4px 0 30px rgba(0,0,0,0.3)"
    };

    return (
        <div className="d-flex flex-column px-3 pb-4 custom-scrollbar" style={sidebarStyle}>
            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(163, 119, 157, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(163, 119, 157, 0.5);
        }
      `}</style>

            {/* Header Area */}
            <div className="d-flex justify-content-between align-items-center mb-4 px-2">
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="d-flex align-items-center gap-3"
                    >
                        <div
                            style={{
                                width: "45px",
                                height: "45px",
                                borderRadius: "14px",
                                background: "linear-gradient(135deg, #663399 0%, #A3779D 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: "1.5rem",
                                fontWeight: "700",
                                boxShadow: "0 4px 15px rgba(102, 51, 153, 0.4)"
                            }}
                        >
                            H
                        </div>
                        <div>
                            <h3
                                className="fw-bold m-0"
                                style={{
                                    fontSize: "1.3rem",
                                    letterSpacing: "-0.5px",
                                    fontFamily: "'Inter', sans-serif",
                                    color: "#FFFFFF",
                                    lineHeight: 1
                                }}
                            >
                                HRM
                            </h3>
                            <span
                                style={{
                                    fontSize: "0.7rem",
                                    color: "#E6C7E6",
                                    fontWeight: "500"
                                }}
                            >
                                Self Service
                            </span>
                        </div>
                    </motion.div>
                )}

                <motion.div
                    whileHover={{ scale: 1.1, rotate: 180 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <FaBars
                        className="fs-5"
                        role="button"
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            cursor: "pointer",
                            color: "#A3779D",
                            transition: "all 0.3s ease"
                        }}
                    />
                </motion.div>
            </div>

            {/* User Profile Card */}
            {!collapsed && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                        background: "rgba(102, 51, 153, 0.15)",
                        borderRadius: "20px",
                        padding: "1.2rem",
                        marginBottom: "1.5rem",
                        border: "1px solid rgba(163, 119, 157, 0.2)",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
                    }}
                >
                    <div className="d-flex align-items-center gap-3">
                        <div
                            style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #663399 0%, #A3779D 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: "1.5rem",
                                fontWeight: "700",
                                boxShadow: "0 4px 15px rgba(102, 51, 153, 0.4)",
                                border: "3px solid #E6C7E6"
                            }}
                        >
                            {user?.firstName?.charAt(0) || "E"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                                style={{
                                    fontSize: "1rem",
                                    fontWeight: "700",
                                    color: "#FFFFFF",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis"
                                }}
                            >
                                {user?.firstName} {user?.lastName}
                            </div>
                            <div
                                style={{
                                    fontSize: "0.75rem",
                                    color: "#E6C7E6",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis"
                                }}
                            >
                                {user?.domain ? `${user.position} (${user.domain})` : (user?.position || "Employee")}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Menu Items */}
            <ul className="nav nav-pills flex-column gap-2" style={{ marginBottom: "auto" }}>
                {menuItems.map((item, i) => {
                    const active = location.pathname === item.path;

                    return (
                        <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * i }}
                            className="nav-item"
                        >
                            <Link
                                to={item.path}
                                className="nav-link d-flex align-items-center text-decoration-none position-relative"
                                style={{
                                    color: active
                                        ? "#fff"
                                        : EMP_THEME.lilacMist,
                                    background: active
                                        ? `linear-gradient(135deg, ${EMP_THEME.royalAmethyst} 0%, ${EMP_THEME.softViolet} 100%)`
                                        : "transparent",
                                    borderRadius: "16px",
                                    padding: collapsed ? "14px 0" : "14px 18px",
                                    justifyContent: collapsed ? "center" : "flex-start",
                                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                    fontWeight: active ? "600" : "500",
                                    fontSize: "0.95rem",
                                    overflow: "hidden",
                                    boxShadow: active ? `0 4px 15px ${EMP_THEME.royalAmethyst}4d` : "none",
                                    border: active ? `1px solid ${EMP_THEME.softViolet}4d` : "1px solid transparent"
                                }}
                            >
                                {active && (
                                    <motion.div
                                        layoutId="activeTab"
                                        style={{
                                            position: "absolute",
                                            left: 0,
                                            top: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: `linear-gradient(135deg, ${EMP_THEME.royalAmethyst} 0%, ${EMP_THEME.softViolet} 100%)`,
                                            borderRadius: "16px",
                                            zIndex: -1
                                        }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <span
                                    className="d-flex align-items-center"
                                    style={{
                                        fontSize: "1.2rem",
                                        marginRight: collapsed ? "0" : "14px",
                                        filter: active ? "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" : "none",
                                        color: active ? "#fff" : EMP_THEME.softViolet
                                    }}
                                >
                                    {item.icon}
                                </span>

                                {!collapsed && (
                                    <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>
                                )}

                                {item.badge && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        style={{
                                            marginLeft: collapsed ? "0" : "auto",
                                            position: collapsed ? "absolute" : "relative",
                                            top: collapsed ? "5px" : "auto",
                                            right: collapsed ? "5px" : "auto",
                                            background: "#FF3E1D",
                                            color: "white",
                                            fontSize: "0.7rem",
                                            fontWeight: "700",
                                            minWidth: "18px",
                                            height: "18px",
                                            borderRadius: "50%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            padding: "2px",
                                            boxShadow: "0 2px 4px rgba(255, 62, 29, 0.4)",
                                            border: "2px solid #2E1A47"
                                        }}
                                    >
                                        {item.badge}
                                    </motion.span>
                                )}
                            </Link>
                        </motion.li>
                    );
                })}
            </ul>

            {/* Logout Button */}
            {!collapsed && (
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(239, 68, 68, 0.2)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        color: "#EF4444",
                        padding: "12px 18px",
                        borderRadius: "16px",
                        fontSize: "0.95rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        marginTop: "1rem",
                        transition: "all 0.3s ease"
                    }}
                >
                    <FaSignOutAlt />
                    Logout
                </motion.button>
            )}
        </div>
    );
};

export default Sidebar;
