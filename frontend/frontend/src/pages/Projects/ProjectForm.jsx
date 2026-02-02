import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getDepartments, getEmployeesByDepartment } from "../../services/projectService";
import { FiX, FiPlus, FiUpload, FiTrash2, FiSave, FiFolder, FiUsers, FiCalendar, FiFlag } from "react-icons/fi";

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  width: "100%",
  height: "100%",
  background: "rgba(46, 26, 71, 0.6)",
  backdropFilter: "blur(8px)",
  zIndex: 10000,
  display: "grid",
  placeItems: "center",
  padding: "20px",
  overflow: "hidden"
};

const modalContentStyle = {
  background: "#ffffff",
  borderRadius: "32px",
  boxShadow: "0 25px 50px -12px rgba(102, 51, 153, 0.25)",
  width: "95vw",
  maxWidth: "1200px",
  height: "90vh",
  maxHeight: "90vh",
  overflowY: "hidden",
  display: "flex",
  flexDirection: "column",
  border: "1px solid #E6C7E6",
  position: "relative"
};

const headerStyle = {
  padding: "24px 40px",
  borderBottom: "1px solid #E6C7E6",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#ffffff",
  position: "sticky",
  top: 0,
  zIndex: 10,
};

const footerStyle = {
  padding: "24px 40px",
  borderTop: "1px solid #E6C7E6",
  display: "flex",
  justifyContent: "flex-end",
  gap: "16px",
  background: "#ffffff",
  borderRadius: "0 0 32px 32px"
};

const sectionTitleStyle = {
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "#663399",
  fontWeight: 800,
  marginBottom: "1.5rem",
  marginTop: "2.5rem",
  paddingLeft: "4px",
  borderLeft: "4px solid #663399"
};

const inputGroupStyle = {
  marginBottom: "1.25rem"
};

const labelStyle = {
  display: "block",
  fontSize: "0.85rem",
  fontWeight: 700,
  color: "#2E1A47",
  marginBottom: "0.6rem"
};

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  fontSize: "0.95rem",
  color: "#663399",
  background: "#ffffff",
  border: "1px solid #E6C7E6",
  borderRadius: "14px",
  transition: "all 0.3s ease",
  fontWeight: 500,
  outline: "none"
};

