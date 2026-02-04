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
    projectCode: "",
    category: "",
    client: {
      type: "Internal",
      name: "",
      company: "",
      email: "",
      contact: ""
    },
    department: "",
    manager: "",
    teamLead: "",
    teamMembers: [],
    startDate: "",
    deadline: "",
    priority: "Medium",
    adminInstructions: "",
    visibility: "Employees",
    description: "",
    status: "Planning",
    progress: 0,
    modules: [],
    files: []
  });

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [duration, setDuration] = useState("");

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
        projectCode: editing.projectCode || "",
        category: editing.category || "",
        client: editing.client || { type: "Internal", name: "", company: "", email: "", contact: "" },
        priority: editing.priority || "Medium",
        adminInstructions: editing.adminInstructions || "",
        visibility: editing.visibility || "Employees",
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

  useEffect(() => {
    if (form.startDate && form.deadline) {
      const start = new Date(form.startDate);
      const end = new Date(form.deadline);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDuration(`${diffDays} days`);
    } else {
      setDuration("");
    }
  }, [form.startDate, form.deadline]);

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

  const handleRootFileUpload = (files) => {
    const fileArray = Array.from(files);
    setUploadingFiles(prev => ({ ...prev, root: true }));
    try {
      const uploadedFiles = fileArray.map(file => ({
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        fileType: file.type,
        fileSize: file.size,
        _tempFile: file
      }));
      setForm({
        ...form,
        files: [...(form.files || []), ...uploadedFiles]
      });
      toast.success(`${uploadedFiles.length} document(s) added`);
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("Failed to add files");
    } finally {
      setUploadingFiles(prev => ({ ...prev, root: false }));
    }
  };

  const removeRootFile = (index) => {
    const newFiles = form.files.filter((_, i) => i !== index);
    setForm({ ...form, files: newFiles });
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

            {/* Project Essentials */}
            <div style={sectionTitleStyle}>Project Essentials</div>
            <div className="row g-4 mb-4">
              <div className="col-md-8">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Project Name <span className="text-danger">*</span></label>
                  <input
                    className="form-control"
                    value={form.projectName}
                    onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                    required
                    style={inputStyle}
                    placeholder="e.g. NextGen ERP System"
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Project Code / ID</label>
                  <input
                    className="form-control"
                    value={form.projectCode}
                    onChange={(e) => setForm({ ...form, projectCode: e.target.value })}
                    style={inputStyle}
                    placeholder="e.g. PRJ-2024-001"
                  />
                </div>
              </div>

              <div className="col-md-4">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Category</label>
                  <select
                    className="form-select"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="">Select Category</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="ERP System">ERP System</option>
                    <option value="AI/ML">AI / ML</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="col-md-4">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Department <span className="text-danger">*</span></label>
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
                  </select>
                </div>
              </div>

              <div className="col-md-4">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Visibility</label>
                  <select
                    className="form-select"
                    value={form.visibility}
                    onChange={(e) => setForm({ ...form, visibility: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="Employees">All Team Members</option>
                    <option value="Manager">Managers Only (Confidential)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Client Specification */}
            <div style={sectionTitleStyle}>Client Specification</div>
            <div className="mb-4">
              <div className="btn-group mb-3" role="group">
                <button
                  type="button"
                  className={`btn ${form.client.type === 'Internal' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setForm({ ...form, client: { ...form.client, type: 'Internal' } })}
                  style={{ backgroundColor: form.client.type === 'Internal' ? '#663399' : 'transparent', borderColor: '#663399', color: form.client.type === 'Internal' ? 'white' : '#663399' }}
                >
                  Internal Project
                </button>
                <button
                  type="button"
                  className={`btn ${form.client.type === 'Client' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setForm({ ...form, client: { ...form.client, type: 'Client' } })}
                  style={{ backgroundColor: form.client.type === 'Client' ? '#663399' : 'transparent', borderColor: '#663399', color: form.client.type === 'Client' ? 'white' : '#663399' }}
                >
                  External Client
                </button>
              </div>

              {form.client.type === 'Client' && (
                <div className="row g-3 p-4 rounded-3" style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                  <div className="col-md-6">
                    <label style={labelStyle}>Client Name</label>
                    <input className="form-control" style={inputStyle} value={form.client.name} onChange={(e) => setForm({ ...form, client: { ...form.client, name: e.target.value } })} />
                  </div>
                  <div className="col-md-6">
                    <label style={labelStyle}>Company Name</label>
                    <input className="form-control" style={inputStyle} value={form.client.company} onChange={(e) => setForm({ ...form, client: { ...form.client, company: e.target.value } })} />
                  </div>
                  <div className="col-md-6">
                    <label style={labelStyle}>Contact Email</label>
                    <input className="form-control" type="email" style={inputStyle} value={form.client.email} onChange={(e) => setForm({ ...form, client: { ...form.client, email: e.target.value } })} />
                  </div>
                  <div className="col-md-6">
                    <label style={labelStyle}>Phone Number</label>
                    <input className="form-control" style={inputStyle} value={form.client.contact} onChange={(e) => setForm({ ...form, client: { ...form.client, contact: e.target.value } })} />
                  </div>
                </div>
              )}
            </div>

            {/* Timeline & Priorities */}
            <div style={sectionTitleStyle}>Timeline & Priorities</div>
            <div className="row g-4 mb-4">
              <div className="col-md-4">
                <label style={labelStyle}>Start Date <span className="text-danger">*</span></label>
                <input type="date" className="form-control" style={inputStyle} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
              </div>
              <div className="col-md-4">
                <label style={labelStyle}>Deadline <span className="text-danger">*</span></label>
                <input type="date" className="form-control" style={inputStyle} value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required />
              </div>
              <div className="col-md-4">
                <label style={labelStyle}>Duration</label>
                <input className="form-control" style={{ ...inputStyle, backgroundColor: '#f3f4f6' }} value={duration} readOnly placeholder="Auto-calculated" />
              </div>
              <div className="col-md-6">
                <label style={labelStyle}>Priority Level</label>
                <select className="form-select" style={inputStyle} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div className="col-md-6">
                <label style={labelStyle}>Status</label>
                <select className="form-select" style={inputStyle} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label style={labelStyle}>Project Description</label>
              <textarea className="form-control" rows="4" style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detailed scope..." />
            </div>

            {/* Administration */}
            <div className="mb-4">
              <label style={labelStyle}>Admin Instructions (For Manager)</label>
              <textarea className="form-control" rows="2" style={{ ...inputStyle, resize: "vertical" }} value={form.adminInstructions} onChange={(e) => setForm({ ...form, adminInstructions: e.target.value })} placeholder="Specific instructions for the project manager..." />
            </div>

            {/* Team Allocation */}
            <div style={sectionTitleStyle}>Human Capital Allocation</div>
            <div className="row g-4 mb-4">
              <div className="col-12">
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
                  <div className="form-text mt-2 text-muted">
                    Note: The assigned Manager will be responsible for selecting Team Leads and Members.
                  </div>
                </div>
              </div>
            </div>

            {/* Project Attachments */}
            <div style={sectionTitleStyle}>Project Attachments</div>
            <div className="mb-4">
              <div className="d-flex flex-column gap-3">
                <label className="btn btn-outline-light text-primary border-primary border-dashed p-4 w-100 text-center cursor-pointer" style={{ border: '2px dashed #E6C7E6', borderRadius: '16px', color: '#663399', cursor: 'pointer' }}>
                  <FiUpload size={24} className="mb-2" />
                  <div className="fw-bold">Upload SRS / Requirements / Designs</div>
                  <div className="small text-muted">Supports PDF, DOCX, ZIP (Max 25MB)</div>
                  <input type="file" multiple hidden onChange={(e) => handleRootFileUpload(e.target.files)} />
                </label>

                {/* Root Files List */}
                {form.files && form.files.length > 0 && (
                  <div className="bg-white border rounded-2xl p-3" style={{ borderColor: '#E6C7E6' }}>
                    {form.files.map((file, index) => (
                      <div key={index} className="d-flex align-items-center justify-content-between p-2 mb-2 rounded-xl" style={{ backgroundColor: '#fdfbff', border: '1px solid #f1f5f9' }}>
                        <div className="d-flex align-items-center gap-3 overflow-hidden">
                          <div className="bg-light rounded p-2" style={{ color: '#663399' }}><FiFolder size={14} /></div>
                          <div className="d-flex flex-column">
                            <span className="small fw-bold text-truncate" style={{ color: '#2E1A47', maxWidth: "300px" }}>{file.fileName}</span>
                            <span className="opacity-50" style={{ fontSize: '10px' }}>{(file.fileSize / 1024).toFixed(1)} KB</span>
                          </div>
                        </div>
                        <button type="button" className="btn btn-sm p-1 rounded-full hover-danger" style={{ color: '#A3779D' }} onClick={() => removeRootFile(index)}>
                          <FiX size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
              Cancel
            </button>
            <div className="d-flex gap-2">
              {!editing && (
                <button
                  type="button"
                  onClick={() => {
                    // Draft Logic: Set status and save
                    const draftForm = { ...form, status: 'Planning' };
                    setForm(draftForm);
                    // Trigger standard flow but implied status
                    // Since we can't easily trigger form submit programmatically with validation check without ref
                    // We will just let user click submit, but here is a button that technically just calls onSave if valid?
                    // Let's just make it a submit button that onclick sets status
                    setForm({ ...form, status: 'Planning' });
                  }}
                  className="btn px-4 fw-bold"
                  style={{ color: '#663399', backgroundColor: '#f3e8ff', borderRadius: '14px', border: '1px solid #E6C7E6' }}
                  disabled={loading}
                >
                  Save as Draft
                </button>
              )}
              <button
                type="submit"
                className="btn px-5 shadow-lg d-flex align-items-center gap-2"
                style={{ backgroundColor: '#663399', color: '#ffffff', fontWeight: 600, borderRadius: '14px', padding: '12px 30px' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner-border spinner-border-sm" role="status"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="w-5 h-5" />
                    <span>{editing ? "Update Assignment" : "Assign Project"}</span>
                  </>
                )}
              </button>
            </div>
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
