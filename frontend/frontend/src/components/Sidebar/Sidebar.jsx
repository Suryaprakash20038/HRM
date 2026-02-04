import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo3.png";
import {
  FaTachometerAlt, FaUserTie, FaCalendarCheck, FaMoneyBill,
  FaClock, FaUserShield, FaClipboardList, FaUmbrellaBeach,
  FaBullhorn, FaChartPie, FaProjectDiagram, FaTasks,
  FaFileAlt, FaBars, FaSignOutAlt, FaTicketAlt, FaBriefcase, FaHome, FaChartLine
} from "react-icons/fa";
import { FaRobot } from "react-icons/fa6";
import { FiCheckCircle, FiImage } from "react-icons/fi";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ collapsed, setCollapsed, darkMode, setDarkMode, isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalUnreadCount } = useChat();
  const { user } = useAuth();

  const userRole = (user?.role || '').toLowerCase();
  const isAdmin = ['admin', 'md', 'superadmin'].includes(userRole);

  // Define strict allowed paths for HR if not Admin
  // (Alternatively, list denied paths)
  const deniedForHR = [
    '/analytics',
    '/accounts',
    '/projects',
    '/tasks',
    '/reports'
  ];

  const allMenuItems = [
    { path: "/home", label: "Home", icon: <FaHome />, color: "#3B82F6" },
    { path: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt />, color: "#8B5CF6" },
    {
      path: "/ai-assistant",
      label: "AI Chat",
      icon: <FaRobot />,
      color: "#8B5CF6",
      badge: totalUnreadCount > 0 ? totalUnreadCount : null
    }, // Added AI Chat
    { path: "/analytics", label: "Analytics", icon: <FaChartLine />, color: "#3B82F6" },
    { path: "/recruitment", label: "Recruitment", icon: <FaBriefcase />, color: "#EC4899" },
    { path: "/employees", label: "Employees", icon: <FaUserTie />, color: "#F43F5E" },
    { path: "/attendance", label: "Attendance", icon: <FaCalendarCheck />, color: "#F59E0B" },
    { path: "/time-management", label: "Time Mgmt", icon: <FaClock />, color: "#8B5CF6" },
    { path: "/payroll", label: "Payroll", icon: <FaMoneyBill />, color: "#10B981" },
    { path: "/shift", label: "Shift", icon: <FaClock />, color: "#3B82F6" },
    { path: "/status", label: "Status", icon: <FiCheckCircle />, color: "#6366F1" },
    { path: "/leave", label: "Leave", icon: <FaUmbrellaBeach />, color: "#F97316" },
    { path: "/holidays", label: "Holidays", icon: <FaClipboardList />, color: "#14B8A6" },
    { path: "/announcement", label: "Announcements", icon: <FaBullhorn />, color: "#A855F7" },
    { path: "/accounts", label: "Accounts", icon: <FaChartPie />, color: "#EF4444" },
    { path: "/projects", label: "Projects", icon: <FaProjectDiagram />, color: "#3B82F6" },
    { path: "/tasks", label: "Tasks", icon: <FaTasks />, color: "#8B5CF6" },
    { path: "/reports", label: "Reports", icon: <FaFileAlt />, color: "#64748B" },
    { path: "/media", label: "Job Posting", icon: <FiImage />, color: "#F59E0B" },
    { path: "/tickets", label: "Tickets", icon: <FaTicketAlt />, color: "#F43F5E" },
    { path: "/resignation/approvals", label: "Resignations", icon: <FaSignOutAlt />, color: "#EF4444" },
    { path: "/resignation/final-cleanup", label: "Exit Process", icon: <FiCheckCircle />, color: "#10B981" },
  ];

  const menuItems = allMenuItems.filter(item => {
    // Hide Dashboard for HR
    if (userRole === 'hr' && item.path === '/dashboard') return false;

    // If admin, show everything
    if (isAdmin) return true;
    // If HR, hide denied items
    if (deniedForHR.includes(item.path)) return false;
    return true;
  });

  const sidebarStyle = {
    width: isMobile ? (collapsed ? "0px" : "260px") : (collapsed ? "80px" : "260px"),
    transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
    height: "100vh",
    position: "fixed",
    top: 0,
    left: 0,
    overflowY: "auto",
    paddingTop: "24px",
    zIndex: 1100,
    background: "rgb(230, 199, 230)", // User requested color
    borderRight: "1px solid rgba(163, 119, 157, 0.2)", // Soft Violet with opacity
    color: "#2E1A47", // Lilac Mist
    boxShadow: "4px 0 24px -4px rgba(0,0,0,0.3)",
    transform: isMobile && collapsed ? "translateX(-100%)" : "translateX(0)",
    opacity: isMobile && collapsed ? 0 : 1
  };



  return (
    <>
      {isMobile && !collapsed && (
        <div
          onClick={() => setCollapsed(true)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1099,
            backdropFilter: "blur(2px)"
          }}
        />
      )}
      <div className="d-flex flex-column px-3 pb-4 custom-scrollbar" style={sidebarStyle}>
        {/* Header Area */}
        <div className="d-flex justify-content-between align-items-center mb-5 px-2">
          {!collapsed && (
            <div className="d-flex align-items-center justify-content-center w-100">
              <img
                src={logo}
                alt="HRM Logo"
                style={{ width: "160px", height: "auto", objectFit: 'contain' }}
              />
            </div>
          )}

          <FaBars
            className="fs-5"
            role="button"
            onClick={() => setCollapsed(!collapsed)}
            style={{ cursor: "pointer", opacity: 0.8, color: "#A3779D" }}
          />
        </div>

        {/* Menu Items */}
        <ul className="nav nav-pills flex-column gap-1">
          {menuItems.map((item, i) => {
            const active = location.pathname === item.path;

            return (
              <li key={i} className="nav-item">
                <Link
                  to={item.path}
                  className="nav-link d-flex align-items-center text-decoration-none"
                  style={{
                    color: active
                      ? "#fff"
                      : "#2E1A47",
                    background: active
                      ? "linear-gradient(90deg, #663399 0%, #5B2D8A 100%)"
                      : "transparent",
                    borderRadius: "14px",
                    padding: collapsed ? "12px 0" : "12px 16px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    transition: "all 0.3s ease",
                    fontWeight: active ? "700" : "500",
                    borderLeft: active ? "4px solid #A3779D" : "4px solid transparent",
                    boxShadow: active ? "0 4px 12px rgba(102, 51, 153, 0.3)" : "none"
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = "rgba(102, 51, 153, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span
                    className="fs-5 d-flex align-items-center"
                    style={{
                      color: active ? "#E6C7E6" : "#A3779D",
                      marginRight: collapsed ? "0" : "16px"
                    }}
                  >
                    {item.icon}
                  </span>

                  {!collapsed && <span style={{ fontSize: "0.95rem" }}>{item.label}</span>}

                  {item.badge && (
                    <span
                      style={{
                        marginLeft: collapsed ? "0" : "auto",
                        position: collapsed ? "absolute" : "relative",
                        top: collapsed ? "4px" : "auto",
                        right: collapsed ? "4px" : "auto",
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
                        border: "2px solid rgb(230, 199, 230)"
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Switch to Employee Panel Button (For Admin/HR/MD) */}
        {!collapsed && ['hr', 'md'].includes(userRole) && (
          <div
            className="mt-4 mx-2 p-2 rounded-3 text-center"
            style={{
              background: "rgba(102, 51, 153, 0.1)",
              border: "1px dashed #A3779D",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onClick={() => navigate('/employee/dashboard')}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(102, 51, 153, 0.2)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(102, 51, 153, 0.1)"}
          >
            <div className="d-flex align-items-center justify-content-center gap-2" style={{ color: "#2E1A47", fontWeight: "600" }}>
              <FaUserTie />
              <span>Employee Panel</span>
            </div>
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* User Profile Section */}
        {!collapsed && (
          <div
            className="mt-4 mb-2 p-3 rounded-4 d-flex align-items-center gap-3"
            style={{
              background: "rgba(102, 51, 153, 0.2)", // Transparent Royal Amethyst
              border: "1px solid rgba(163, 119, 157, 0.3)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)"
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
              alt="User"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #A3779D",
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
              }}
            />

            <div style={{ lineHeight: "1.2" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#2E1A47" }}>
                Admin
              </div>
              <div style={{ fontSize: "0.75rem", color: "#555" }}>
                HR Manager
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;