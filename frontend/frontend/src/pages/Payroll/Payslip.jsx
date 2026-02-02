import React, { useState } from "react";

export default function Payslip() {
  const [id, setId] = useState("");

  return (
    <div className="p-3 bg-white rounded shadow-sm">
      <h4 className="fw-bold mb-3">Payslip Generator</h4>

      <div className="row g-3">
        <div className="col-md-4">
          <label className="form-label">Employee ID</label>
          <input
            className="form-control"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Enter ID"
          />
        </div>

        <div className="col-md-3 d-flex align-items-end">
          <button className="btn btn-primary w-100">Generate</button>
        </div>
      </div>
    </div>
  );
}
