import React from "react";
import { FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";

const glass = {
  background: "#ffffff",
  borderRadius: 24,
  border: "1px solid #E6C7E6",
  boxShadow: "0 10px 30px -10px rgba(102, 51, 153, 0.1)",
  padding: 24,
  overflow: 'hidden'
};

function fmtDate(dt) {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function AnnouncementList({ announcements = [], onView, onEdit, onDelete, onToggleSend }) {
  return (
    <div style={glass}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          <div style={{ width: 4, height: 20, backgroundColor: '#663399', borderRadius: 4 }}></div>
          <h5 className="fw-bold m-0" style={{ color: '#2E1A47' }}>Communications Registry</h5>
        </div>
        <div className="badge px-3 py-2 rounded-pill shadow-sm" style={{ backgroundColor: '#E6C7E6', color: '#663399', fontWeight: 600 }}>
          {announcements.length} Total Records
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              <th className="px-4 py-3 border-0" style={{ color: '#663399', fontSize: '0.85rem', fontWeight: 600, borderRadius: '12px 0 0 12px' }}>Status</th>
              <th className="px-4 py-3 border-0" style={{ color: '#663399', fontSize: '0.85rem', fontWeight: 600 }}>Message Title</th>
              <th className="px-4 py-3 border-0" style={{ color: '#663399', fontSize: '0.85rem', fontWeight: 600 }}>Distribution Schedule</th>
              <th className="px-4 py-3 border-0" style={{ color: '#663399', fontSize: '0.85rem', fontWeight: 600 }}>Target Audience</th>
              <th className="px-4 py-3 border-0 text-end" style={{ color: '#663399', fontSize: '0.85rem', fontWeight: 600, borderRadius: '0 12px 12px 0' }}>Orchestration</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ height: '12px' }}></tr> {/* Spacer */}
            {announcements.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-5">
                  <div className="text-muted">
                    <FiEye className="w-12 h-12 mb-3 opacity-20" style={{ color: '#663399' }} />
                    <p className="fw-bold mb-0" style={{ color: '#A3779D' }}>No communications found in the registry.</p>
                  </div>
                </td>
              </tr>
            ) : (
              announcements.map(a => (
                <tr key={a.id} className="border-bottom-hover">
                  <td className="px-4 py-3">
                    <span className={`badge px-3 py-2 rounded-pill`}
                      style={{
                        backgroundColor: a.sent ? '#D1FAE5' : a.scheduled ? '#FEF3C7' : '#f1f5f9',
                        color: a.sent ? '#059669' : a.scheduled ? '#D97706' : '#64748b',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                      {a.sent ? "PUBLISHED" : a.scheduled ? "SCHEDULED" : "DRAFT"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="fw-bold mb-1" style={{ color: '#2E1A47' }}>{a.title}</div>
                    <div className="small opacity-75 truncate" style={{ color: '#A3779D', maxWidth: '300px' }}>
                      {a.summary || (a.body || "").slice(0, 60)}...
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="d-flex align-items-center gap-2">
                      <FiClock className="opacity-50" style={{ color: '#663399' }} />
                      <span className="small fw-semibold" style={{ color: '#2E1A47' }}>
                        {a.scheduled ? fmtDate(a.scheduleAt) : "On-Demand"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge px-3 py-1 rounded-pill" style={{ backgroundColor: '#E0E7FF', color: '#4338CA', fontSize: '11px' }}>
                      {a.audience || "Proprietary All"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <div className="d-flex gap-2 justify-content-end">
                      <button
                        className="btn btn-sm p-2 rounded-lg transition-all"
                        style={{ backgroundColor: '#f8fafc', color: '#663399' }}
                        onClick={() => onView && onView(a)}
                        title="View Asset"
                      >
                        <FiEye />
                      </button>
                      <button
                        className="btn btn-sm p-2 rounded-lg transition-all"
                        style={{ backgroundColor: '#f8fafc', color: '#A3779D' }}
                        onClick={() => onEdit && onEdit(a)}
                        title="Edit Metadata"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="btn btn-sm p-2 rounded-lg transition-all hover-danger"
                        style={{ backgroundColor: '#fdf2f2', color: '#EF4444' }}
                        onClick={() => onDelete && onDelete(a.id)}
                        title="Destroy Record"
                      >
                        <FiTrash2 />
                      </button>
                      <button
                        className="btn btn-sm px-3 fw-bold rounded-lg transition-all"
                        style={{
                          backgroundColor: a.sent ? '#f1f5f9' : '#663399',
                          color: a.sent ? '#64748b' : '#ffffff',
                          border: 'none'
                        }}
                        onClick={() => onToggleSend && onToggleSend(a)}
                        title={a.sent ? "Retract Dispatch" : "Immediate Broadcast"}
                      >
                        {a.sent ? "Retract" : "Dispatch"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .border-bottom-hover:hover { background-color: #fdfbff !important; transition: all 0.2s ease; }
        .hover-danger:hover { background-color: #fee2e2 !important; color: #dc2626 !important; }
        .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      `}</style>
    </div>
  );
}
