// src/pages/Employees/EmployeeList.jsx
import React from "react";
import { FiEye, FiEdit2, FiTrash2, FiMail } from "react-icons/fi";

export default function EmployeeList({ employees = [], onEdit, onView, onDelete, onSendEmail }) {
  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
        <thead className="">
          <tr className="small fw-bold bg-light" style={{ letterSpacing: '0.8px', fontSize: '0.75rem', color: '#663399' }}>
            <th className="py-4 ps-5 border-bottom">Employee</th>
            <th className="py-4 border-bottom">Position</th>
            <th className="py-4 border-bottom">Department</th>
            <th className="py-4 border-bottom">Type</th>
            <th className="py-4 border-bottom text-center" style={{ width: 140 }}>Status</th>
            <th className="py-4 pe-5 border-bottom text-end" style={{ width: 180 }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {(() => {
            // Group employees by domain
            const grouped = employees.reduce((acc, emp) => {
              const domain = emp.domain || "General / No Domain";
              if (!acc[domain]) acc[domain] = [];
              acc[domain].push(emp);
              return acc;
            }, {});

            const sortedDomains = Object.keys(grouped).sort();

            if (sortedDomains.length === 0) {
              return (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted bg-light bg-opacity-10">
                    <div className="d-flex flex-column align-items-center py-5">
                      <div className="bg-white p-4 rounded-circle shadow-sm mb-3">
                        <FiEye size={32} className="text-muted opacity-50" />
                      </div>
                      <h5 className="fw-bold text-dark">No employees found</h5>
                      <p className="small text-muted mb-0">Add employees to populate this list.</p>
                    </div>
                  </td>
                </tr>
              );
            }

            return sortedDomains.map(domain => (
              <React.Fragment key={domain}>
                {/* Domain Header Row */}
                <tr className="bg-light">
                  <td colSpan={6} className="py-3 ps-5 fw-bold border-bottom small text-uppercase" style={{ letterSpacing: '1px', backgroundColor: '#f8f9fa', color: '#663399' }}>
                    {domain} <span className="fw-normal ms-2" style={{ color: '#A3779D' }}>({grouped[domain].length})</span>
                  </td>
                </tr>
                {/* Employee Rows */}
                {grouped[domain].map((emp) => (
                  <tr key={emp.id} className="bg-white hover-shadow-sm transition-all" style={{ transition: 'all 0.2s ease-in-out' }}>
                    <td className="py-4 ps-5 border-bottom-light">
                      <div className="d-flex align-items-center gap-4">
                        <div className="position-relative">
                          <img
                            src={emp.photoUrl || `https://i.pravatar.cc/100?u=${emp.id}`}
                            alt={emp.name}
                            className="rounded-4 border border-2 border-white shadow-sm object-fit-cover"
                            style={{ width: 56, height: 56 }}
                          />
                          <span
                            className={`position-absolute bottom-0 end-0 p-1 border border-2 border-white rounded-circle ${emp.isActive !== false ? "bg-success" : "bg-danger"}`}
                            style={{ width: 16, height: 16, transform: 'translate(20%, 20%)' }}
                          ></span>
                        </div>
                        <div>
                          <h6 className="fw-bold text-dark mb-1 fs-6">{emp.name}</h6>
                          <div className="text-muted small font-monospace">{emp.email || "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 border-bottom-light">
                      <span className="fw-semibold text-secondary">{emp.position || emp.role}</span>
                    </td>
                    <td className="py-4 border-bottom-light">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-light border fw-normal" style={{ color: '#663399' }}>{emp.department}</span>
                      </div>
                    </td>
                    <td className="py-4 border-bottom-light">
                      <span className="badge border-0 fw-medium px-3 py-2 rounded-pill" style={{ backgroundColor: '#E6C7E6', color: '#663399' }}>
                        {emp.type || 'Full Time'}
                      </span>
                    </td>
                    <td className="py-4 border-bottom-light text-center">
                      <span className={`badge rounded-pill px-3 py-2 fw-bold`} style={{ letterSpacing: '0.5px', backgroundColor: emp.isActive !== false ? '#E6C7E6' : '#FEE2E2', color: emp.isActive !== false ? '#663399' : '#DC2626' }}>
                        {emp.isActive !== false ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className="py-4 pe-5 border-bottom-light text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        <button className="btn btn-icon btn-light border-0 rounded-circle shadow-sm hover-scale" onClick={() => onView && onView(emp)} title="View Profile" style={{ width: 40, height: 40, color: '#663399' }}>
                          <FiEye size={18} />
                        </button>
                        <button className="btn btn-icon btn-light text-primary border-0 rounded-circle shadow-sm hover-scale" onClick={() => onSendEmail && onSendEmail(emp)} title="Send HR Email" style={{ width: 40, height: 40 }}>
                          <FiMail size={18} />
                        </button>
                        <button className="btn btn-icon btn-light text-warning border-0 rounded-circle shadow-sm hover-scale" onClick={() => onEdit && onEdit(emp)} title="Edit Employee" style={{ width: 40, height: 40 }}>
                          <FiEdit2 size={18} />
                        </button>
                        <button className="btn btn-icon btn-light text-danger border-0 rounded-circle shadow-sm hover-scale" onClick={() => onDelete && onDelete(emp.id)} title="Delete Employee" style={{ width: 40, height: 40 }}>
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ));
          })()}
        </tbody>
      </table>
    </div>
  );
}
