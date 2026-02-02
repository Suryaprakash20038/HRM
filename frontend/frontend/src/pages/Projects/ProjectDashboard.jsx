import React, { useState, useEffect } from "react";
import { getAllProjects, deleteProject } from "../../services/projectService";
import { FiFolder, FiClock, FiCheckCircle, FiUsers, FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import { toast } from "react-toastify";

const glass = {
  background: "#ffffff",
  borderRadius: 24,
  border: "1px solid #E6C7E6",
  padding: 24,
  boxShadow: "0 10px 30px -10px rgba(102, 51, 153, 0.1)",
};

export default function ProjectDashboard({ onEdit, onRefresh }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewProject, setViewProject] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await getAllProjects();
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const totals = {
    total: projects.length,
    active: projects.filter(p => p.status === "Active").length,
    planning: projects.filter(p => p.status === "Planning").length,
    completed: projects.filter(p => p.status === "Completed").length,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "#663399";
      case "Planning": return "#D97706";
      case "Completed": return "#059669";
      case "On Hold": return "#DC2626";
      case "Cancelled": return "#64748b";
      default: return "#663399";
    }
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" style={{ color: '#663399 !important' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Synchronizing Portfolio Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div style={glass} className="h-100 d-flex flex-column justify-content-between">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="small fw-bold text-uppercase" style={{ color: '#A3779D', letterSpacing: '0.5px' }}>Total Pipeline</div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#E6C7E6', color: '#663399' }}>
                <FiFolder className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="h2 fw-bold mb-1" style={{ color: '#2E1A47' }}>{totals.total}</div>
              <div className="small opacity-75 fw-medium" style={{ color: '#A3779D' }}>Initiated Projects</div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div style={glass} className="h-100 d-flex flex-column justify-content-between">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="small fw-bold text-uppercase" style={{ color: '#A3779D', letterSpacing: '0.5px' }}>In Execution</div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>
                <FiCheckCircle className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="h2 fw-bold mb-1" style={{ color: '#2E1A47' }}>{totals.active}</div>
              <div className="small opacity-75 fw-medium" style={{ color: '#A3779D' }}>Currently Active</div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div style={glass} className="h-100 d-flex flex-column justify-content-between">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="small fw-bold text-uppercase" style={{ color: '#A3779D', letterSpacing: '0.5px' }}>Strategic Planning</div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                <FiClock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="h2 fw-bold mb-1" style={{ color: '#2E1A47' }}>{totals.planning}</div>
              <div className="small opacity-75 fw-medium" style={{ color: '#A3779D' }}>Architecture Phase</div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div style={glass} className="h-100 d-flex flex-column justify-content-between">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="small fw-bold text-uppercase" style={{ color: '#A3779D', letterSpacing: '0.5px' }}>Fulfillment</div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#E0E7FF', color: '#4338CA' }}>
                <FiUsers className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="h2 fw-bold mb-1" style={{ color: '#2E1A47' }}>{totals.completed}</div>
              <div className="small opacity-75 fw-medium" style={{ color: '#A3779D' }}>Successfully Deployed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent projects list */}
      <div style={glass}>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-2">
            <div style={{ width: 4, height: 20, backgroundColor: '#663399', borderRadius: 4 }}></div>
            <h5 className="fw-bold m-0" style={{ color: '#2E1A47' }}>Active Project Registry</h5>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="py-5 text-center text-muted border rounded-3" style={{ borderStyle: 'dashed !important', borderColor: '#E6C7E6 !important' }}>
            <FiFolder size={48} className="mb-3 opacity-20" style={{ color: '#663399' }} />
            <p className="fw-bold mb-0" style={{ color: '#A3779D' }}>No active projects found in the current cycle.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <th className="px-4 py-3 border-0" style={{ color: '#663399', fontSize: '0.85rem', fontWeight: 600, borderRadius: '12px 0 0 12px' }}>Operational Asset</th>
                  <th className="px-4 py-3 border-0" style={{ color: '#663399', fontSize: '0.85rem', fontWeight: 600 }}>Department</th>
                  <th className="px-4 py-3 border-0" style={{ color: '#663399', fontSize: '0.85rem', fontWeight: 600 }}>Lead Architect</th>
                  <th className="px-4 py-3 border-0" style={{ color: '#663399', fontSize: '0.85rem', fontWeight: 600 }}>Lifecycle Status</th>
                  <th className="px-4 py-3 border-0" style={{ color: '#663399', fontSize: '0.85rem', fontWeight: 600 }}>Velocity Progress</th>
                  <th className="px-4 py-3 border-0" style={{ color: '#663399', fontSize: '0.85rem', fontWeight: 600 }}>Project Team</th>
                  <th className="px-4 py-3 border-0 text-end" style={{ color: '#663399', fontSize: '0.85rem', fontWeight: 600, borderRadius: '0 12px 12px 0' }}>Orchestration</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ height: '12px' }}></tr>
                {projects.filter(p => p.status !== 'Cancelled').map(p => (
                  <tr key={p._id} className="border-bottom-hover">
                    <td className="px-4 py-3">
                      <div className="fw-bold" style={{ color: '#2E1A47' }}>{p.projectName}</div>
                      {p.description && (
                        <div className="small opacity-75 truncate" style={{ color: '#A3779D', maxWidth: 250 }}>
                          {p.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge px-3 py-1 rounded-pill" style={{ backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '11px' }}>
                        {p.department}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.manager ? (
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle d-flex align-items-center justify-content-center text-white small fw-bold"
                            style={{
                              width: 32, height: 32,
                              backgroundColor: '#663399',
                              backgroundImage: (p.manager.profileImage || p.manager.photoUrl) ? `url(${p.manager.profileImage || p.manager.photoUrl})` : 'none',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }}>
                            {!(p.manager.profileImage || p.manager.photoUrl) && p.manager.firstName?.[0]}
                          </div>
                          <div className="small fw-semibold" style={{ color: '#2E1A47' }}>{p.manager.firstName} {p.manager.lastName}</div>
                        </div>
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge px-3 py-2 rounded-pill"
                        style={{
                          backgroundColor: getStatusColor(p.status) + "15",
                          color: getStatusColor(p.status),
                          fontSize: '11px',
                          fontWeight: 700
                        }}
                      >
                        {p.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
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
                        <span className="small fw-bold" style={{ color: '#663399', minWidth: '35px' }}>{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="d-flex align-items-center ps-2">
                        {[p.manager, p.teamLead, ...(p.teamMembers || [])].filter(Boolean).slice(0, 4).map((member, index) => (
                          <div
                            key={member._id || index}
                            className="rounded-circle border border-2 border-white shadow-sm d-flex align-items-center justify-content-center bg-light text-muted small fw-bold"
                            style={{
                              width: 30,
                              height: 30,
                              marginLeft: -8,
                              zIndex: 4 - index,
                              backgroundImage: (member.profileImage || member.photoUrl) ? `url(${member.profileImage || member.photoUrl})` : 'none',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                            title={`${member.firstName} ${member.lastName}`}
                          >
                            {!(member.profileImage || member.photoUrl) && member.firstName?.[0]}
                          </div>
                        ))}
                        {([p.manager, p.teamLead, ...(p.teamMembers || [])].filter(Boolean).length > 4) && (
                          <div
                            className="rounded-circle border border-2 border-white bg-light text-muted small fw-bold d-flex align-items-center justify-content-center"
                            style={{ width: 30, height: 30, marginLeft: -8, zIndex: 0, fontSize: '10px' }}
                          >
                            +{[p.manager, p.teamLead, ...(p.teamMembers || [])].filter(Boolean).length - 4}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        <button className="btn btn-sm p-2 rounded-lg" style={{ backgroundColor: '#f8fafc', color: '#663399' }} onClick={() => setViewProject(p)} title="Inspect Asset">
                          <FiEye size={16} />
                        </button>
                        <button className="btn btn-sm p-2 rounded-lg" style={{ backgroundColor: '#f8fafc', color: '#A3779D' }} onClick={() => onEdit && onEdit(p)} title="Adjust Parameters">
                          <FiEdit2 size={16} />
                        </button>
                        <button className="btn btn-sm p-2 rounded-lg" style={{ backgroundColor: '#fdf2f2', color: '#EF4444' }} onClick={() => setDeleteConfirm(p)} title="Retire Project">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .border-bottom-hover:hover { background-color: #fdfbff !important; transition: all 0.2s ease; }
        .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      `}</style>

      {/* View Project Modal */}
      {viewProject && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(46, 26, 71, 0.6)', backdropFilter: 'blur(8px)', zIndex: 3000 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '24px', border: '1px solid #E6C7E6', overflow: 'hidden' }}>
              <div className="modal-header px-4 py-3 border-bottom" style={{ borderColor: '#E6C7E6' }}>
                <h5 className="fw-bold m-0" style={{ color: '#2E1A47' }}>Strategic Asset Profile</h5>
                <button className="btn-close" onClick={() => setViewProject(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-4">
                  <div className="col-12">
                    <h4 className="fw-bold mb-1" style={{ color: '#663399' }}>{viewProject.projectName}</h4>
                    <p className="small opacity-75" style={{ color: '#A3779D' }}>System ID: PRJ-{viewProject._id?.slice(-6).toUpperCase()}</p>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 rounded-xl border text-center" style={{ backgroundColor: '#fdfbff', borderColor: '#E6C7E6' }}>
                      <div className="small fw-bold opacity-50 mb-1" style={{ color: '#663399' }}>LIFECYCLE STATUS</div>
                      <span className="badge px-3 py-2 rounded-pill" style={{ backgroundColor: getStatusColor(viewProject.status) + '15', color: getStatusColor(viewProject.status), fontWeight: 700 }}>{viewProject.status}</span>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 rounded-xl border text-center" style={{ backgroundColor: '#fdfbff', borderColor: '#E6C7E6' }}>
                      <div className="small fw-bold opacity-50 mb-1" style={{ color: '#663399' }}>VELOCITY PROGRESS</div>
                      <div className="h4 fw-bold mb-0" style={{ color: '#2E1A47' }}>{viewProject.progress}%</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 rounded-xl border text-center" style={{ backgroundColor: '#fdfbff', borderColor: '#E6C7E6' }}>
                      <div className="small fw-bold opacity-50 mb-1" style={{ color: '#663399' }}>DIVISION ENTITY</div>
                      <div className="h4 fw-bold mb-0" style={{ color: '#2E1A47' }}>{viewProject.department}</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="small fw-bold opacity-50 d-block mb-2" style={{ color: '#663399' }}>LEAD ARCHITECT</label>
                    <div className="d-flex align-items-center gap-2">
                      <div className="fw-bold" style={{ color: '#2E1A47' }}>{viewProject.manager?.firstName} {viewProject.manager?.lastName}</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="small fw-bold opacity-50 d-block mb-2" style={{ color: '#663399' }}>TEAM ARCHITECTURE</label>
                    <div className="fw-bold" style={{ color: '#2E1A47' }}>{(viewProject.teamMembers?.length || 0) + 2} Core Stakeholders</div>
                  </div>
                  {viewProject.description && (
                    <div className="col-12">
                      <label className="small fw-bold opacity-50 d-block mb-2" style={{ color: '#663399' }}>PROJECT MANIFESTO</label>
                      <div className="p-3 rounded-xl bg-light" style={{ color: '#2E1A47', fontSize: '0.95rem', lineHeight: '1.6' }}>{viewProject.description}</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer px-4 py-3 border-0">
                <button className="btn px-4 py-2 shadow-sm" style={{ backgroundColor: '#663399', color: '#ffffff', borderRadius: '12px', fontWeight: 600 }} onClick={() => setViewProject(null)}>Close Inspector</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(46, 26, 71, 0.6)', backdropFilter: 'blur(8px)', zIndex: 3000 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '24px', border: '1px solid #E6C7E6' }}>
              <div className="modal-header border-bottom px-4 py-3" style={{ borderColor: '#E6C7E6' }}>
                <h5 className="modal-title fw-bold" style={{ color: '#2E1A47' }}>Decommission Asset</h5>
                <button className="btn-close" onClick={() => setDeleteConfirm(null)}></button>
              </div>
              <div className="modal-body p-4 text-center">
                <div className="p-3 rounded-circle d-inline-block mb-3" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                  <FiTrash2 size={32} />
                </div>
                <h5 className="fw-bold" style={{ color: '#2E1A47' }}>Authorize Deletion?</h5>
                <p style={{ color: '#A3779D' }} className="mb-0">Are you sure you want to terminate <strong>"{deleteConfirm.projectName}"</strong>? This decision is irreversible within the current ledger.</p>
              </div>
              <div className="modal-footer px-4 py-3 border-0 d-flex gap-2">
                <button className="btn px-4 fw-bold flex-grow-1" style={{ color: '#A3779D' }} onClick={() => setDeleteConfirm(null)}>Abort</button>
                <button
                  className="btn px-4 shadow-lg flex-grow-1"
                  style={{ backgroundColor: '#dc2626', color: '#ffffff', fontWeight: 600, borderRadius: '12px' }}
                  onClick={async () => {
                    try {
                      await deleteProject(deleteConfirm._id);
                      toast.success("Project decommissioned successfully");
                      setDeleteConfirm(null);
                      loadProjects();
                      if (onRefresh) onRefresh();
                    } catch (error) {
                      console.error("Delete error:", error);
                      toast.error("Process termination failed");
                    }
                  }}
                >
                  Terminate Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
