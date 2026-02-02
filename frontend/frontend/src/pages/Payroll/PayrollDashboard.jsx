import React from "react";

export default function PayrollDashboard() {
  return (
    <div className="p-3" style={{ background: "#fff", borderRadius: 10 }}>
      <h4 className="fw-bold mb-3">Payroll Dashboard</h4>

      <div className="row g-3">
        <div className="col-md-4">
          <div className="p-3 shadow-sm rounded bg-light">
            <h6>Total Employees</h6>
            <h3>320</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="p-3 shadow-sm rounded bg-light">
            <h6>Total Salary Expense</h6>
            <h3>₹ 42,50,000</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="p-3 shadow-sm rounded bg-light">
            <h6>Payslips Generated</h6>
            <h3>320</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
