import React, { useState, useRef, useEffect } from "react";

/**
 * Reusable Add/Edit modal for announcements.
 * Props:
 *  - open (bool)
 *  - initial (object) optional
 *  - onClose()
 *  - onSave(announcement)
 */
const glass = {
  background: "#ffffff",
  borderRadius: 32,
  border: "1px solid #E6C7E6",
  boxShadow: "0 20px 50px -15px rgba(102, 51, 153, 0.15)",
  overflow: 'hidden'
};

export default function NewAnnouncement({ open, initial = null, onClose, onSave }) {
  const [form, setForm] = useState({
    title: "",
    summary: "",
    body: "",
    audience: "All",
    scheduled: false,
    scheduleAt: "",
  });

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || "",
        summary: initial.summary || "",
        body: initial.body || "",
        audience: initial.audience || "All",
        scheduled: !!initial.scheduled,
        scheduleAt: initial.scheduleAt ? initial.scheduleAt.slice(0, 16) : "",
      });
    } else {
      setForm({
        title: "",
        summary: "",
        body: "",
        audience: "All",
        scheduled: false,
        scheduleAt: "",
      });
    }
  }, [initial, open]);

  if (!open) return null;

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(s => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  }

  function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return alert("Communication Title Required");
    const payload = {
      ...initial,
      title: form.title.trim(),
      summary: form.summary.trim(),
      body: form.body.trim(),
      audience: form.audience,
      scheduled: !!form.scheduled,
      scheduleAt: form.scheduled && form.scheduleAt ? new Date(form.scheduleAt).toISOString() : null,
      sent: initial?.sent || false,
      createdAt: initial?.createdAt || Date.now(),
      id: initial?.id || Date.now(),
    };
    onSave && onSave(payload);
  }

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(46, 26, 71, 0.6)', backdropFilter: 'blur(8px)', zIndex: 3000 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-none" style={glass}>
          <div className="modal-header px-4 py-3 border-bottom" style={{ borderColor: '#E6C7E6' }}>
            <div className="d-flex align-items-center gap-2">
              <div style={{ width: 4, height: 20, backgroundColor: '#663399', borderRadius: 4 }}></div>
              <h5 className="fw-bold m-0" style={{ color: '#2E1A47' }}>
                {initial ? "Refine Communication Asset" : "Draft New Broadcast"}
              </h5>
            </div>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <form onSubmit={submit}>
            <div className="modal-body p-4 custom-scrollbar" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div className="mb-4">
                <label className="small fw-bold mb-2 d-block" style={{ color: '#2E1A47' }}>Message Title <span className="text-danger">*</span></label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="form-control"
                  style={{ borderColor: '#E6C7E6', borderRadius: '12px', padding: '12px', color: '#663399', fontWeight: 600 }}
                  placeholder="e.g. Q4 Strategic Performance Review"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="small fw-bold mb-2 d-block" style={{ color: '#2E1A47' }}>Executive Summary</label>
                <input
                  name="summary"
                  value={form.summary}
                  onChange={handleChange}
                  className="form-control"
                  style={{ borderColor: '#E6C7E6', borderRadius: '12px', padding: '12px', color: '#663399' }}
                  placeholder="Brief 1-line overview of the communication..."
                />
              </div>

              <div className="mb-4">
                <label className="small fw-bold mb-2 d-block" style={{ color: '#2E1A47' }}>Full Message Body Content</label>
                <textarea
                  name="body"
                  value={form.body}
                  onChange={handleChange}
                  className="form-control"
                  rows={6}
                  style={{ borderColor: '#E6C7E6', borderRadius: '12px', padding: '12px', color: '#663399' }}
                  placeholder="Detailed information regarding this announcement..."
                />
              </div>

              <div className="row g-4 align-items-end">
                <div className="col-md-5">
                  <label className="small fw-bold mb-2 d-block" style={{ color: '#2E1A47' }}>Target Audience Segment</label>
                  <select
                    name="audience"
                    value={form.audience}
                    onChange={handleChange}
                    className="form-select"
                    style={{ borderColor: '#E6C7E6', borderRadius: '12px', padding: '12px', color: '#663399', fontWeight: 600 }}
                  >
                    <option value="All">Enterprise Wide</option>
                    <option value="HR">Human Resources</option>
                    <option value="Sales">Revenue & Growth</option>
                    <option value="IT">Systems & Infrastructure</option>
                    <option value="Managers">Leadership Tier</option>
                  </select>
                </div>

                <div className="col-md-7">
                  <div className="p-3 rounded-2xl border d-flex flex-column gap-3" style={{ backgroundColor: '#fdfbff', borderColor: '#E6C7E6' }}>
                    <div className="form-check form-switch d-flex align-items-center gap-2 ps-0">
                      <input
                        className="form-check-input ms-0"
                        type="checkbox"
                        id="sch"
                        name="scheduled"
                        checked={form.scheduled}
                        onChange={handleChange}
                        style={{ width: '2.5rem', height: '1.25rem' }}
                      />
                      <label className="small fw-bold" style={{ color: '#663399' }} htmlFor="sch">Enable Scheduled Propagation</label>
                    </div>

                    {form.scheduled && (
                      <input
                        type="datetime-local"
                        name="scheduleAt"
                        value={form.scheduleAt}
                        onChange={handleChange}
                        className="form-control border-0 shadow-sm"
                        style={{ borderRadius: '10px', fontSize: '0.85rem' }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer px-4 py-3 border-top" style={{ borderColor: '#E6C7E6' }}>
              <button
                type="button"
                className="btn px-4 fw-bold"
                onClick={onClose}
                style={{ color: '#A3779D' }}
              >
                Discard Draft
              </button>
              <button
                type="submit"
                className="btn px-5 shadow-lg"
                style={{ backgroundColor: '#663399', color: '#ffffff', fontWeight: 600, borderRadius: '12px', padding: '10px 24px' }}
              >
                {initial ? "Update Broadcast" : "Finalize Asset"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E6C7E6; border-radius: 10px; }
      `}</style>
    </div>
  );
}
