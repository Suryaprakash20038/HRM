// src/pages/Shift/Shift.jsx
import React, { useState, useEffect } from "react";
import shiftService from "../../services/shiftService";
import employeeService from "../../services/employeeService";
import ShiftRoster from "./ShiftRoster";

export default function Shift() {
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount
  const fetchData = async () => {
    try {
      setLoading(true);
      const [shiftData, empData] = await Promise.all([
        shiftService.getAllShifts(),
        employeeService.getAllEmployees()
      ]);
      setShifts(shiftData.shifts || []);
      setEmployees(empData.employees || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container-fluid shift-page" style={{ paddingBottom: 80 }}>
      <style>{`
          .shift-page {
              background-color: #ffffff;
              background-image:
                  radial-gradient(at 0% 0%, rgba(102, 51, 153, 0.05) 0px, transparent 50%),
                  radial-gradient(at 100% 0%, rgba(163, 119, 157, 0.05) 0px, transparent 50%);
              min-height: 100vh;
          }
      `}</style>
      {/* header row */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="m-0 fw-bold" style={{ color: '#2E1A47' }}>Shift Management</h3>
          <div style={{ color: '#A3779D' }} className="small text-muted">Manage employee shift schedules</div>
        </div>
      </div>

      <ShiftRoster shifts={shifts} employees={employees} onRefreshShifts={fetchData} />
    </div>
  );
}