export default function ProjectForm({ editing, onSave, onCancel }) {
  const [form, setForm] = useState({
    projectName: "",
    department: "",
    manager: "",
    teamLead: "",
    teamMembers: [],
    startDate: "",
    deadline: "",
    description: "",
    status: "Planning",
    progress: 0,
    modules: []
  });

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState({});

  useEffect(() => {
    loadDepartments();
    if (editing) {
      const formatDateForInput = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toISOString().split('T')[0];
      };

      setForm({
        ...editing,
        manager: editing.manager?._id || "",
        teamLead: editing.teamLead?._id || "",
        teamMembers: editing.teamMembers?.map(m => m._id) || [],
        startDate: formatDateForInput(editing.startDate),
        deadline: formatDateForInput(editing.deadline),
        modules: editing.modules || []
      });
      if (editing.department) {
        loadEmployees(editing.department);
      }
    }
  }, [editing]);

  const loadDepartments = async () => {
    try {
      const response = await getDepartments();
      setDepartments(response.data.departments || []);
    } catch (error) {
      console.error("Error loading departments:", error);
      toast.error("Failed to load departments");
    }
  };

  const loadEmployees = async (department) => {
    try {
      const response = await getEmployeesByDepartment(department);
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error("Error loading employees:", error);
      toast.error("Failed to load employees");
    }
  };

  const handleDepartmentChange = (e) => {
    const department = e.target.value;
    setForm({
      ...form,
      department,
      manager: "",
      teamLead: "",
      teamMembers: []
    });
    if (department) {
      loadEmployees(department);
    } else {
      setEmployees([]);
    }
  };

  const handleTeamMemberToggle = (employeeId) => {
    const isSelected = form.teamMembers.includes(employeeId);
    if (isSelected) {
      setForm({
        ...form,
        teamMembers: form.teamMembers.filter(id => id !== employeeId)
      });
    } else {
      setForm({
        ...form,
        teamMembers: [...form.teamMembers, employeeId]
      });
    }
  };

  const addModule = () => {
    setForm({
      ...form,
      modules: [...form.modules, { moduleName: "", description: "", files: [] }]
    });
  };

  const removeModule = (index) => {
    const newModules = form.modules.filter((_, i) => i !== index);
    setForm({ ...form, modules: newModules });
  };

  const updateModule = (index, field, value) => {
    const newModules = [...form.modules];
    newModules[index][field] = value;
    setForm({ ...form, modules: newModules });
  };

  const handleFileUpload = async (moduleIndex, files) => {
    const fileArray = Array.from(files);
    setUploadingFiles(prev => ({ ...prev, [moduleIndex]: true }));
    try {
      const uploadedFiles = fileArray.map(file => ({
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        fileType: file.type,
        fileSize: file.size,
        _tempFile: file
      }));
      const newModules = [...form.modules];
      newModules[moduleIndex].files = [...(newModules[moduleIndex].files || []), ...uploadedFiles];
      setForm({ ...form, modules: newModules });
      toast.success(`${uploadedFiles.length} file(s) added`);
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("Failed to add files");
    } finally {
      setUploadingFiles(prev => ({ ...prev, [moduleIndex]: false }));
    }
  };

  const removeFile = (moduleIndex, fileIndex) => {
    const newModules = [...form.modules];
    newModules[moduleIndex].files = newModules[moduleIndex].files.filter((_, i) => i !== fileIndex);
    setForm({ ...form, modules: newModules });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(form);
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  const availableManagers = employees.filter(emp => emp._id !== form.teamLead);
  const availableTeamLeads = employees.filter(emp => emp._id !== form.manager);
  const availableMembers = employees.filter(emp =>
    emp._id !== form.manager && emp._id !== form.teamLead
  );

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle} className="animate__animated animate__fadeInUp animate__faster shadow-2xl">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

          {/* Header */}
          <div style={headerStyle}>
            <div className="d-flex align-items-center gap-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: '#E6C7E6', color: '#663399' }}>
                <FiFolder className="w-5 h-5" />
              </div>
              <div>
                <h5 className="m-0 fw-bold" style={{ color: '#2E1A47' }}>
                  {editing ? "Refine Project Blueprint" : "Initialize New Venture"}
                </h5>
                <p className="m-0 small opacity-75 fw-medium" style={{ color: '#A3779D' }}>System-level initiative configuration and resource allocation</p>
              </div>
            </div>
            <button type="button" onClick={onCancel} className="btn-close shadow-none" aria-label="Close"></button>
          </div>

          <div className="custom-scrollbar" style={{ padding: "40px", flex: 1, overflowY: "auto" }}>

            {/* Project Overview */}
            <div style={{ ...sectionTitleStyle, marginTop: 0 }}>Strategic Overview</div>
            <div className="row g-4 mb-4">
              <div className="col-12">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Initiative Title <span className="text-danger">*</span></label>
                  <input
                    className="form-control"
                    value={form.projectName}
                    onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                    required
                    style={inputStyle}
                    placeholder="e.g. Quantum Core Infrastructure"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Parent Department <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    value={departments.includes(form.department) ? form.department : (form.department ? "Other" : "")}
                    onChange={(e) => {
                      if (e.target.value === "Other") {
                        setForm({ ...form, department: "Other", manager: "", teamLead: "", teamMembers: [] });
                        setEmployees([]);
                      } else {
                        handleDepartmentChange(e);
                      }
                    }}
                    required
                    style={inputStyle}
                  >
                    <option value="">Choose Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                    <option value="Other">Custom Division</option>
                  </select>
                  {(form.department === "Other" || (form.department && !departments.includes(form.department))) && (
                    <input
                      className="form-control mt-2"
                      placeholder="Specify Division Name"
                      value={form.department === "Other" ? "" : form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      style={inputStyle}
                    />
                  )}
                </div>
              </div>

              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Lifecycle Maturity</label>
                  <select
                    className="form-select"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    style={{ ...inputStyle, fontWeight: 700 }}
                  >
                    <option value="Planning">Planning Phase</option>
                    <option value="Active">Operational / Active</option>
                    <option value="On Hold">Stalled / Suspended</option>
                    <option value="Completed">Post-Production / Completed</option>
                    <option value="Cancelled">Decommissioned / Cancelled</option>
                    <option value="Other">Alternative State</option>
                  </select>
                  {(form.status === "Other" || (form.status && !["Planning", "Active", "On Hold", "Completed", "Cancelled"].includes(form.status))) && (
                    <input
                      className="form-control mt-2"
                      placeholder="Define Current State"
                      value={form.status === "Other" ? "" : form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      style={inputStyle}
                    />
                  )}
                </div>
              </div>

              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Deployment Start <span className="text-danger">*</span></label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Strategic Deadline <span className="text-danger">*</span></label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="col-12">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Mission Description & Manifesto</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Detailed project objectives and scope definition..."
                    style={{ ...inputStyle, minHeight: "120px", resize: "none" }}
                  ></textarea>
                </div>
              </div>

              <div className="col-12">
                <div style={inputGroupStyle}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Execution Progress</label>
                    <span className="fw-bold" style={{ color: '#663399' }}>{form.progress}% Completion</span>
                  </div>
                  <div className="p-3 rounded-2xl border bg-light d-flex align-items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      className="form-range flex-grow-1"
                      value={form.progress}
                      onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
                      style={{ height: '8px' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Team Allocation */}
            <div style={sectionTitleStyle}>Human Capital Allocation</div>
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Executive Manager <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    value={form.manager}
                    onChange={(e) => setForm({ ...form, manager: e.target.value })}
                    required
                    disabled={!form.department}
                    style={inputStyle}
                  >
                    <option value="">Assign Manager</option>
                    {availableManagers.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.firstName} {emp.lastName} — {emp.position}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Operational Team Lead <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    value={form.teamLead}
                    onChange={(e) => setForm({ ...form, teamLead: e.target.value })}
                    required
                    disabled={!form.department}
                    style={inputStyle}
                  >
                    <option value="">Assign Team Lead</option>
                    {availableTeamLeads.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.firstName} {emp.lastName} — {emp.position}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-12">
                <label style={labelStyle}>Project Stakeholders & Contributors</label>
                <div style={{
                  border: "1px solid #E6C7E6",
                  borderRadius: "20px",
                  padding: "24px",
                  background: "#fdfbff",
                  maxHeight: "350px",
                  overflowY: "auto"
                }} className="custom-scrollbar">
                  {!form.department ? (
                    <div className="text-center py-5">
                      <FiUsers size={40} className="opacity-20 mb-2" />
                      <div className="fw-bold opacity-50" style={{ color: '#663399' }}>Initialize Department to View Assets</div>
                    </div>
                  ) : availableMembers.length === 0 ? (
                    <div className="text-center py-5 text-muted small fw-medium">No available contributors identified in this division.</div>
                  ) : (
                    <div className="row g-3">
                      {availableMembers.map((emp) => {
                        const isSelected = form.teamMembers.includes(emp._id);
                        return (
                          <div key={emp._id} className="col-md-4">
                            <div
                              onClick={() => handleTeamMemberToggle(emp._id)}
                              className="transition-all"
                              style={{
                                border: isSelected ? "2px solid #663399" : "1px solid #E6C7E6",
                                borderRadius: "16px",
                                padding: "12px",
                                background: isSelected ? "#E6C7E6" : "#ffffff",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                boxShadow: isSelected ? "0 4px 12px rgba(102, 51, 153, 0.1)" : "none"
                              }}
                            >
                              <div style={{ position: "relative" }}>
                                <div className="rounded-circle d-flex align-items-center justify-content-center text-white small fw-bold"
                                  style={{
                                    width: 36, height: 36,
                                    backgroundColor: isSelected ? '#ffffff' : '#663399',
                                    color: isSelected ? '#663399' : '#ffffff',
                                    backgroundImage: emp.profileImage ? `url(${emp.profileImage})` : 'none',
                                    backgroundSize: 'cover'
                                  }}>
                                  {!emp.profileImage && emp.firstName?.[0]}
                                </div>
                                {isSelected && (
                                  <div style={{
                                    position: "absolute",
                                    bottom: -2,
                                    right: -2,
                                    width: "16px",
                                    height: "16px",
                                    background: "#059669",
                                    borderRadius: "50%",
                                    border: "2px solid #fff"
                                  }} />
                                )}
                              </div>
                              <div style={{ overflow: "hidden" }}>
                                <div className="fw-bold small text-truncate" style={{ color: isSelected ? '#2E1A47' : '#663399' }}>{emp.firstName} {emp.lastName}</div>
                                <div className="opacity-75" style={{ fontSize: "10px", color: isSelected ? '#663399' : '#A3779D' }}>{emp.position}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="small fw-bold mt-2 text-end" style={{ color: '#663399' }}>
                  {form.teamMembers.length} Assets Allocated
                </div>
              </div>
            </div>

            {/* Modules */}
            <div style={sectionTitleStyle}>Project Architecture & Modules</div>
            <div className="mb-3">
              {form.modules.length === 0 ? (
                <div className="text-center py-5 border rounded-3xl" style={{ backgroundColor: '#fdfbff', borderColor: '#E6C7E6', borderStyle: 'dashed' }}>
                  <FiFolder size={32} className="opacity-20 mb-2" style={{ color: '#663399' }} />
                  <p className="fw-bold mb-3" style={{ color: '#A3779D' }}>No structural modules identified.</p>
                  <button type="button" className="btn px-4 fw-bold" style={{ color: '#663399', backgroundColor: '#E6C7E6', borderRadius: '10px' }} onClick={addModule}>
                    <FiPlus className="me-2" /> Add Architecture Layer
                  </button>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {form.modules.map((module, index) => (
                    <div key={index} className="border-0 shadow-sm" style={{ borderRadius: '24px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                      <div className="p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <div className="d-flex align-items-center gap-2">
                            <div className="badge px-3 py-1 rounded-pill" style={{ backgroundColor: '#663399', color: '#ffffff' }}>LAYER {index + 1}</div>
                            <h6 className="fw-bold m-0" style={{ color: '#2E1A47' }}>Module Definition</h6>
                          </div>
                          <button type="button" className="btn btn-sm p-2 rounded-lg" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }} onClick={() => removeModule(index)}>
                            <FiTrash2 />
                          </button>
                        </div>

                        <div className="row g-4">
                          <div className="col-md-6">
                            <label style={labelStyle}>Module Nomenclature</label>
                            <input
                              className="form-control"
                              placeholder="e.g. Frontend Implementation"
                              value={module.moduleName}
                              onChange={(e) => updateModule(index, 'moduleName', e.target.value)}
                              style={inputStyle}
                            />
                          </div>
                          <div className="col-md-6">
                            <label style={labelStyle}>Deployment Objectives</label>
                            <input
                              className="form-control"
                              placeholder="Primary goals for this module..."
                              value={module.description}
                              onChange={(e) => updateModule(index, 'description', e.target.value)}
                              style={inputStyle}
                            />
                          </div>

                          <div className="col-12">
                            <div className="d-flex align-items-center gap-2 mb-3">
                              <label className="small fw-bold mb-0" style={{ color: '#2E1A47' }}>Supporting Assets & Documentation</label>
                              <div className="ms-auto">
                                <label className="btn btn-sm px-3 fw-bold shadow-sm" style={{ backgroundColor: '#ffffff', color: '#663399', borderRadius: '8px', cursor: "pointer", border: '1px solid #E6C7E6' }}>
                                  <FiUpload className="me-2" /> Inject Files
                                  <input
                                    type="file"
                                    multiple
                                    hidden
                                    onChange={(e) => handleFileUpload(index, e.target.files)}
                                    disabled={uploadingFiles[index]}
                                  />
                                </label>
                              </div>
                            </div>

                            {/* File List */}
                            <div className="bg-white border rounded-2xl p-3" style={{ minHeight: "80px", borderColor: '#E6C7E6' }}>
                              {(!module.files || module.files.length === 0) && (
                                <div className="text-center py-3 opacity-50 small fw-medium">No operational files attached.</div>
                              )}
                              {module.files && module.files.map((file, fileIndex) => (
                                <div key={fileIndex} className="d-flex align-items-center justify-content-between p-2 mb-2 rounded-xl" style={{ backgroundColor: '#fdfbff', border: '1px solid #f1f5f9' }}>
                                  <div className="d-flex align-items-center gap-3 overflow-hidden">
                                    <div className="bg-light rounded p-2" style={{ color: '#663399' }}><FiFolder size={14} /></div>
                                    <div className="d-flex flex-column">
                                      <span className="small fw-bold text-truncate" style={{ color: '#2E1A47', maxWidth: "300px" }}>{file.fileName}</span>
                                      <span className="opacity-50" style={{ fontSize: '10px' }}>{(file.fileSize / 1024).toFixed(1)} KB</span>
                                    </div>
                                  </div>
                                  <button type="button" className="btn btn-sm p-1 rounded-full hover-danger" style={{ color: '#A3779D' }} onClick={() => removeFile(index, fileIndex)}>
                                    <FiX size={16} />
                                  </button>
                                </div>
                              ))}
                              {uploadingFiles[index] && (
                                <div className="text-center p-2">
                                  <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                                  <span className="ms-2 small fw-bold" style={{ color: '#663399' }}>Uploading Asset...</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="text-center mt-3">
                    <button type="button" className="btn px-4 fw-bold shadow-sm" style={{ color: '#663399', backgroundColor: '#ffffff', border: '1px solid #E6C7E6', borderRadius: '12px' }} onClick={addModule}>
                      <FiPlus className="me-2" /> Expand Architecture
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Footer */}
          <div style={footerStyle}>
            <button
              type="button"
              onClick={onCancel}
              className="btn px-4 fw-bold"
              style={{ color: '#A3779D' }}
              disabled={loading}
            >
              Abort Entry
            </button>
            <button
              type="submit"
              className="btn px-5 shadow-lg d-flex align-items-center gap-2"
              style={{ backgroundColor: '#663399', color: '#ffffff', fontWeight: 600, borderRadius: '14px', padding: '12px 30px' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner-border spinner-border-sm" role="status"></div>
                  <span>Propagating Changes...</span>
                </>
              ) : (
                <>
                  <FiSave className="w-5 h-5" />
                  <span>{editing ? "Commit Modifications" : "Authenticate Initialization"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E6C7E6; border-radius: 10px; }
        .hover-danger:hover { background-color: #fee2e2 !important; color: #dc2626 !important; }
      `}</style>
    </div>
  );
}
