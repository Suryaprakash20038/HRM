import React from "react";

const glass = {
  background: "#ffffff",
  borderRadius: 24,
  border: "1px solid #E6C7E6",
  padding: 24,
  boxShadow: "0 10px 30px -10px rgba(102, 51, 153, 0.1)",
};

export default function Team() {
  const members = [
    { id: 101, name: "Anita Sharma", role: "Executive Project Manager", avatar: "A" },
    { id: 102, name: "John Doe", role: "Senior Systems Architect", avatar: "J" },
    { id: 103, name: "Ravi Kumar", role: "Quality Assurance Specialist", avatar: "R" },
  ];

  return (
    <div style={glass} className="shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          <div style={{ width: 4, height: 20, backgroundColor: '#663399', borderRadius: 4 }}></div>
          <h5 className="fw-bold m-0" style={{ color: '#2E1A47' }}>Resource Allocation</h5>
        </div>
        <div className="badge px-3 py-1 rounded-pill" style={{ backgroundColor: '#E6C7E6', color: '#663399', fontWeight: 700, fontSize: '11px' }}>
          {members.length} CORE STAKEHOLDERS
        </div>
      </div>

      <div className="d-flex flex-column gap-3">
        {members.map(m => (
          <div key={m.id} className="p-3 d-flex justify-content-between align-items-center rounded-xl border transition-all hover-shadow" style={{ backgroundColor: '#ffffff', borderColor: '#f1f5f9' }}>
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                style={{ width: 44, height: 44, backgroundColor: '#663399', fontSize: '1.2rem' }}>
                {m.avatar}
              </div>
              <div>
                <div className="fw-bold" style={{ color: '#2E1A47' }}>{m.name}</div>
                <div className="small opacity-75 fw-medium" style={{ color: '#A3779D' }}>{m.role}</div>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm px-3 fw-bold shadow-sm" style={{ backgroundColor: '#E6C7E6', color: '#663399', borderRadius: '10px' }}>Secure Message</button>
              <button className="btn btn-sm px-3 fw-bold" style={{ backgroundColor: '#f1f5f9', color: '#64748b', borderRadius: '10px' }}>View Identity</button>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .rounded-xl { border-radius: 16px; }
        .hover-shadow:hover { box-shadow: 0 4px 12px rgba(102, 51, 153, 0.05); transform: translateY(-1px); border-color: #E6C7E6 !important; }
      `}</style>
    </div>
  );
}
