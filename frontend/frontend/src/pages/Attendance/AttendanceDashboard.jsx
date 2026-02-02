import React, { useState, useEffect } from "react";
import {
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiXCircle,
} from "react-icons/fi";
import employeeService from "../../services/employeeService";
import "../../css/attendences.css";

// Corporate Pro card style
const card = {
  background: "#ffffff",
  border: "1px solid #E6C7E6",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
};

export default function AttendanceDashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAllEmployees();
      setEmployees(data.employees || []);
    } catch (error) {
      console.error("Failed to fetch employees for attendance dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Calculate KPIs from real employee data
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.isActive).length;

  // KPI definitions (using real data)
  const kpis = [
    { title: "Total Employees", value: totalEmployees, color: "#663399", icon: <FiUsers /> },
    { title: "Active Employees", value: activeEmployees, color: "#663399", icon: <FiCheckCircle /> },
    { title: "On Leave", value: 0, color: "#A3779D", icon: <FiClock /> },
    { title: "Inactive", value: totalEmployees - activeEmployees, color: "#2E1A47", icon: <FiXCircle /> },
  ];

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* KPI row only - no graphs */}
      <div className="row gx-3 gy-3">
        {kpis.map((k, idx) => (
          <div key={idx} className="col-6 col-md-3">
            <div style={card} className="animated-card">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="small fw-semibold" style={{ color: '#A3779D' }}>{k.title}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: k.color }}>
                    {loading ? "..." : k.value}
                  </div>
                </div>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: `${k.color}15`,
                  display: "grid",
                  placeItems: "center",
                  color: k.color,
                }}>
                  {k.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}