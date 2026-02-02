// src/pages/Status/StatusDashboard.jsx
import React, { useState, useEffect } from "react";
import { FiCheckCircle, FiClock, FiUser, FiAlertTriangle, FiXCircle } from "react-icons/fi";
import employeeService from "../../services/employeeService";

const card = {
  background: "#ffffff",
  border: "1px solid #E6C7E6",
  borderRadius: 20,
  padding: 20,
  boxShadow: "0 10px 30px -10px rgba(102, 51, 153, 0.1)",
  transition: "transform 240ms ease, box-shadow 240ms ease",
};

export default function StatusDashboard() {
  const [stats, setStats] = useState({
    intern: 0,
    probation: 0,
    confirmed: 0,
    resignationSubmitted: 0,
    noticePeriod: 0,
    relieved: 0,
    terminated: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await employeeService.getEmployeeStats();
        setStats(statsData);
      } catch (error) {
        console.error("Failed to fetch status stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const items = [
    { label: "Intern", count: stats.intern, color: "#3b82f6", icon: <FiUser /> },
    { label: "Probation", count: stats.probation, color: "#f59e0b", icon: <FiClock /> },
    { label: "Confirmed", count: stats.confirmed, color: "#10b981", icon: <FiCheckCircle /> },
    { label: "Resignation Submitted", count: stats.resignationSubmitted, color: "#eab308", icon: <FiAlertTriangle /> },
    { label: "Notice Period", count: stats.noticePeriod, color: "#f43f5e", icon: <FiAlertTriangle /> },
    { label: "Relieved", count: stats.relieved, color: "#8b5cf6", icon: <FiCheckCircle /> },
    { label: "Terminated", count: stats.terminated, color: "#64748b", icon: <FiXCircle /> },
  ];

  return (
    <div className="container-fluid">
      <h4 className="fw-bold mb-4" style={{ color: '#2E1A47' }}>Employment Status Dashboard</h4>

      <div className="row g-3">
        {items.map((s, i) => (
          <div key={i} className="col-6 col-md-2"> {/* Adjusted column width to fit 5 items */}
            <div style={card}>
              <div className="d-flex flex-column justify-content-between h-100">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `#E6C7E6`,
                      color: '#663399',
                      fontSize: 22,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {s.icon}
                  </div>
                  <div
                    className="fw-bold"
                    style={{ fontSize: 24, color: s.color }}
                  >
                    {loading ? "..." : s.count}
                  </div>
                </div>
                <div className="fw-bold small" style={{ color: '#A3779D' }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
