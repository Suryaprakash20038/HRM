import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaSearch, FaBell, FaEnvelope, FaMoon, FaSun, FaChevronDown, FaSignOutAlt, FaHome,
  FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaCheckDouble,
  FaUserCircle, FaIdBadge
} from "react-icons/fa";
import ProfileModal from './ProfileModal';
import api, { BASE_URL } from "../../services/api";

const Header = ({ sidebarWidth = 250, collapsed, setCollapsed, darkMode, setDarkMode, isMobile }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [time, setTime] = useState("");

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.status === 'success') {
        setNotifications(res.data.data.notifications);
        setUnreadCount(res.data.data.unreadCount);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const markAsRead = async () => {
    try {
      await api.put('/notifications/read');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark notifications read", err);
    }
  };

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    tick();
    const interval = setInterval(tick, 1000);

    // Initial fetch
    fetchNotifications();
    // Poll every 30 seconds
    const notifInterval = setInterval(fetchNotifications, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(notifInterval);
    };
  }, []);

  const toggleNotifMenu = () => {
    if (!showNotifMenu) {
      fetchNotifications();
    }
    setShowNotifMenu(!showNotifMenu);
    setShowProfileMenu(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <FaCheckCircle size={16} color="#663399" />;
      case 'warning': return <FaExclamationTriangle size={16} color="#A3779D" />;
      case 'error': return <FaTimesCircle size={16} color="#2E1A47" />;
      default: return <FaInfoCircle size={16} color="#663399" />;
    }
  };

  const headerStyle = {
    position: "fixed",
    top: 0,
    left: isMobile ? 0 : sidebarWidth,
    right: 0,
    height: 70,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    backdropFilter: "blur(12px)",
    background: darkMode ? "rgba(8,18,40,0.65)" : "rgb(230, 199, 230)",
    borderBottom: darkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid #E6C7E6",
    zIndex: 1050,
    transition: "left 0.3s ease, background 0.3s ease"
  };

  return (
    <header style={headerStyle}>
      {/* left: optional compact toggle + search */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          className="btn btn-ghost"
          onClick={() => setCollapsed(!collapsed)}
          title="Toggle sidebar"
          style={{ color: darkMode ? "#fff" : "#111" }}
        >
          ☰
        </button>

        <button
          className="btn btn-ghost"
          onClick={() => navigate('/home')}
          title="Go to Home"
          style={{
            color: darkMode ? "#fff" : "#663399",
            display: isMobile ? 'none' : 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          <FaHome size={18} />
          <span className="hidden md:inline">Home</span>
        </button>

        <div
          style={{
            display: isMobile ? 'none' : "flex",
            alignItems: "center",
            gap: 10,
            background: darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
            padding: "8px 12px",
            borderRadius: 999,
            width: 420,
            maxWidth: "55vw"
          }}
        >
          <FaSearch style={{ opacity: 0.7, color: darkMode ? "#fff" : "#111" }} />
          <input
            type="text"
            placeholder="Search..."
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              color: darkMode ? "#fff" : "#111",
              width: "100%"
            }}
          />
        </div>
      </div>

      {/* right: time, theme, notifications, messages, profile */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ color: darkMode ? "#fff" : "#111", fontWeight: 600, display: isMobile ? 'none' : 'block' }}>{time}</div>

        <div onClick={() => setDarkMode(!darkMode)} style={{ cursor: "pointer" }}>
          {darkMode ? <FaSun style={{ color: "#E6C7E6" }} /> : <FaMoon style={{ color: "#663399" }} />}
        </div>

        {/* NOTIFICATIONS */}
        <div style={{ position: "relative" }}>
          <div onClick={toggleNotifMenu} style={{ cursor: "pointer", position: "relative" }}>
            <FaBell style={{ color: darkMode ? "#fff" : "#111" }} />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: -6, right: -8,
                width: 14, height: 14, background: "#ff3b30", borderRadius: 999,
                boxShadow: "0 0 8px rgba(255,59,48,0.45)",
                fontSize: 9, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>

          {showNotifMenu && (
            <div style={{
              position: "absolute",
              top: "140%",
              right: -10,
              width: 380,
              maxHeight: 500,
              overflowY: "auto",
              background: darkMode ? "rgba(16, 20, 30, 0.95)" : "#ffffff",
              border: `1px solid ${darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
              borderRadius: 16,
              boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
              backdropFilter: "blur(20px)",
              zIndex: 1000,
              display: "flex",
              flexDirection: "column"
            }}>
              <div style={{
                padding: '16px 20px',
                borderBottom: `1px solid ${darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: darkMode ? '#fff' : '#111' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); markAsRead(); }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#663399',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <FaCheckDouble /> Mark all read
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {notifications.length > 0 ? (
                  notifications.map((n, idx) => (
                    <div key={n._id || idx}
                      onClick={async () => {
                        // Optimistic remove
                        setNotifications(prev => prev.filter(item => item._id !== n._id));
                        setUnreadCount(prev => Math.max(0, prev - 1));

                        // Navigate
                        if (n.link) navigate(n.link);

                        // API Call to mark as read
                        try {
                          await api.put(`/notifications/${n._id}/read`);
                        } catch (e) { console.error(e); }

                        setShowNotifMenu(false);
                      }}
                      style={{
                        padding: '16px 20px',
                        borderBottom: `1px solid ${darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"}`,
                        cursor: 'pointer',
                        background: 'transparent',
                        transition: 'background 0.2s',
                        display: 'flex',
                        gap: 16,
                        alignItems: 'flex-start'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? "rgba(255,255,255,0.03)" : "#f8f9fa"}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ marginTop: 2 }}>{getNotificationIcon(n.type)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: 14,
                          fontWeight: !n.isRead ? 700 : 600,
                          color: darkMode ? '#fff' : '#222',
                          marginBottom: 4,
                          lineHeight: 1.4
                        }}>
                          {n.title}
                        </div>
                        <div style={{
                          fontSize: 13,
                          color: darkMode ? '#aaa' : '#666',
                          lineHeight: 1.5,
                          marginBottom: 6
                        }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: 11, color: darkMode ? '#666' : '#999', fontWeight: 500 }}>
                          {new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      {!n.isRead && (
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%', background: '#00e6c3', marginTop: 6, flexShrink: 0
                        }} />
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '40px 20px', textAlign: 'center', opacity: 0.5 }}>
                    <FaBell size={32} style={{ marginBottom: 12, color: darkMode ? '#fff' : '#000' }} />
                    <div style={{ fontSize: 14, color: darkMode ? '#ddd' : '#555' }}>No notifications yet</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>



        <div style={{ position: "relative" }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifMenu(false); }}
          >
            <img
              src={
                user?.profileImage
                  ? (user.profileImage.startsWith('http')
                    ? user.profileImage
                    : `${BASE_URL}${user.profileImage.startsWith('/') ? '' : '/'}${user.profileImage.replace(/\\/g, '/')}`)
                  : "https://i.pravatar.cc/40?u=admin"
              }
              alt="profile"
              onError={(e) => { e.target.onerror = null; e.target.src = "https://i.pravatar.cc/40?u=admin"; }}
              style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid #663399", boxShadow: "0 4px 14px rgba(102,51,153,0.2)", objectFit: 'cover' }}
            />
            <div style={{ color: darkMode ? "#fff" : "#111", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <span>{user?.firstName || 'Admin'}</span>
              <FaChevronDown />
            </div>
          </div>



          {showProfileMenu && (
            <div style={{
              position: "absolute",
              top: "120%",
              right: 0,
              background: darkMode ? "rgba(30, 32, 40, 0.95)" : "#fff",
              border: `1px solid ${darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
              borderRadius: 12,
              padding: "8px",
              minWidth: 180,
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              backdropFilter: "blur(10px)",
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}>
              {/* Profile Option */}
              <div
                onClick={() => { setShowProfileModal(true); setShowProfileMenu(false); }}
                style={{
                  padding: "10px 16px",
                  color: darkMode ? "#fff" : "#333",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  borderRadius: 8,
                  transition: "background 0.2s",
                  fontSize: 14,
                  fontWeight: 500
                }}
                onMouseEnter={(e) => e.target.style.background = darkMode ? "rgba(255,255,255,0.05)" : "#f3f4f6"}
                onMouseLeave={(e) => e.target.style.background = "transparent"}
              >
                <FaUserCircle size={16} className="text-primary" />
                Profile
              </div>

              {/* Role Display */}
              <div
                style={{
                  padding: "10px 16px",
                  color: darkMode ? "#aaa" : "#666",
                  cursor: "default",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500
                }}
              >
                <FaIdBadge size={16} />
                <span className="text-capitalize">{user?.role || "Role"}</span>
              </div>

              <div style={{ height: 1, background: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", margin: "4px 0" }}></div>

              {/* Logout Option */}
              <div
                onClick={handleLogout}
                style={{
                  padding: "10px 16px",
                  color: "#ff4d4f",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  borderRadius: 8,
                  transition: "background 0.2s",
                  fontSize: 14,
                  fontWeight: 500
                }}
                onMouseEnter={(e) => e.target.style.background = darkMode ? "rgba(255, 77, 79, 0.1)" : "#fff1f0"}
                onMouseLeave={(e) => e.target.style.background = "transparent"}
              >
                <FaSignOutAlt size={16} />
                Logout
              </div>
            </div>
          )}
        </div>
      </div>

      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
    </header>
  );
};


export default Header;
