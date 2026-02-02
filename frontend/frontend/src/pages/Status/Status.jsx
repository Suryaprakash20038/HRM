// src/pages/Status/Status.jsx
import React from "react";
import StatusDashboard from "./StatusDashboard";
import StatusList from "./StatusList";

export default function Status() {
  return (
    <div className="container-fluid status-page" style={{ paddingBottom: 40 }}>
      {/* BACKGROUND STYLES */}
      <style>{`
        .status-page {
            background-color: #ffffff;
            background-image:
                radial-gradient(at 0% 0%, rgba(102, 51, 153, 0.05) 0px, transparent 50%),
                radial-gradient(at 100% 0%, rgba(163, 119, 157, 0.05) 0px, transparent 50%);
            min-height: 100vh;
        }
      `}</style>

      {/* Dashboard Section */}
      <StatusDashboard />

      {/* List Section */}
      <div className="mt-4">
        <StatusList />
      </div>
    </div>
  );
}
