export default function HolidayTable({ holidays, onEdit, onDelete }) {
  return (
    <div style={{ background: '#ffffff', borderRadius: 24, border: '1px solid #E6C7E6', boxShadow: '0 10px 30px -10px rgba(102, 51, 153, 0.1)', overflow: 'hidden' }} className="mb-5">
      <div className="p-4 border-bottom bg-light/30" style={{ borderBottom: '1px solid #E6C7E6' }}>
        <h5 className="fw-bold m-0" style={{ color: '#663399' }}>Holiday List Management</h5>
      </div>

      <div className="table-responsive">
        <table className="table table-borderless align-middle mb-0">
          <thead>
            <tr className="small text-uppercase">
              <th className="py-3 ps-4 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Date</th>
              <th className="py-3 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Name</th>
              <th className="py-3 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Type</th>
              <th className="py-3 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Description</th>
              <th className="py-3 border-bottom text-end pe-4" style={{ color: '#663399', letterSpacing: '0.5px' }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {holidays.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-5 text-muted">
                  No holidays available for the selected filters.
                </td>
              </tr>
            )}

            {holidays.map((h) => (
              <tr key={h._id} className="border-bottom-hover">
                <td className="py-3 ps-4" style={{ color: '#2E1A47', fontWeight: 500 }}>
                  {new Date(h.date).toLocaleDateString()}
                </td>

                <td className="fw-bold" style={{ color: '#663399' }}>{h.holidayName}</td>

                <td>
                  <span
                    className="badge px-3 py-2 rounded-pill shadow-sm"
                    style={{
                      backgroundColor: h.type === "Public" ? '#E6C7E6' : '#FEF3C7',
                      color: h.type === "Public" ? '#663399' : '#D97706',
                      border: '1px solid transparent'
                    }}
                  >
                    {h.type}
                  </span>
                </td>

                <td style={{ color: '#A3779D' }} className="small text-truncate max-w-200">{h.description || "—"}</td>

                <td className="text-end pe-4">
                  <button
                    onClick={() => onEdit(h)}
                    className="btn btn-sm btn-link text-decoration-none fw-bold"
                    style={{ color: '#663399' }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => onDelete(h._id)}
                    className="btn btn-sm btn-link text-decoration-none fw-bold"
                    style={{ color: '#DC2626' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
          .max-w-200 { max-width: 200px; }
          .border-bottom-hover:hover { background-color: #fdfbff; }
      `}</style>
    </div>
  );
}
