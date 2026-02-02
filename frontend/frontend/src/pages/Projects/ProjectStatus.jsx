import React, { useState } from "react";
import ProjectForm from "./ProjectForm";

const glass = {
  background: "#ffffff",
  borderRadius: 24,
  border: "1px solid #E6C7E6",
  padding: 24,
  boxShadow: "0 10px 30px -10px rgba(102, 51, 153, 0.1)",
};

export default function ProjectStatus() {
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "Strategic Website Orchestration",
      manager: "Anita Sharma",
      teamName: "Core Interface Group",
      teamMembers: "Arun, Meera",
      startDate: "2024-01-02",
      deadline: "2024-03-10",
      description: "Comprehensive UI overhaul and SEO optimization protocols",
      status: "Active",
      progress: 72,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const openAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (project) => {
    setEditing(project);
    setShowForm(true);
  };

  const saveProject = (data) => {
    if (editing) {
      setProjects((prev) =>
        prev.map((p) => (p.id === editing.id ? { ...p, ...data } : p))
      );
    } else {
      setProjects((prev) => [...prev, { ...data, id: prev.length + 1 }]);
    }
    setShowForm(false);
  };

  return (
    <div style={glass} className="shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          <div style={{ width: 4, height: 20, backgroundColor: '#663399', borderRadius: 4 }}></div>
          <h5 className="fw-bold m-0" style={{ color: '#2E1A47' }}>Project Status Registry</h5>
        </div>
        <button className="btn btn-sm shadow-sm" style={{ backgroundColor: '#663399', color: '#ffffff', borderRadius: '10px', fontWeight: 600, padding: '8px 16px' }} onClick={openAdd}>
          + Register New Asset
        </button>
      </div>

      {showForm && (
        <ProjectForm
          editing={editing}
          onSave={saveProject}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              <th className="px-4 py-3 border-0" style={{ color: '#663399', fontSize: '0.85rem', fontWeight: 600, borderRadius: '12px 0 0 12px' }}>Asset ID</th>
              <th className="px-4 py-3 border-0" style={{ color: '#663399', fontSize: '0.85rem', fontWeight: 600 }}>Initiative Name</th>
              <th className="px-4 py-3 border-0" style={{ color: '#663399', fontSize: '0.85rem', fontWeight: 600 }}>Lead Architect</th>
              <th className="px-4 py-3 border-0" style={{ color: '#663399', fontSize: '0.85rem', fontWeight: 600 }}>Division Team</th>
              <th className="px-4 py-3 border-0" style={{ color: '#663399', fontSize: '0.85rem', fontWeight: 600 }}>Execution Flow</th>
              <th className="px-4 py-3 border-0" style={{ color: '#663399', fontSize: '0.85rem', fontWeight: 600 }}>Maturity Status</th>
              <th className="px-4 py-3 border-0 text-end" style={{ color: '#663399', fontSize: '0.85rem', fontWeight: 600, borderRadius: '0 12px 12px 0' }}>Orchestration</th>
            </tr>
          </thead>

          <tbody>
            <tr style={{ height: '12px' }}></tr>
            {projects.map((p) => (
              <tr key={p.id} className="border-bottom-hover">
                <td className="px-4 py-3 fw-bold" style={{ color: '#A3779D' }}>#PRJ-{p.id.toString().padStart(3, '0')}</td>
                <td className="px-4 py-3 fw-bold" style={{ color: '#2E1A47' }}>{p.name}</td>
                <td className="px-4 py-3" style={{ color: '#663399' }}>{p.manager}</td>
                <td className="px-4 py-3">
                  <span className="badge px-3 py-1 rounded-pill" style={{ backgroundColor: '#E6C7E6', color: '#663399', fontSize: '11px' }}>
                    {p.teamName}
                  </span>
                </td>
                <td className="px-4 py-3" style={{ width: '150px' }}>
                  <div className="d-flex align-items-center gap-2">
                    <div className="progress flex-grow-1" style={{ height: 6, borderRadius: 10, backgroundColor: '#f1f5f9' }}>
                      <div
                        className="progress-bar"
                        style={{
                          width: `${p.progress}%`,
                          backgroundColor: p.progress === 100 ? "#059669" : "#663399",
                          borderRadius: 10
                        }}
                      ></div>
                    </div>
                    <span className="small fw-bold" style={{ color: '#663399' }}>{p.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="badge px-3 py-1 rounded-pill" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', fontSize: '11px', fontWeight: 700 }}>
                    {p.status?.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-end">
                  <div className="d-flex gap-2 justify-content-end">
                    <button
                      className="btn btn-sm p-2 rounded-lg"
                      style={{ backgroundColor: '#f8fafc', color: '#663399' }}
                      onClick={() => openEdit(p)}
                    >
                      Adjust
                    </button>
                    <button className="btn btn-sm p-2 rounded-lg" style={{ backgroundColor: '#fdfbff', color: '#A3779D' }}>
                      Inspect
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>{`
        .border-bottom-hover:hover { background-color: #fdfbff !important; transition: all 0.2s ease; }
      `}</style>
    </div>
  );
}
