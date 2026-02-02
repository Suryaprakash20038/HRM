import React from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import LeaveDashboard from "./LeaveDashboard";
import Approved from "./Approved";
import Pending from "./Pending";
import Rejected from "./Rejected";

export default function Leave() {
  const tabStyle = ({ isActive }) => ({
    padding: "10px 24px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 600,
    background: isActive ? "#663399" : "#ffffff",
    color: isActive ? "#ffffff" : "#663399",
    border: "1px solid #E6C7E6",
    transition: "all 0.3s ease",
    textDecoration: "none",
    boxShadow: isActive ? "0 4px 12px rgba(102, 51, 153, 0.2)" : "none"
  });

  return (
    <div className="container-fluid leave-page" style={{ paddingBottom: 80 }}>
      <style>{`
          .leave-page {
              background-color: #ffffff;
              background-image:
                  radial-gradient(at 0% 0%, rgba(102, 51, 153, 0.05) 0px, transparent 50%),
                  radial-gradient(at 100% 0%, rgba(163, 119, 157, 0.05) 0px, transparent 50%);
              min-height: 100vh;
          }
          .nav-pill-custom:hover {
              background-color: #fdfbff !important;
              border-color: #663399 !important;
          }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-4 p-4 pb-0">
        <div>
          <h2 className="fw-bold m-0" style={{ color: '#2E1A47' }}>Leave Management</h2>
          <p className="text-muted small m-0" style={{ color: '#A3779D' }}>Track and manage employee leave applications</p>
        </div>
      </div>

      <div className="d-flex gap-3 mb-4 px-4 overflow-auto pb-2">
        <NavLink to="/leave/pending" style={tabStyle} className="nav-pill-custom">Pending</NavLink>
        <NavLink to="/leave/dashboard" style={tabStyle} className="nav-pill-custom">Dashboard</NavLink>
        <NavLink to="/leave/approved" style={tabStyle} className="nav-pill-custom">Approved</NavLink>
        <NavLink to="/leave/rejected" style={tabStyle} className="nav-pill-custom">Rejected</NavLink>
      </div>

      <div className="px-4">
        <Routes>
          <Route path="/" element={<Navigate to="pending" replace />} />
          <Route path="dashboard" element={<LeaveDashboard />} />
          <Route path="approved" element={<Approved />} />
          <Route path="pending" element={<Pending />} />
          <Route path="rejected" element={<Rejected />} />
        </Routes>
      </div>
    </div>
  );
}
