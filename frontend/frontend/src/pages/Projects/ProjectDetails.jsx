import React from "react";

const glass = {
  background: "#ffffff",
  borderRadius: 24,
  border: "1px solid #E6C7E6",
  padding: 30,
  boxShadow: "0 10px 30px -10px rgba(102, 51, 153, 0.1)",
};

export default function ProjectDetails() {
  // Replace sample with state or API-driven selected project
  const project = {
    id: 1,
    name: "Strategic Website Orchestration",
    manager: "Anita Sharma",
    description: "Full redesign of corporate marketing framework, including comprehensive migration to high-performance content infrastructure.",
    milestones: [
      { id: "m1", title: "Technical Discovery & Requirement Analysis", done: true },
      { id: "m2", title: "Enterprise Architecture Design Phase", done: false },
      { id: "m3", title: "Operational Protocol Implementation", done: false },
    ],
  };

  return (
    <div style={glass} className="shadow-sm">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div className="d-flex align-items-center gap-3">
          <div style={{ width: 4, height: 40, backgroundColor: '#663399', borderRadius: 4 }}></div>
          <div>
            <h4 className="fw-bold m-0" style={{ color: '#2E1A47' }}>{project.name}</h4>
            <div className="small fw-medium" style={{ color: '#A3779D' }}>Executive Lead: <span style={{ color: '#663399' }}>{project.manager}</span></div>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-sm px-3 fw-bold" style={{ backgroundColor: '#f1f5f9', color: '#64748b', borderRadius: '10px' }}>Export Blueprint</button>
          <button className="btn btn-sm px-3 fw-bold" style={{ backgroundColor: '#663399', color: '#ffffff', borderRadius: '10px' }}>Adjust Configuration</button>
        </div>
      </div>

      <div className="p-3 rounded-xl mb-4" style={{ backgroundColor: '#fdfbff', border: '1px solid #E6C7E6' }}>
        <p className="m-0" style={{ color: '#2E1A47', fontSize: '1rem', lineHeight: '1.6' }}>{project.description}</p>
      </div>

      <div className="mt-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div style={{ width: 12, height: 12, backgroundColor: '#E6C7E6', borderRadius: '50%' }}></div>
          <div className="fw-bold text-uppercase" style={{ color: '#663399', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Strategic Milestones</div>
        </div>
        <div className="d-flex flex-column gap-2">
          {project.milestones.map(m => (
            <div key={m.id} className="p-3 d-flex justify-content-between align-items-center rounded-xl border transition-all" style={{ backgroundColor: '#ffffff', borderColor: '#f1f5f9' }}>
              <div className="fw-semibold" style={{ color: '#2E1A47' }}>{m.title}</div>
              <span className={`badge px-3 py-2 rounded-pill`} style={{
                backgroundColor: m.done ? '#f0fdf4' : '#fef2f2',
                color: m.done ? '#16a34a' : '#dc2626',
                fontSize: '11px',
                fontWeight: 700
              }}>
                {m.done ? "AUTHENTICATED" : "IN PROGRESS"}
              </span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .rounded-xl { border-radius: 12px; }
      `}</style>
    </div>
  );
}
