import React, { useState, useEffect } from "react";
import { glass } from "../../utils/glassStyle";
import { FiXCircle, FiCalendar } from "react-icons/fi";
import { leaveService } from "../../services/leaveService";

export default function Rejected() {
  const [rejectedLeaves, setRejectedLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRejectedLeaves();
  }, []);

  const fetchRejectedLeaves = async () => {
    try {
      const response = await leaveService.getLeaves({ status: 'Rejected' });
      if (response.data.status === 'success') {
        setRejectedLeaves(response.data.data.leaves);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching rejected leaves:", error);
      setLoading(false);
    }
  };

  // Helper to get image URL
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://localhost:5000/${path.replace(/\\/g, '/')}`;
  };

  return (
    <div className="py-2">
      <div style={{ background: '#ffffff', borderRadius: 24, border: '1px solid #E6C7E6', boxShadow: '0 10px 30px -10px rgba(102, 51, 153, 0.1)', overflow: 'hidden' }} className="mt-3">
        <table className="table align-middle table-hover mb-0">
          <thead style={{ backgroundColor: '#f8fafc' }}>
            <tr className="small text-uppercase">
              <th className="py-3 ps-4 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Employee</th>
              <th className="py-3 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Type</th>
              <th className="py-3 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Dates</th>
              <th className="py-3 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Days</th>
              <th className="py-3 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Reason</th>
              <th className="py-3 border-bottom text-end pe-4" style={{ color: '#663399', letterSpacing: '0.5px' }}>Status</th>
            </tr>
          </thead>

          <tbody>
            {rejectedLeaves.map((l) => {
              const emp = l.employee || l.user || {};
              return (
                <tr key={l._id}>
                  <td className="ps-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="avatar-circle fw-bold d-grid place-items-center" style={{ width: 44, height: 44, borderRadius: '14px', display: 'grid', placeItems: 'center', backgroundColor: '#E6C7E6', color: '#663399', flexShrink: 0 }}>
                        {emp.profileImage ? (
                          <img
                            src={getImageUrl(emp.profileImage)}
                            alt={emp.firstName}
                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: '14px' }}
                          />
                        ) : (
                          emp.firstName?.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="fw-bold" style={{ color: '#2E1A47' }}>{emp.firstName} {emp.lastName}</div>
                        <div style={{ color: '#A3779D' }} className="small opacity-75">{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{l.leaveType}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2 small">
                      <FiCalendar style={{ color: '#A3779D' }} />
                      <span style={{ color: '#2E1A47' }}>{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td>{l.totalDays} Days</td>
                  <td>
                    <div className="text-wrap" style={{ maxWidth: '250px' }}>
                      <div className="fw-bold text-danger small">
                        {l.approvalChain?.teamLead?.status === 'Rejected' ? 'Rejected by Team Lead' :
                          l.approvalChain?.manager?.status === 'Rejected' ? 'Rejected by Manager' :
                            l.approvalChain?.hr?.status === 'Rejected' ? 'Rejected by HR' : 'Rejected'}
                      </div>
                      <div className="small mt-1">
                        {l.rejectionReason || l.approvalChain?.teamLead?.comment || l.approvalChain?.manager?.comment || l.approvalChain?.hr?.comment || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="text-end pe-4">
                    <span className="badge px-3 py-2 rounded-pill shadow-sm" style={{ backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid #DC262630' }}>
                      <FiXCircle className="me-1" /> Rejected
                    </span>
                  </td>
                </tr>
              );
            })}
            {rejectedLeaves.length === 0 && !loading && (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted">No rejected leaves found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
