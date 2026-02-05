import React, { useState } from "react";
import { toast } from "react-toastify";
import { createProject, updateProject } from "../../services/projectService";
import ProjectDashboard from "./ProjectDashboard";
// import ProjectStatus from "./ProjectStatus"; // Removed
// import ProjectDetails from "./ProjectDetails"; // Removed
import AssetDeployment from "./AssetDeployment"; // New
// import DivisionAllocation from "./DivisionAllocation"; // Removed
import ProjectForm from "./ProjectForm";
import { FaPlus, FaCloudDownloadAlt, FaProjectDiagram } from "react-icons/fa";

export default function Projects() {
  const [page, setPage] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);

  // GLOBAL FORM HANDLER
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const openNewProject = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEditProject = (project) => {
    setEditing(project);
    setShowForm(true);
  };

  const handleSaveProject = async (projectData) => {
    try {
      if (editing) {
        await updateProject(editing._id, projectData);
        toast.success("Project updated successfully!");
      } else {
        await createProject(projectData);
        toast.success("Project created successfully! Email notifications sent to team members.");
      }
      setShowForm(false);
      setEditing(null);
      // Refresh the dashboard by updating key
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Save project error:", error);
      toast.error(error.response?.data?.message || "Failed to save project");
    }
  };

  const tabs = [
    { id: "dashboard", label: "Operations Dashboard" },
    { id: "assets", label: "Asset Deployment" },
  ];

  const tabStyle = (active) => ({
    padding: "10px 20px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.9rem",
    background: active ? "#663399" : "#ffffff",
    color: active ? "#ffffff" : "#663399",
    border: "1px solid #E6C7E6",
    boxShadow: active ? "0 4px 12px rgba(102, 51, 153, 0.2)" : "none",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    marginRight: "8px"
  });

  return (
    <div className="projects-wrapper-premium" style={{ padding: '30px', paddingBottom: '80px', minHeight: '100vh' }}>
      <style>{`
        .projects-wrapper-premium {
          background-color: #ffffff;
          background-image: 
            radial-gradient(at 0% 0%, rgba(102, 51, 153, 0.05) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(163, 119, 157, 0.05) 0px, transparent 50%);
        }
        .nav-tab-button:hover {
          background-color: #f8fafc !important;
          transform: translateY(-1px);
        }
        .nav-tab-button.active:hover {
          background-color: #663399 !important;
        }
      `}</style>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 className="fw-bold d-flex align-items-center gap-3" style={{ color: '#2E1A47' }}>
            <div className="p-2 rounded-xl" style={{ backgroundColor: '#E6C7E6', color: '#663399' }}>
              <FaProjectDiagram />
            </div>
            Portfolio Orchestration
          </h2>
          <p className="m-0 opacity-75 fw-medium" style={{ color: '#A3779D' }}>Monitoring enterprise initiatives and strategic project lifecycles</p>
        </div>

        <div className="d-flex gap-3">
          <button className="btn px-4 fw-bold shadow-sm d-flex align-items-center gap-2" style={{ backgroundColor: '#ffffff', color: '#663399', border: '1px solid #E6C7E6', borderRadius: '12px' }}>
            <FaCloudDownloadAlt /> Data Export
          </button>
          <button
            className="btn px-4 shadow-lg hover-elevate transition-all d-flex align-items-center gap-2"
            style={{ backgroundColor: '#663399', color: '#ffffff', fontWeight: 600, border: 'none', borderRadius: '12px' }}
            onClick={openNewProject}
          >
            <FaPlus /> Initialize Project
          </button>
        </div>
      </div>

      {/* NAV TABS */}
      <div className="d-flex mb-5 p-2 rounded-2xl shadow-sm" style={{ backgroundColor: 'rgba(230, 199, 230, 0.2)', width: 'fit-content' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`nav-tab-button ${page === t.id ? 'active' : ''}`}
            style={tabStyle(page === t.id)}
            onClick={() => setPage(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* PAGE CONTENT */}
      <div className="content-area-fade">
        {page === "dashboard" && <ProjectDashboard key={refreshKey} onEdit={openEditProject} onRefresh={() => setRefreshKey(prev => prev + 1)} />}
        {page === "assets" && <AssetDeployment />}
      </div>

      {/* POPUP FORM */}
      {showForm && (
        <ProjectForm
          editing={editing}
          onCancel={() => setShowForm(false)}
          onSave={handleSaveProject}
        />
      )}
    </div>
  );
}

