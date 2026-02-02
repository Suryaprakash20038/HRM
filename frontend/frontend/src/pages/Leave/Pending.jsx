import React, { useState, useEffect } from "react";
import { glass } from "../../utils/glassStyle";
import { FiClock, FiCheck, FiX } from "react-icons/fi";
import { leaveService } from "../../services/leaveService";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function Pending() {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
  const [actionStage, setActionStage] = useState(null); // 'TeamLead', 'HR', 'MD'
  const [rejectionReason, setRejectionReason] = useState("");
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth(); // To get current user role if needed for disabling checkboxes

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const fetchPendingLeaves = async () => {
    try {
      const response = await leaveService.getLeaves({ status: 'Pending' });
      if (response.data.status === 'success') {
        setPendingLeaves(response.data.data.leaves);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching leaves:", error);
      setLoading(false);
    }
  };

  const handleApprove = async (leave, stage) => {
    try {
      await leaveService.approveLeave(leave._id, { stage });
      fetchPendingLeaves();
      toast.success(`${stage} Approved Successfully`);
    } catch (error) {
      console.error("Error approving leave:", error);
      toast.error(`Failed to approve leave`);
    }
  };

  const handleReject = (leave, stage) => {
    setSelectedLeave(leave);
    setActionType('reject');
    setActionStage(stage);
    setRejectionReason("");
    setShowModal(true);
  };

  const submitReject = async () => {
    try {
      await leaveService.rejectLeave(selectedLeave._id, { rejectionReason });
      fetchPendingLeaves();
      setShowModal(false);
      toast.success(`Submitted. Moved to Rejected Page.`);
    } catch (error) {
      console.error("Error rejecting leave:", error);
      toast.error(`Failed to reject leave`);
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
              <th className="py-3 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Leave Details</th>
              <th className="py-3 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Dates</th>
              <th className="py-3 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Reason & Doc</th>
              <th className="py-3 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Stage</th>
              <th className="py-3 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>TL Approval</th>
              <th className="py-3 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Manager Approval</th>
            </tr>
          </thead>

          <tbody>
            {pendingLeaves.map((l) => {
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
                  <td>
                    <div className="fw-bold" style={{ color: '#663399' }}>{l.leaveType}</div>
                    <div style={{ color: '#A3779D' }} className="small">{l.totalDays} Days</div>
                  </td>
                  <td>
                    <div className="small">
                      <div>Start: {new Date(l.startDate).toLocaleDateString()}</div>
                      <div>End: {new Date(l.endDate).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex flex-column gap-2">
                      <div className="text-wrap" style={{ maxWidth: '200px', fontSize: '0.85rem' }}>
                        {l.reason}
                      </div>
                      {l.documentUrl && (
                        <a
                          href={getImageUrl(l.documentUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-primary btn-sm py-0"
                          style={{ fontSize: '0.7rem', width: 'fit-content' }}
                        >
                          View Document
                        </a>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="badge px-3 py-2 rounded-pill" style={{ backgroundColor: '#E0F2FE', color: '#0369A1', border: '1px solid #BAE6FD' }}>{l.currentStage}</span>
                  </td>

                  {/* TL Stage */}
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="checkbox"
                        checked={l.approvalChain.teamLead.status === 'Approved'}
                        disabled={l.currentStage !== 'TeamLead' && l.approvalChain.teamLead.status !== 'Pending'}
                        onChange={() => handleApprove(l, 'TeamLead')}
                        className="form-check-input"
                        style={{ cursor: 'pointer', width: '20px', height: '20px' }}
                        title="Approve"
                      />
                      {l.approvalChain.teamLead.status === 'Pending' && l.currentStage === 'TeamLead' && (
                        <button
                          className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 px-2 py-0"
                          style={{ height: '24px', fontSize: '0.75rem' }}
                          onClick={() => handleReject(l, 'TeamLead')}
                          title="Reject with Reason"
                        >
                          <FiX /> Reject
                        </button>
                      )}
                      {l.approvalChain.teamLead.status === 'Rejected' && <span className="text-danger fw-bold small"><FiX /> Rejected</span>}
                    </div>
                  </td>

                  {/* Manager Stage */}
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="checkbox"
                        checked={l.approvalChain?.manager?.status === 'Approved'}
                        disabled={l.currentStage !== 'Manager' && l.approvalChain?.manager?.status !== 'Pending'}
                        onChange={() => handleApprove(l, 'Manager')}
                        className="form-check-input"
                        style={{ cursor: 'pointer', width: '20px', height: '20px' }}
                        title="Approve"
                      />
                      {l.approvalChain?.manager?.status === 'Pending' && l.currentStage === 'Manager' && (
                        <button
                          className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 px-2 py-0"
                          style={{ height: '24px', fontSize: '0.75rem' }}
                          onClick={() => handleReject(l, 'Manager')}
                          title="Reject with Reason"
                        >
                          <FiX /> Reject
                        </button>
                      )}
                      {l.approvalChain?.manager?.status === 'Rejected' && <span className="text-danger fw-bold small"><FiX /> Rejected</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Rejection Modal */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(46, 26, 71, 0.6)', backdropFilter: 'blur(8px)', zIndex: 3000 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '24px', border: '1px solid #E6C7E6', boxShadow: '0 20px 50px -15px rgba(102, 51, 153, 0.2)' }}>
              <div className="modal-header border-bottom px-4 py-3" style={{ borderColor: '#E6C7E6' }}>
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: 4, height: 20, backgroundColor: '#EF4444', borderRadius: 4 }}></div>
                  <h5 className="modal-title fw-bold m-0" style={{ color: '#2E1A47' }}>Adverse Determination - {actionStage}</h5>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <p style={{ color: '#A3779D' }} className="small mb-3 fw-medium">
                  Please provide a formal justification for rejecting internal leave request for <strong>{selectedLeave?.employee?.firstName} {selectedLeave?.employee?.lastName}</strong>.
                </p>

                <div className="mb-0">
                  <textarea
                    className="form-control"
                    rows="4"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    style={{ borderColor: '#E6C7E6', borderRadius: '14px', fontSize: '0.9rem', color: '#663399', padding: '12px' }}
                    placeholder="Enter audit-ready justification..."
                    autoFocus
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer border-0 p-4 pt-0 d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  className="btn px-4 fw-bold"
                  onClick={() => setShowModal(false)}
                  style={{ color: '#A3779D' }}
                >
                  Discard
                </button>
                <button
                  type="button"
                  className="btn px-5 shadow-lg"
                  onClick={submitReject}
                  disabled={!rejectionReason.trim()}
                  style={{ backgroundColor: '#EF4444', color: '#ffffff', fontWeight: 600, borderRadius: '10px' }}
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
