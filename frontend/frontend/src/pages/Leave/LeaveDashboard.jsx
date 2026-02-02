import React from "react";
import { Link } from "react-router-dom";
import { FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";

const glassEffect = {
  background: "#ffffff",
  borderRadius: 24,
  border: "1px solid #E6C7E6",
  boxShadow: "0 10px 30px -10px rgba(102, 51, 153, 0.1)",
  transition: "all 0.3s ease",
};

export default function LeaveDashboard() {
  return (
    <div className="py-2">
      <div className="row g-4">

        <div className="col-md-4">
          <Link to="/leave/approved" className="text-decoration-none">
            <div style={glassEffect} className="p-4 hover-lift h-100">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div style={{ width: 48, height: 48, backgroundColor: '#E6C7E6', borderRadius: 12, display: 'grid', placeItems: 'center', color: '#663399' }}>
                  <FiCheckCircle size={24} />
                </div>
              </div>
              <h5 className="fw-bold" style={{ color: '#2E1A47' }}>Approved</h5>
              <div style={{ color: '#A3779D' }} className="small">View all approved leave applications and history</div>
            </div>
          </Link>
        </div>

        <div className="col-md-4">
          <Link to="/leave/pending" className="text-decoration-none">
            <div style={glassEffect} className="p-4 hover-lift h-100">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div style={{ width: 48, height: 48, backgroundColor: '#FEF3C7', borderRadius: 12, display: 'grid', placeItems: 'center', color: '#D97706' }}>
                  <FiClock size={24} />
                </div>
              </div>
              <h5 className="fw-bold" style={{ color: '#2E1A47' }}>Pending</h5>
              <div style={{ color: '#A3779D' }} className="small">Requests waiting for multi-stage approval workflow</div>
            </div>
          </Link>
        </div>

        <div className="col-md-4">
          <Link to="/leave/rejected" className="text-decoration-none">
            <div style={glassEffect} className="p-4 hover-lift h-100">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div style={{ width: 48, height: 48, backgroundColor: '#FEE2E2', borderRadius: 12, display: 'grid', placeItems: 'center', color: '#DC2626' }}>
                  <FiXCircle size={24} />
                </div>
              </div>
              <h5 className="fw-bold" style={{ color: '#2E1A47' }}>Rejected</h5>
              <div style={{ color: '#A3779D' }} className="small">Review rejected leave requests and reasons</div>
            </div>
          </Link>
        </div>

      </div>

      <style>{`
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px -15px rgba(102, 51, 153, 0.15) !important;
        }
      `}</style>
    </div>
  );
}
