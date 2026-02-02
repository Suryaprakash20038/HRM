import React from "react";

const glass = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(8px)",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
  padding: 14,
};

function fmt(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString();
}

export default function Scheduled({ announcements = [], onCancel, onSendNow }) {
  const scheduled = announcements.filter(a => a.scheduled && !a.sent).sort((a,b) => (a.scheduleAt || "").localeCompare(b.scheduleAt || ""));
  return (
    <div style={glass}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0">Scheduled Announcements</h5>
        <div className="small text-muted">{scheduled.length} pending</div>
      </div>

      {scheduled.length === 0 ? (
        <div className="text-muted small">No scheduled announcements.</div>
      ) : (
        <div className="list-group">
          {scheduled.map(a => (
            <div key={a.id} className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 py-2">
              <div>
                <div className="fw-semibold">{a.title}</div>
                <div className="small text-muted">{a.summary || (a.body || "").slice(0,80)}</div>
                <div className="small text-muted mt-1">Scheduled at {fmt(a.scheduleAt)}</div>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-success" onClick={() => onSendNow && onSendNow(a)}>Send Now</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => onCancel && onCancel(a.id)}>Cancel</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
