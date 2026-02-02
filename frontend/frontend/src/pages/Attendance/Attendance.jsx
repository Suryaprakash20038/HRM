// src/pages/Attendance/Attendance.jsx
import React, { useState, useEffect, useMemo } from "react";
import AttendanceDashboard from "./AttendanceDashboard";
import AttendanceTable from "./AttendanceTable";
import AttendanceDepartmentCard from "./AttendanceDepartmentCard";
import AttendanceDepartmentModal from "./AttendanceDepartmentModal";
import employeeService from "../../services/employeeService";
import attendanceService from "../../services/attendanceService";
import '../../css/Attendences.css';
import toast from "react-hot-toast";

export default function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState({ summary: {}, totalWorkingDays: 0 });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empData, attData, summaryData] = await Promise.all([
        employeeService.getAllEmployees(),
        attendanceService.getAttendance({
          startDate: new Date().toISOString().slice(0, 10),
          endDate: new Date().toISOString().slice(0, 10),
          limit: 1000 // Fetch all for today
        }),
        attendanceService.getMonthlySummary() // Fetch summary for current month
      ]);

      const emps = empData.employees || [];
      setEmployees(emps);

      // Create a map of employeeId -> attendance record
      const attMap = {};
      if (attData.attendance) {
        attData.attendance.forEach(record => {
          // record.employee can be null if employee was deleted
          if (!record.employee) return;
          const empId = typeof record.employee === 'object' ? record.employee._id : record.employee;
          attMap[empId] = record;
        });
      }
      setAttendanceMap(attMap);

      if (summaryData) {
        setMonthlySummary(summaryData);
      }

    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkAttendance = async (empId, status) => {
    try {
      await attendanceService.markAttendance({
        employeeId: empId,
        date: new Date(),
        status: status,
        checkIn: new Date(), // Default check-in time
        checkOut: status === 'Absent' ? null : new Date() // Placeholder
      });
      toast.success(`Marked as ${status}`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Failed to mark attendance:", error);
      toast.error("Failed to mark attendance");
    }
  };

  // Group employees by department
  const departmentGroups = useMemo(() => {
    const groups = {};
    employees.forEach(emp => {
      const dept = emp.department || "General";
      if (!groups[dept]) {
        groups[dept] = [];
      }
      groups[dept].push(emp);
    });
    return groups;
  }, [employees]);

  // Get employees for the selected department modal
  const selectedDepartmentEmployees = useMemo(() => {
    if (!selectedDepartment) return [];
    return departmentGroups[selectedDepartment] || [];
  }, [selectedDepartment, departmentGroups]);

  return (
    <div className="container-fluid attendance-page" style={{ paddingBottom: 50 }}>
      <style>{`
        .attendance-page {
            background-color: #ffffff;
            background-image:
                radial-gradient(at 0% 0%, rgba(102, 51, 153, 0.05) 0px, transparent 50%),
                radial-gradient(at 100% 0%, rgba(163, 119, 157, 0.05) 0px, transparent 50%);
            min-height: 100vh;
        }
      `}</style>

      {/* ATTENDANCE DASHBOARD  */}
      <div className="mb-4">
        <AttendanceDashboard employees={employees} attendanceMap={attendanceMap} />
      </div>

      {/* DEPARTMENT CARDS */}
      <h4 className="fw-bold mb-3" style={{ color: '#2E1A47' }}>Department Attendance</h4>
      <div className="mb-4">
        {loading ? (
          <div className="text-center py-5 text-white-50">Loading departments...</div>
        ) : (
          <div className="row">
            {Object.keys(departmentGroups).length > 0 ? (
              Object.entries(departmentGroups).map(([deptName, deptEmployees]) => (
                <AttendanceDepartmentCard
                  key={deptName}
                  department={deptName}
                  employees={deptEmployees}
                  attendanceMap={attendanceMap}
                  onClick={() => setSelectedDepartment(deptName)}
                />
              ))
            ) : (
              <div className="col-12 text-center py-5 text-muted">
                <p>No departments found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ATTENDANCE TABLE */}
      <div className="mb-4">
        <AttendanceTable
          employees={employees}
          attendanceMap={attendanceMap}
          monthlySummary={monthlySummary}
          loading={loading}
          onMarkAttendance={handleMarkAttendance}
        />
      </div>

      {/* Department Modal */}
      <AttendanceDepartmentModal
        show={!!selectedDepartment}
        department={selectedDepartment}
        employees={selectedDepartmentEmployees}
        attendanceMap={attendanceMap}
        onClose={() => setSelectedDepartment(null)}
        onMarkAttendance={handleMarkAttendance}
      />

    </div>
  );
}
