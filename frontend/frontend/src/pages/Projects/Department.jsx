import React from "react";

const glass = {
  background: "#ffffff",
  borderRadius: 24,
  border: "1px solid #E6C7E6",
  padding: 30,
  boxShadow: "0 10px 30px -10px rgba(102, 51, 153, 0.1)",
};

export default function Department() {
  const departments = [
    { id: "d1", name: "Engineering Division", projects: 4 },
    { id: "d2", name: "Strategic Design Group", projects: 2 },
    { id: "d3", name: "Market Acquisition & Sales", projects: 1 },
  ];

  return (
    <div style={glass} className="shadow-sm">
      <div className="d-flex align-items-center gap-2 mb-4">
        <div style={{ width: 4, height: 20, backgroundColor: '#663399', borderRadius: 4 }}></div>
        <h5 className="fw-bold m-0" style={{ color: '#2E1A47' }}>Division Hierarchy</h5>
      </div>

      <div className="d-flex flex-column gap-2">
        {departments.map(d => (
          <div key={d.id} className="p-3 d-flex justify-content-between align-items-center rounded-xl border transition-all" style={{ backgroundColor: '#ffffff', borderColor: '#f1f5f9' }}>
            <div className="fw-bold" style={{ color: '#2E1A47' }}>{d.name}</div>
            <div className="badge px-3 py-2 rounded-pill shadow-sm" style={{ backgroundColor: '#E6C7E6', color: '#663399', fontSize: '11px', fontWeight: 700 }}>
              {d.projects} ACTIVE PROJECTS
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .rounded-xl { border-radius: 12px; }
      `}</style>
    </div>
  );
}
