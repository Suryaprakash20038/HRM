// src/pages/Status/StatusList.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiEdit2, FiAlertTriangle } from "react-icons/fi";
import employeeService from "../../services/employeeService";

const wrapper = {
  background: "#ffffff",
  border: "1px solid #E6C7E6",
  borderRadius: 24,
  padding: 24,
  boxShadow: "0 10px 30px -10px rgba(102, 51, 153, 0.1)",
};

export default function StatusList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEmp, setEditingEmp] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [filterStatus, setFilterStatus] = useState("Confirmed");

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = filterStatus !== "All" ? { status: filterStatus } : {};
      const data = await employeeService.getAllEmployees(params);
      setEmployees(data.employees || []);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [filterStatus]);

  const handleEdit = (emp) => {
    setEditingEmp(emp);
    setNewStatus(emp.status || "Probation");
  };

  const handleSave = async () => {
    if (!editingEmp) return;
    try {
      await employeeService.updateEmployee(editingEmp._id, { ...editingEmp, status: newStatus });
      // Refresh list
      fetchEmployees();
      setEditingEmp(null);
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status");
    }
  };

  // Helper function to get employee photo URL
  const getEmployeePhotoUrl = (emp) => {
    if (emp.profileImage) {
      if (emp.profileImage.startsWith('http')) {
        return emp.profileImage;
      }
      return `http://localhost:5000/${emp.profileImage}`;
    }
    return `https://i.pravatar.cc/40?u=${emp._id || emp.email}`;
  };

  return (
    <div className="mt-3" style={wrapper}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="m-0 fw-bold" style={{ color: '#663399' }}>Employment Status List</h5>
          <div className="small" style={{ color: '#A3779D' }}>{employees.length} employees found</div>
        </div>
        <div style={{ width: 200 }}>
          <select
            className="form-select border shadow-sm"
            style={{ borderColor: '#E6C7E6', color: '#663399', fontWeight: 600, borderRadius: '10px' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Intern">Intern</option>
            <option value="Probation">Probation</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Resignation Submitted">Resignation Submitted</option>
            <option value="Notice Period">Notice Period</option>
            <option value="Relieved">Relieved</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-borderless align-middle">
          <thead>
            <tr className="small text-uppercase">
              <th className="py-3 ps-3 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Employee</th>
              <th className="py-3 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Position</th>
              <th className="py-3 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Department</th>
              <th className="py-3 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Status</th>
              <th className="py-3 border-bottom text-end" style={{ width: 150, color: '#663399', letterSpacing: '0.5px' }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center">Loading...</td></tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp._id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={getEmployeePhotoUrl(emp)}
                        alt={emp.firstName}
                        className="rounded-circle"
                        style={{ width: 32, height: 32, objectFit: 'cover' }}
                      />
                      <span>{emp.firstName} {emp.lastName}</span>
                    </div>
                  </td>

                  <td>{emp.position || emp.role}</td>
                  <td>{emp.department}</td>

                  <td>
                    <span
                      className="badge px-3 py-2 rounded-pill shadow-sm"
                      style={{
                        backgroundColor: emp.status === "Confirmed" ? '#E6C7E6' :
                          emp.status === "Probation" ? '#FEF3C7' :
                            emp.status === "Terminated" ? '#FEE2E2' :
                              emp.status === "Notice Period" ? '#FEE2E2' : '#f1f5f9',
                        color: emp.status === "Confirmed" ? '#663399' :
                          emp.status === "Probation" ? '#D97706' :
                            emp.status === "Terminated" ? '#DC2626' :
                              emp.status === "Notice Period" ? '#DC2626' : '#64748b',
                        border: `1px solid ${emp.status === "Confirmed" ? '#66339930' :
                          emp.status === "Probation" ? '#D9770630' :
                            emp.status === "Terminated" ? '#DC262630' :
                              emp.status === "Notice Period" ? '#DC262630' : '#E6C7E6'}`
                      }}
                    >
                      {emp.status || "—"}
                    </span>
                  </td>

                  <td className="text-end">
                    <button
                      className="btn btn-sm shadow-sm"
                      style={{ backgroundColor: '#E0F2FE', color: '#0284C7', fontWeight: 600, border: 'none', borderRadius: '8px' }}
                      onClick={() => handleEdit(emp)}
                    >
                      <FiEdit2 className="me-1" /> Edit
                    </button>
                    {(emp.status === 'Resignation Submitted') && (
                      <Link to="/resignation/approvals" className="btn btn-sm btn-outline-warning ms-1 shadow-sm" style={{ borderRadius: '8px' }} title="Approve Resignation">
                        <FiAlertTriangle />
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Status Modal */}
      {editingEmp && (
        <div className="modal fade show" style={{ display: "grid", placeItems: 'center', position: 'fixed', inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 10000, backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered w-100" style={{ maxWidth: '500px' }}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header border-bottom px-4 py-3 bg-white" style={{ borderBottom: '2px solid #E6C7E6' }}>
                <h5 className="modal-title fw-bold" style={{ color: '#663399' }}>Update Status: {editingEmp.firstName}</h5>
                <button type="button" className="btn-close shadow-none" onClick={() => setEditingEmp(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label small fw-bold" style={{ color: '#2E1A47' }}>Employment Status</label>
                  <select
                    className="form-select border shadow-sm"
                    style={{ borderColor: '#E6C7E6', borderRadius: '12px', padding: '12px' }}
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="Intern">Intern</option>
                    <option value="Probation">Probation</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Resignation Submitted">Resignation Submitted</option>
                    <option value="Notice Period">Notice Period</option>
                    <option value="Relieved">Relieved</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer border-top bg-light/30 px-4 py-3" style={{ borderTop: '1px solid #E6C7E6' }}>
                <button type="button" className="btn btn-lg px-4" style={{ borderRadius: '12px', border: '1px solid #E6C7E6', color: '#663399', fontWeight: 600 }} onClick={() => setEditingEmp(null)}>Cancel</button>
                <button type="button" className="btn btn-lg px-4 shadow-sm" style={{ borderRadius: '12px', backgroundColor: '#663399', color: '#ffffff', fontWeight: 600 }} onClick={handleSave}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
