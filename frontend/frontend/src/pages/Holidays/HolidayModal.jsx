import React from "react";

export default function HolidayModal({
  open,
  onClose,
  form,
  setForm,
  onSubmit,
  editing,
}) {
  if (!open) return null;

  return (
    <div className="modal fade show" style={{ display: "grid", placeItems: "center", position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 10000, backdropFilter: 'blur(4px)', overflow: 'hidden' }}>
      <div className="modal-dialog modal-dialog-centered w-100" style={{ maxWidth: '600px' }}>
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header border-bottom px-4 py-3 bg-white" style={{ borderBottom: '2px solid #E6C7E6' }}>
            <h5 className="modal-title fw-bold" style={{ color: '#663399' }}>
              {editing ? "Edit Holiday" : "Add New Holiday"}
            </h5>
            <button type="button" className="btn-close shadow-none" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label small fw-bold" style={{ color: '#2E1A47' }}>Holiday Name</label>
                <input
                  className="form-control border shadow-sm"
                  style={{ borderColor: '#E6C7E6', borderRadius: '12px', padding: '12px' }}
                  value={form.holidayName}
                  onChange={(e) =>
                    setForm({ ...form, holidayName: e.target.value })
                  }
                  placeholder="e.g., Independence Day"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold" style={{ color: '#2E1A47' }}>Date</label>
                <input
                  type="date"
                  className="form-control border shadow-sm"
                  style={{ borderColor: '#E6C7E6', borderRadius: '12px', padding: '12px' }}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold" style={{ color: '#2E1A47' }}>Type</label>
                <select
                  className="form-select border shadow-sm"
                  style={{ borderColor: '#E6C7E6', borderRadius: '12px', padding: '12px' }}
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="Public">Public</option>
                  <option value="Optional">Optional</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label small fw-bold" style={{ color: '#2E1A47' }}>Description</label>
                <textarea
                  className="form-control border shadow-sm"
                  style={{ borderColor: '#E6C7E6', borderRadius: '12px', padding: '12px' }}
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe the holiday significance..."
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-bold" style={{ color: '#2E1A47' }}>Image Attachment (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control border shadow-sm"
                  style={{ borderColor: '#E6C7E6', borderRadius: '12px', padding: '12px' }}
                  onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer border-top bg-light/30 px-4 py-3" style={{ borderTop: '1px solid #E6C7E6' }}>
            <button type="button" className="btn btn-lg px-4" style={{ borderRadius: '12px', border: '1px solid #E6C7E6', color: '#663399', fontWeight: 600 }} onClick={onClose}>
              Cancel
            </button>

            <button
              onClick={onSubmit}
              className="btn btn-lg px-5 shadow-sm"
              style={{ borderRadius: '12px', backgroundColor: '#663399', color: '#ffffff', fontWeight: 600, border: 'none' }}
            >
              {editing ? "Save Changes" : "Create Holiday"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
