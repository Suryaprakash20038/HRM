import React, { useMemo } from "react";
import { FiBell, FiUsers, FiClock } from "react-icons/fi";
import { FaBullhorn } from "react-icons/fa";

const glass = {
  background: "#ffffff",
  borderRadius: 24,
  border: "1px solid #E6C7E6",
  boxShadow: "0 4px 20px -10px rgba(102, 51, 153, 0.1)",
  padding: 20,
};

export default function AnnouncementDashboard({ announcements = [] }) {
  const total = announcements.length;
  const scheduled = announcements.filter(a => a.scheduled && !a.sent).length;
  const sent = announcements.filter(a => a.sent).length;

  const recent = useMemo(() => {
    return announcements
      .slice()
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, 4);
  }, [announcements]);

  return (
    <div className="container-fluid p-0">

      {/* KPI CARDS */}
      <div className="row g-4 mb-4">

        <div className="col-md-3">
          <div style={glass} className="h-100 d-flex flex-column justify-content-between">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="small fw-bold text-uppercase" style={{ color: '#A3779D', letterSpacing: '0.5px' }}>Total Ledger</div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#E6C7E6', color: '#663399' }}>
                <FiBell className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="h3 fw-bold mb-1" style={{ color: '#2E1A47' }}>{total}</div>
              <div className="small opacity-75" style={{ color: '#A3779D' }}>Lifetime broadcasts</div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div style={glass} className="h-100 d-flex flex-column justify-content-between">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="small fw-bold text-uppercase" style={{ color: '#A3779D', letterSpacing: '0.5px' }}>Pending Send</div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                <FiClock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="h3 fw-bold mb-1" style={{ color: '#2E1A47' }}>{scheduled}</div>
              <div className="small opacity-75" style={{ color: '#A3779D' }}>Awaiting execution</div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div style={glass} className="h-100 d-flex flex-column justify-content-between">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="small fw-bold text-uppercase" style={{ color: '#A3779D', letterSpacing: '0.5px' }}>Delivered</div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>
                <FiUsers className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="h3 fw-bold mb-1" style={{ color: '#2E1A47' }}>{sent}</div>
              <div className="small opacity-75" style={{ color: '#A3779D' }}>Successfully transmitted</div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div style={glass} className="h-100 d-flex flex-column justify-content-center align-items-center">
            <button
              className="btn w-100 py-3 shadow-sm hover-elevate transition-all"
              style={{ backgroundColor: '#663399', color: '#ffffff', borderRadius: '16px', fontWeight: 600, border: 'none' }}
            >
              <FaBullhorn className="me-2" /> New Broadcast
            </button>
          </div>
        </div>

      </div>

      {/* RECENT ANNOUNCEMENTS */}
      <div style={glass}>
        <div className="d-flex align-items-center gap-2 mb-4">
          <div style={{ width: 4, height: 20, backgroundColor: '#663399', borderRadius: 4 }}></div>
          <h5 className="fw-bold m-0" style={{ color: '#2E1A47' }}>Recent Communications Activity</h5>
        </div>

        <div className="list-group list-group-flush">
          {recent.length === 0 ? (
            <div className="py-5 text-center text-muted border rounded-3" style={{ borderStyle: 'dashed !important', borderColor: '#E6C7E6 !important' }}>
              <FaBullhorn className="w-10 h-10 mb-3 opacity-20" style={{ color: '#663399' }} />
              <p className="fw-bold mb-0" style={{ color: '#A3779D' }}>No recent activity detected.</p>
            </div>
          ) : (
            recent.map(a => (
              <div
                key={a.id}
                className="list-group-item d-flex justify-content-between align-items-center border-bottom-hover px-0 py-3"
                style={{ background: 'transparent', borderBottom: '1px solid #f1f5f9' }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 rounded-circle" style={{ backgroundColor: '#f8fafc', color: '#663399' }}>
                    <FiBell />
                  </div>
                  <div>
                    <div className="fw-bold" style={{ color: '#2E1A47' }}>{a.title}</div>
                    <div className="small opacity-75 truncate" style={{ color: '#A3779D', maxWidth: '400px' }}>
                      {a.summary || a.body?.slice(0, 100)}
                    </div>
                  </div>
                </div>

                <div className="text-end">
                  <span className={`badge px-3 py-2 rounded-pill ${a.sent ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}
                    style={{ backgroundColor: a.sent ? '#D1FAE5' : '#FEF3C7', color: a.sent ? '#059669' : '#D97706', fontSize: '11px', fontWeight: 600 }}>
                    {a.scheduled && !a.sent ? 'Scheduled' : a.sent ? 'Distributed' : 'Draft'}
                  </span>
                  <div className="x-small mt-1 opacity-50" style={{ color: '#A3779D', fontSize: '10px' }}>
                    {new Date(a.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .border-bottom-hover:hover { background-color: #fdfbff !important; padding-left: 10px !important; padding-right: 10px !important; transition: all 0.2s ease; border-radius: 12px; }
        .hover-elevate:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(102, 51, 153, 0.2) !important; filter: brightness(1.1); }
      `}</style>

    </div>
  );
}
