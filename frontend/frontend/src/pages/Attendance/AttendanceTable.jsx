import React, { useState } from "react";
import { FiSearch, FiFilter, FiDownload, FiMoreVertical } from "react-icons/fi";

export default function AttendanceTable({ employees = [], attendanceMap = {}, monthlySummary = { summary: {}, totalWorkingDays: 0 }, loading = false, onMarkAttendance }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

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

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = (emp.firstName + " " + emp.lastName).toLowerCase().includes(search.toLowerCase());
    if (filter === "All") return matchesSearch;
    // Filter by attendance status
    const status = attendanceMap[emp._id]?.status || "Not Marked";
    return matchesSearch && status === filter;
  }).sort((a, b) => {
    const getRank = (p) => {
      const pos = (p || "").toLowerCase();
      if (pos.includes('manager')) return 1;
      if (pos.includes('lead') || pos.includes('tl')) return 2;
      return 3;
    };
    return getRank(a.position) - getRank(b.position);
  });

  const handleAction = (empId, status) => {
    if (onMarkAttendance) {
      onMarkAttendance(empId, status);
    }
  };

  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 24, border: '1px solid #E6C7E6' }}>
      <div className="card-body p-4">
        {/* Header & Filters */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-4">
          <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3" style={{ width: "100%", maxWidth: 300, backgroundColor: '#f8fafc', border: '1px solid #E1E8ED' }}>
            <FiSearch style={{ color: '#A3779D' }} />
            <input
              type="text"
              placeholder="Search employee..."
              className="border-0 bg-transparent w-100"
              style={{ outline: "none", color: '#2E1A47' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="d-flex gap-2">
            <select
              className="form-select border-0"
              style={{ width: 150, backgroundColor: '#f8fafc', border: '1px solid #E1E8ED', color: '#663399', fontWeight: 600 }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Half Day">Half Day</option>
              <option value="Early Checkout">Early Checkout</option>
              <option value="Not Marked">Not Marked</option>
            </select>
            <button className="btn btn-light border-0" style={{ backgroundColor: '#f8fafc', color: '#663399' }}><FiFilter /></button>
            <button className="btn" style={{ backgroundColor: '#663399', color: '#ffffff' }}><FiDownload /> Export</button>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead style={{ backgroundColor: '#f8fafc' }}>
              <tr className="small text-uppercase">
                <th className="py-4 ps-4 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Employee</th>
                <th className="py-4 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Role</th>
                <th className="py-4 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Department</th>
                <th className="py-4 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Date</th>
                <th className="py-4 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Check In</th>
                <th className="py-4 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Status</th>
                <th className="py-4 border-bottom text-center" style={{ color: '#663399', letterSpacing: '0.5px' }}>Working Days</th>
                <th className="py-4 border-bottom text-end pe-4" style={{ color: '#663399', letterSpacing: '0.5px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center py-4">Loading...</td></tr>
              ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => {
                  const att = attendanceMap[emp._id];
                  const status = att?.status || "Not Marked";
                  const statusColor =
                    status === "Present" ? "success" :
                      status === "Absent" ? "danger" :
                        status === "Late" ? "warning" :
                          status === "Half Day" ? "info" :
                            status === "Early Checkout" ? "warning" : "secondary";

                  // Monthly Summary Calculation
                  const presentDays = monthlySummary.summary[emp._id] || 0;
                  const totalWorkingDays = monthlySummary.totalWorkingDays || 0;
                  // Handle cases where total working days might be 0 (e.g. beginning of month or error)
                  const displayTotal = totalWorkingDays === 0 ? '-' : totalWorkingDays;

                  return (
                    <tr key={emp._id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={getEmployeePhotoUrl(emp)}
                            className="rounded-circle object-fit-cover"
                            width="40"
                            height="40"
                            alt={emp.firstName}
                          />
                          <div>
                            <div className="fw-bold text-dark">{emp.firstName} {emp.lastName}</div>
                            <div className="small text-muted">{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{emp.domain ? `${emp.position} (${emp.domain})` : (emp.position || "—")}</td>
                      <td>{emp.department || "—"}</td>
                      <td>{new Date().toLocaleDateString()}</td>
                      <td className="fw-bold" style={{ color: '#663399' }}>
                        {att?.checkIn ? new Date(att.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : <span className="text-muted" style={{ fontSize: '0.85rem' }}>--:--</span>}
                      </td>
                      <td>
                        <span className={`badge px-3 py-2 rounded-pill`} style={{
                          backgroundColor: status === 'Present' ? '#E6C7E6' : status === 'Absent' ? '#FEE2E2' : '#FEF3C7',
                          color: status === 'Present' ? '#663399' : status === 'Absent' ? '#DC2626' : '#D97706'
                        }}>
                          {status}
                        </span>
                      </td>
                      <td className="text-center fw-medium">
                        {presentDays} / {displayTotal} Day{presentDays !== 1 ? 's' : ''}
                      </td>
                      <td className="text-end pe-4">
                        <div className="dropdown">
                          <button className="btn btn-light btn-sm rounded-circle" data-bs-toggle="dropdown">
                            <FiMoreVertical />
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end">
                            <li><button className="dropdown-item" onClick={() => handleAction(emp._id, 'Present')}>Mark Present</button></li>
                            <li><button className="dropdown-item" onClick={() => handleAction(emp._id, 'Absent')}>Mark Absent</button></li>
                            <li><button className="dropdown-item" onClick={() => handleAction(emp._id, 'Late')}>Mark Late</button></li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
