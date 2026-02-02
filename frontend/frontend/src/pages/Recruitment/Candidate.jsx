import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../css/Candidate.css";
import {
  ArrowLeft,
  RefreshCw,
  Search,
  Eye,
  FileText,
  PencilLine,
  Trash2,
  Phone,
  Mail,
  Briefcase,
  Flag,
  Linkedin,
  ExternalLink,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  GraduationCap,
  Sparkles
} from "lucide-react";
import candidateService from "../../services/candidateService";
import axios from 'axios';
import { toast } from 'react-hot-toast'; // Import Toast
import DesignSelection from "../../components/Recruitment/DesignSelection";
import ContentForm from "../../components/Recruitment/ContentForm";

export default function Candidate() {
  const resumeRef = useRef(null);

  const [candidates, setCandidates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // VIEW MODAL STATE
  const [viewCandidate, setViewCandidate] = useState(null);
  const [offerCandidate, setOfferCandidate] = useState(null); // For Offer Letter Modal
  const [modalStep, setModalStep] = useState(1); // 1: Design Selection, 2: Content Form
  const [offerForm, setOfferForm] = useState({
    templateId: '', // Legacy support
    designId: '', // New design system
    joiningDate: '',
    salary: '',
    email: '',
    // New fields for generic letter system
    employeeName: '',
    designation: '',
    hrName: '',
    bodyContent: '',
    letterType: 'Offer' // Default type
  });

  // Added 'experience' and 'linkedin' fields
  const [form, setForm] = useState({
    id: null,
    name: "",
    phone: "",
    email: "",
    experience: "",
    linkedin: "",
    appliedFor: "",
    currentSalary: "",
    expectedSalary: "",
    source: "Job Portal",
    referralName: "",
    status: "New",
  });

  const [templates, setTemplates] = useState([]); // Store templates

  useEffect(() => {
    loadCandidates();
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await candidateService.getAllTemplates(); // You might need to add this to candidateService or use axios directly
      setTemplates(res);
    } catch (error) {
      console.error("Failed to load templates", error);
    }
  };

  const loadCandidates = async () => {
    try {
      setIsLoading(true);
      const data = await candidateService.getAllCandidates();
      // Filter out candidates with "Interviewing" or "Selected" status
      // "Interviewing" -> Interview Scheduler
      // "Selected" -> Offer Provided List (also in Interview Scheduler)
      const filteredCandidates = data.filter(candidate => candidate.status !== 'Interviewing' && candidate.status !== 'Selected');
      setCandidates(filteredCandidates);
    } catch (error) {
      console.error("Failed to load candidates", error);
    } finally {
      setIsLoading(false);
    }
  };

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // Helper: File to Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      alert("Name & Phone are required");
      return;
    }

    try {
      setIsLoading(true);
      let resumeBase64 = null;
      let resumeName = form.resume || "No file";

      if (resumeRef.current?.files?.[0]) {
        try {
          resumeName = resumeRef.current.files[0].name;
          resumeBase64 = await fileToBase64(resumeRef.current.files[0]);
        } catch (err) {
          console.error("Resume upload error", err);
        }
      } else if (isEditing && form.resumeBase64) {
        resumeBase64 = form.resumeBase64;
      }

      const candidatePayload = {
        ...form,
        resume: resumeName,
        resumeBase64: resumeBase64
      };

      if (isEditing) {
        // Validation: Ensure we have an ID
        const updateId = form._id || form.id;
        if (!updateId) {
          console.error("Update failed: Missing Candidate ID");
          alert("Error: Cannot update candidate without ID. Please reload.");
          return;
        }

        // Update
        const updated = await candidateService.updateCandidate(updateId, candidatePayload);
        setCandidates(prev => prev.map(c => c._id === updated._id ? updated : c));
        alert("Candidate updated successfully! Status email sent.");
      } else {
        // Create
        const created = await candidateService.createCandidate(candidatePayload);
        setCandidates(prev => [created, ...prev]);
        alert("Candidate added successfully! Welcome email sent.");
      }
      resetForm();
    } catch (error) {
      console.error("Error saving candidate:", error);
      alert("Failed to save candidate. " + (error.response?.data?.message || ""));
    } finally {
      setIsLoading(false);
    }
  }

  function startEdit(c) {
    // Ensure we capture the _id properly
    setForm({
      ...c,
      _id: c._id, // Explicitly ensure _id is in form state
      id: c._id   // Fallback
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteCandidate(id) {
    if (window.confirm("Delete this candidate?")) {
      try {
        await candidateService.deleteCandidate(id);
        setCandidates((prev) => prev.filter((c) => c._id !== id));
      } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to delete candidate");
      }
    }
  }

  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Helper to upload template from modal
  const handleUploadTemplate = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const toastId = toast.loading('Uploading and extracting text...');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/recruitment-settings/templates/upload`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );

      if (res.data.success) {
        toast.dismiss(toastId);
        toast.success('Template uploaded from PDF!');
        fetchTemplates(); // Refresh templates list
        // Auto-select and move to next step. Also populate bodyContent from the new template.
        setOfferForm(prev => ({
          ...prev,
          designId: res.data.data._id,
          bodyContent: res.data.data.bodyContent
        }));

        // Short delay to let the user see the success message before switching
        setTimeout(() => {
          setModalStep(2);
        }, 1000);
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Upload failed: ' + (error.response?.data?.message || error.message));
    }
  };

  // --- LETTER GENERATION HANDLERS (Offer / Interview / etc) ---
  function openOfferModal(candidate) {
    setOfferCandidate(candidate);
    setModalStep(1); // Start at design selection
    setSelectedTemplate(null); // Reset selection
    setOfferForm({
      templateId: '',
      designId: '',
      joiningDate: (candidate.appointmentDetails?.joiningDate && new Date(candidate.appointmentDetails.joiningDate).toISOString().split('T')[0]) ||
        (candidate.offerDetails?.joiningDate && new Date(candidate.offerDetails.joiningDate).toISOString().split('T')[0]) ||
        new Date().toISOString().split('T')[0],
      salary: candidate.expectedSalary || "",
      email: candidate.email,
      employeeName: candidate.name,
      designation: candidate.appliedFor || 'Software Engineer',
      hrName: 'Human Resources',
      bodyContent: '',
      letterType: 'Offer'
    });
    // Close view modal if open
    setViewCandidate(null);
  }

  async function handleSendOffer(e) {
    e.preventDefault();

    // Detect if selected design is a Custom Template (ID check)
    const isCustomTemplate = templates.some(t => t._id === offerForm.designId);

    // Validate designId
    if (!offerForm.designId) {
      alert("Please select a design template");
      return;
    }

    // Validate required content fields (Skip for Custom Fixed PDFs as per user request)
    if (!isCustomTemplate && (!offerForm.employeeName || !offerForm.designation || !offerForm.bodyContent)) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setIsLoading(true);

      // (Removed duplicate isCustomTemplate declaration)

      // Prepare data for backend
      const letterData = {
        designId: isCustomTemplate ? null : offerForm.designId,
        templateId: isCustomTemplate ? offerForm.designId : null,
        letterType: offerForm.letterType, // Pass letter type
        name: offerForm.employeeName,
        designation: offerForm.designation,
        role: offerForm.designation,
        salary: offerForm.salary,
        joiningDate: offerForm.joiningDate,
        hrName: offerForm.hrName,
        bodyContent: offerForm.bodyContent,

        // Interview Details
        interviewDate: offerForm.interviewDate,
        interviewTime: offerForm.interviewTime,
        interviewMode: offerForm.interviewMode,
        interviewLocation: offerForm.interviewLocation,

        // Experience / Relieving Details
        lastWorkingDay: offerForm.lastWorkingDay
      };

      await candidateService.sendOfferLetter(offerCandidate._id || offerCandidate.id, letterData);
      alert('Letter Sent Successfully!');
      setOfferCandidate(null);
      setModalStep(1);

      // Update local state to 'Selected'
      setCandidates(prev => prev.map(c =>
        (c._id === offerCandidate._id || c.id === offerCandidate.id) ? { ...c, status: 'Selected' } : c
      ));

    } catch (error) {
      console.error("Letter Error:", error);
      alert("Failed to send Letter");
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setForm({
      id: null,
      name: "",
      phone: "",
      email: "",
      experience: "",
      linkedin: "",
      appliedFor: "",
      currentSalary: "",
      expectedSalary: "",
      source: "Job Portal",
      referralName: "",
      status: "New",
    });
    if (resumeRef.current) resumeRef.current.value = "";
    setIsEditing(false);
  }

  // Helper to get initials (e.g. "Reno Rizx" -> "RR")
  const getInitials = (name) => {
    return name
      ? name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)
      : "??";
  };

  // Color badge logic
  const getStatusClass = (status) => {
    switch (status) {
      case "New": return "badge-new";
      case "Selected": return "badge-success";
      case "Rejected": return "badge-danger";
      case "Interviewing": return "badge-warning";
      case "JD Not Available": return "badge-secondary";
      default: return "badge-default";
    }
  };

  // --- SYNC HANDLER ---
  const handleSync = async () => {
    let sheetId = prompt("Enter Google Spreadsheet ID (or full URL):");
    if (!sheetId) return;

    // Extract ID if URL is provided
    const match = sheetId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      sheetId = match[1];
    }

    try {
      setIsLoading(true);
      const res = await candidateService.syncCandidates(sheetId);
      alert(res.message || "Sync completed successfully");
      loadCandidates();
    } catch (error) {
      console.error("Sync error:", error);
      alert("Sync failed: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const getATSColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const filtered = candidates.filter((c) =>
    `${c.name} ${c.phone} ${c.appliedFor}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="candidate-page">
      <div className="container">

        {/* BACK BUTTON */}
        <div className="mb-6">
          <Link to="/recruitment" className="d-inline-flex align-items-center gap-2 text-[#663399] fw-bold text-decoration-none hover:translate-x-[-4px] transition-transform">
            <ArrowLeft size={18} /> Back to Command
          </Link>
        </div>

        <div className="mb-10 d-flex justify-content-between align-items-center">
          <div>
            <div className="d-flex align-items-center gap-3 mb-2">
              <div style={{ width: 4, height: 28, backgroundColor: '#663399', borderRadius: 4 }}></div>
              <h2 className="mb-0 fw-black text-[#2E1A47] tracking-tight" style={{ fontSize: '2.5rem', fontWeight: 900 }}>Field Asset Directory</h2>
            </div>
            <p className="text-[#A3779D] fw-bold" style={{ fontSize: '1.1rem' }}>Manage and monitor the recruitment mission pipeline</p>
          </div>
          <button className="btn d-flex align-items-center gap-2"
            style={{ border: '2px solid #663399', color: '#663399', fontWeight: 800, borderRadius: '16px', padding: '12px 24px', fontSize: '0.9rem' }}
            onClick={handleSync}>
            <RefreshCw size={18} /> Protocol Sync
          </button>
        </div>

        {/* ---------------- FORM CARD ---------------- */}
        <form className="form-card" onSubmit={handleSave}>
          <h4 className="form-title">{isEditing ? "Edit Candidate" : "Add New Candidate"}</h4>

          <div className="form-grid">
            {/* Name */}
            <div className="form-item">
              <label className="label">Full Name</label>
              <input className="control" name="name" value={form.name} onChange={handleChange} placeholder="e.g. John Doe" required />
            </div>

            {/* Phone */}
            <div className="form-item">
              <label className="label">Phone</label>
              <input className="control" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 9876..." required />
            </div>

            {/* Email */}
            <div className="form-item">
              <label className="label">Email</label>
              <input className="control" name="email" value={form.email} onChange={handleChange} placeholder="john@example.com" required />
            </div>

            {/* Experience */}
            <div className="form-item">
              <label className="label">Experience (Years)</label>
              <input className="control" type="number" name="experience" value={form.experience} onChange={handleChange} placeholder="e.g. 2" />
            </div>

            {/* LinkedIn */}
            <div className="form-item">
              <label className="label">LinkedIn / Portfolio</label>
              <input className="control" name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="https://..." />
            </div>

            {/* Applied For */}
            <div className="form-item">
              <label className="label">Applied Role</label>
              <input className="control" name="appliedFor" value={form.appliedFor} onChange={handleChange} placeholder="e.g. React Dev" required />
            </div>

            {/* Source Dropdown */}
            <div className="form-item">
              <label className="label">Source</label>
              <select className="control" name="source" value={form.source} onChange={handleChange}>
                <option>Job Portal</option>
                <option>Referral</option>
                <option>LinkedIn</option>
                <option>Walk-in</option>
                <option>Google Form</option>
              </select>
            </div>

            {/* CONDITIONAL FIELD: REFERRAL NAME */}
            {form.source === "Referral" && (
              <div className="form-item fade-in">
                <label className="label" style={{ color: '#2563eb' }}>Refered By (Name)</label>
                <input
                  className="control"
                  name="referralName"
                  value={form.referralName}
                  onChange={handleChange}
                  placeholder="Who referred them?"
                  style={{ borderColor: '#bfdbfe', background: '#eff6ff' }}
                />
              </div>
            )}

            {/* Status */}
            <div className="form-item">
              <label className="label">Status</label>
              <select className="control" name="status" value={form.status} onChange={handleChange}>
                <option>New</option>
                <option>Screening</option>
                <option>Interviewing</option>
                <option>Selected</option>
                <option>Rejected</option>
                <option>JD Not Available</option>
              </select>
            </div>

            {/* Salary Fields */}
            <div className="form-item">
              <label className="label">Current CTC</label>
              <input className="control" type="number" name="currentSalary" value={form.currentSalary} onChange={handleChange} />
            </div>

            <div className="form-item">
              <label className="label">Expected CTC</label>
              <input className="control" type="number" name="expectedSalary" value={form.expectedSalary} onChange={handleChange} />
            </div>

            {/* Resume */}
            <div className="form-item full-width">
              <label className="label">Resume</label>
              <div className="file-upload-wrapper">
                <input className="control file-input" type="file" ref={resumeRef} />
              </div>
            </div>

          </div>

          <div className="form-actions">
            <button className="btn primary" disabled={isLoading}>
              {isLoading ? "Processing..." : (isEditing ? "Update Candidate" : "Save Candidate")}
            </button>
            <button type="button" className="btn reset" onClick={resetForm} disabled={isLoading}>Cancel</button>
          </div>
        </form>

        {/* ---------------- LIST TABLE ---------------- */}
        <div className="list-section">
          <div className="list-header">
            <h3 className="list-title">Total Candidates <span className="count-badge">{candidates.length}</span></h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                className="search-modern"
                placeholder="Search by name, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Role</th>
                  <th>Exp</th>
                  <th>ATS Score</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      {isLoading ? "Loading..." : "No candidates found."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">{getInitials(c.name)}</div>
                          <div>
                            <div className="user-name">{c.name}</div>
                            <div className="user-sub">{c.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="role-text">{c.appliedFor}</div>
                        <div className="linkedin-link text-truncate" style={{ maxWidth: '100px' }}>
                          {c.linkedin ? <a href={c.linkedin} target="_blank" rel="noreferrer">View Profile</a> : '-'}
                        </div>
                      </td>
                      <td>{c.experience ? `${c.experience} Yrs` : 'Fresh'}</td>
                      <td>
                        {c.atsScore ? (
                          <span style={{
                            fontWeight: 'bold',
                            color: getATSColor(c.atsScore)
                          }}>
                            {c.atsScore}%
                          </span>
                        ) : <span className="text-muted">-</span>}
                      </td>
                      <td>{c.source}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button className="btn p-2 border-0" style={{ color: '#663399', background: '#f3e8ff', borderRadius: '10px' }} onClick={() => setViewCandidate(c)}>
                            <Eye size={18} />
                          </button>
                          <button className="btn p-2 border-0" style={{ color: '#0ea5e9', background: '#e0f2fe', borderRadius: '10px' }} onClick={() => openOfferModal(c)} title="Generate Letter">
                            <FileText size={18} />
                          </button>
                          <button className="btn p-2 border-0" style={{ color: '#663399', background: '#f3e8ff', borderRadius: '10px' }} onClick={() => startEdit(c)}>
                            <PencilLine size={18} />
                          </button>
                          <button className="btn p-2 border-0" style={{ color: '#dc2626', background: '#fee2e2', borderRadius: '10px' }} onClick={() => deleteCandidate(c._id)}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= VIEW MODAL ================= */}
      {viewCandidate && (
        <div className="modal-overlay" onClick={() => setViewCandidate(null)}>
          <div className="modal-content-glass" onClick={e => e.stopPropagation()}>

            <div className="modal-header-premium">
              <div className="header-content">
                <h3>{viewCandidate.name}</h3>
                <span className="header-subtitle">{viewCandidate.appliedFor}</span>
              </div>
              <button className="close-btn-glass" onClick={() => setViewCandidate(null)}>&times;</button>
            </div>

            <div className="modal-body-scroll">
              <div className="view-grid-premium">

                {/* ATS Section */}
                <div className="info-group full ats-card">
                  <div className="ats-header">
                    <div className="ats-score-circle" style={{ borderColor: getATSColor(viewCandidate.atsScore || 0) }}>
                      <span className="score-num" style={{ color: getATSColor(viewCandidate.atsScore || 0) }}>
                        {viewCandidate.atsScore || 0}%
                      </span>
                      <span className="score-label">Match</span>
                    </div>
                    <div className="ats-details">
                      <h4 style={{ margin: 0, color: '#1e293b' }}>ATS Analysis</h4>
                      {viewCandidate.status === 'JD Not Available' ? (
                        <p style={{ margin: '5px 0', fontSize: '0.85rem', color: '#dc2626', fontWeight: 600 }}>
                          <i className="bi bi-exclamation-triangle-fill"></i> Job Description Not Found.
                        </p>
                      ) : (viewCandidate.resume && viewCandidate.atsScore === 0) ? (
                        <div style={{ marginTop: '5px' }}>
                          <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#b45309', fontWeight: 600 }}>
                            <i className="bi bi-file-earmark-break-fill"></i> No ATS Match (0%).
                          </p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#78350f' }}>
                            Could not read text. Resume might be an image.
                          </p>
                        </div>
                      ) : (
                        <p style={{ margin: '5px 0', fontSize: '0.85rem', color: '#64748b' }}>
                          Profile Match for <strong>{viewCandidate.appliedFor}</strong>
                        </p>
                      )}

                      {/* Breakdown Chips */}
                      {viewCandidate.atsScoreBreakdown && (
                        <div className="ats-breakdown-chips">
                          <span className="breakdown-chip" title="Skills Match">Skills: {viewCandidate.atsScoreBreakdown.skillsMatch}%</span>
                          <span className="breakdown-chip" title="Experience Relevance">Exp: {viewCandidate.atsScoreBreakdown.experienceRelevance}%</span>
                          <span className="breakdown-chip" title="Domain Match">Domain: {viewCandidate.atsScoreBreakdown.domainMatch}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {viewCandidate.atsScore > 0 && (
                    <div className="ats-skills">
                      <div className="skill-col">
                        <label className="skill-label success"><i className="bi bi-check-circle-fill"></i> Matched Skills</label>
                        <div className="skill-tags">
                          {(viewCandidate.matchedSkills || []).map(skill => (
                            <span key={skill} className="skill-tag match">{skill}</span>
                          ))}
                        </div>
                      </div>
                      <div className="skill-col">
                        <label className="skill-label danger"><i className="bi bi-x-circle-fill"></i> Missing Skills</label>
                        <div className="skill-tags">
                          {(viewCandidate.missingSkills || []).map(skill => (
                            <span key={skill} className="skill-tag missing">{skill}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Parsed Resume Details - Auto-Extracted */}
                {(viewCandidate.isFresher !== undefined || viewCandidate.extractedExperience !== undefined || viewCandidate.experience === 0) && (
                  <div className="info-group full glass-panel-section">
                    <div className="section-header-row">
                      <h5 className="section-header">
                        <i className={`bi bi-${(viewCandidate.experience > 0 || viewCandidate.extractedExperience > 0) ? 'briefcase' : 'backpack'}`}></i>
                        {(viewCandidate.experience > 0 || viewCandidate.extractedExperience > 0) ? ' Professional Profile' : ' Fresher Profile'}
                      </h5>
                      <div className="source-badges">
                        <span className="auto-badge"><i className="bi bi-robot"></i> Scanned from Resume</span>
                      </div>
                    </div>

                    {/* Extracted Skills */}
                    {((viewCandidate.extractedSkills && viewCandidate.extractedSkills.length > 0) || (viewCandidate.matchedSkills && viewCandidate.matchedSkills.length > 0)) && (
                      <div className="sub-section">
                        <label className="sub-label">Detected Skills</label>
                        <div className="skill-tags">
                          {(viewCandidate.extractedSkills || viewCandidate.matchedSkills || []).map((s, i) => <span key={i} className="skill-tag neutral">{s}</span>)}
                        </div>
                      </div>
                    )}

                    {/* Experience / Internships */}
                    <div className="sub-section">
                      <label className="sub-label">
                        {(viewCandidate.experience > 0 || viewCandidate.extractedExperience > 0) ? 'Work History' : 'Internships & Training'}
                      </label>
                      {!(viewCandidate.experience > 0 || viewCandidate.extractedExperience > 0) ? (
                        viewCandidate.internships && viewCandidate.internships.length > 0 ? (
                          <ul className="details-list">
                            {viewCandidate.internships.map((int, i) => (
                              <li key={i} className="mb-2">
                                <div className="fw-bold">{int.company || 'Unknown Company'}</div>
                                <div className="text-muted text-sm">{int.domain} {int.duration ? `• ${int.duration}` : ''}</div>
                              </li>
                            ))}
                          </ul>
                        ) : <p className="text-muted text-sm">No Internships detected in resume.</p>
                      ) : (
                        viewCandidate.companies && viewCandidate.companies.length > 0 ? (
                          <ul className="details-list">
                            {viewCandidate.companies.map((comp, i) => (
                              <li key={i} className="mb-2">
                                <div className="fw-bold">{comp.name || 'Company'}</div>
                                <div className="text-muted text-sm">{comp.role || 'Role'} {comp.duration ? `• ${comp.duration}` : ''}</div>
                              </li>
                            ))}
                          </ul>
                        ) : <p className="text-muted text-sm">No specific work history detected.</p>
                      )}
                    </div>

                    {/* Projects */}
                    <div className="sub-section">
                      <label className="sub-label">Projects ({viewCandidate.projects?.length || 0})</label>
                      {viewCandidate.projects && viewCandidate.projects.length > 0 ? (
                        <ul className="details-list">
                          {viewCandidate.projects.map((p, i) => (
                            <li key={i} className="mb-2" title={p.description}>
                              <div className="fw-bold">{p.title}</div>
                              {p.description && <div className="text-muted text-sm" style={{ whiteSpace: 'pre-wrap' }}>{p.description.substring(0, 150) + (p.description.length > 150 ? '...' : '')}</div>}
                            </li>
                          ))}
                        </ul>
                      ) : <p className="text-muted text-sm">No projects specific detected.</p>}
                    </div>

                    {/* Certifications */}
                    {viewCandidate.certifications && viewCandidate.certifications.length > 0 && (
                      <div className="sub-section">
                        <label className="sub-label">Certifications / Courses</label>
                        <ul className="details-list">
                          {viewCandidate.certifications.map((c, i) => (
                            <li key={i} className="mb-2">
                              <div className="fw-bold">{c.name}</div>
                              {c.issuer && <div className="text-muted text-sm">{c.issuer}</div>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}


                {/* Info Fields */}
                <div className="info-group">
                  <label><i className="bi bi-telephone"></i> Phone</label>
                  <p>{viewCandidate.phone}</p>
                </div>
                <div className="info-group">
                  <label><i className="bi bi-envelope"></i> Email</label>
                  <p>{viewCandidate.email}</p>
                </div>
                <div className="info-group">
                  <label><i className="bi bi-briefcase"></i> Total Experience</label>
                  <p>{viewCandidate.experience ? `${viewCandidate.experience} Years` : 'Fresher'}</p>
                </div>
                <div className="info-group">
                  <label><i className="bi bi-flag"></i> Current Status</label>
                  <span className={`status-pill ${getStatusClass(viewCandidate.status)}`}>{viewCandidate.status}</span>
                </div>
                <div className="info-group">
                  <label><i className="bi bi-share"></i> Source</label>
                  <p>{viewCandidate.source} {viewCandidate.referralName && <span className="text-muted">(Ref: {viewCandidate.referralName})</span>}</p>
                </div>
                <div className="info-group">
                  <label><i className="bi bi-cash"></i> Exp. CTC</label>
                  <p>{viewCandidate.expectedSalary || '-'}</p>
                </div>
                <div className="info-group full">
                  <label><i className="bi bi-linkedin"></i> LinkedIn / Portfolio</label>
                  {viewCandidate.linkedin ? (
                    <a href={viewCandidate.linkedin} target="_blank" rel="noreferrer" className="link-premium">
                      {viewCandidate.linkedin} <i className="bi bi-box-arrow-up-right"></i>
                    </a>
                  ) : <p className="text-muted">Not Provided</p>}
                </div>

                {/* Resume Section with Drive Fallback */}
                <div className="info-group full">
                  <label><i className="bi bi-file-earmark-text"></i> Resume</label>
                  {viewCandidate.resumeBase64 ? (
                    <div className="file-card">
                      <div className="file-icon"><i className="bi bi-file-earmark-pdf-fill"></i></div>
                      <div className="file-info">
                        <span className="file-name">{viewCandidate.resume || "Candidate_Resume.pdf"}</span>
                        <span className="file-meta">PDF Document</span>
                      </div>
                      <div className="file-actions">
                        <a href={viewCandidate.resumeBase64} target="_blank" rel="noreferrer" className="btn-file-view"><i className="bi bi-eye"></i> View</a>
                        <a href={viewCandidate.resumeBase64} download={viewCandidate.resume || "Resume.pdf"} className="btn-file-download"><i className="bi bi-download"></i></a>
                      </div>
                    </div>
                  ) : (viewCandidate.resumeLink || (viewCandidate.linkedin && viewCandidate.linkedin.includes('drive.google.com'))) ? (
                    <div className="file-card" style={{ borderColor: '#f59e0b', background: '#fffbeb' }}>
                      <div className="file-icon" style={{ background: '#fef3c7', color: '#d97706' }}><i className="bi bi-google"></i></div>
                      <div className="file-info">
                        <span className="file-name">Google Drive Resume</span>
                        <span className="file-meta">File not downloaded (Check Permissions)</span>
                      </div>
                      <div className="file-actions">
                        <a href={viewCandidate.resumeLink || viewCandidate.linkedin} target="_blank" rel="noreferrer" className="btn-file-view" style={{ color: '#d97706', borderColor: '#d97706' }}>
                          <i className="bi bi-box-arrow-up-right"></i> Open in Drive
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted">No resume uploaded.</p>
                  )}
                </div>

              </div>
            </div>

            <div className="modal-footer-glass">
              <button className="btn btn-outline-primary" style={{ marginRight: '10px' }} onClick={() => openOfferModal(viewCandidate)}>
                <i className="bi bi-file-earmark-pdf"></i> Generate Letter
              </button>
              <button className="btn primary" onClick={() => setViewCandidate(null)}>Close</button>
            </div>
          </div>
        </div>
      )
      }

      {/* ================= OFFER LETTER MODAL ================= */}
      {
        offerCandidate && (
          <div className="modal-overlay" onClick={() => { setOfferCandidate(null); setModalStep(1); }}>
            <div className="modal-content-glass offer-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px' }}>
              <div className="modal-header-premium header-offer">
                <div className="header-content">
                  <h3>Generate Letter - {offerCandidate.name}</h3>
                  <span className="header-subtitle">
                    Step {modalStep} of 2: {modalStep === 1 ? 'Select Design' : 'Enter Content'}
                  </span>
                </div>
                <button className="close-btn-glass" onClick={() => { setOfferCandidate(null); setModalStep(1); }}>&times;</button>
              </div>

              <form onSubmit={handleSendOffer}>
                <div className="modal-body-scroll" style={{ padding: '30px' }}>

                  {/* STEP 1: Letter Type & Design Selection */}
                  {modalStep === 1 && (
                    <>
                      <div className="mb-4">
                        <label className="form-label fw-bold">Select Letter Type</label>
                        <div className="d-flex flex-wrap gap-2">
                          {['Offer', 'Appointment', 'Interview Call', 'Next Round', 'Experience', 'Relieving'].map(type => (
                            <button
                              key={type}
                              type="button"
                              className={`btn ${offerForm.letterType === type ? 'btn-primary' : 'btn-outline-secondary'}`}
                              onClick={() => {
                                setOfferForm({ ...offerForm, letterType: type, designId: '' }); // Reset design
                              }}
                            >
                              {type} {type.includes('Call') || type.includes('Round') ? '' : 'Letter'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <DesignSelection
                        selectedDesign={offerForm.designId}
                        onSelectDesign={(designId) => {
                          let finalId = designId;
                          let selectedTemplate = templates.find(t => t._id === designId);

                          // If not found (System Design ID), try to find matching DB template
                          if (!selectedTemplate) {
                            const styleMatch = designId.match(/^[a-z]+-(.+)$/);
                            if (styleMatch) {
                              const style = styleMatch[1];
                              const styleName = style.charAt(0).toUpperCase() + style.slice(1); // e.g. Elegant
                              const type = offerForm.letterType;

                              // Find DB template with matching Name and Type
                              const dbTemplate = templates.find(t =>
                                t.type === type &&
                                t.name.includes(styleName) &&
                                !t.isFixedPdf
                              );

                              if (dbTemplate) {
                                finalId = dbTemplate._id;
                                selectedTemplate = dbTemplate;
                              }
                            }
                          }

                          setOfferForm({
                            ...offerForm,
                            designId: finalId,
                            bodyContent: selectedTemplate ? selectedTemplate.bodyContent : offerForm.bodyContent
                          });
                        }}
                        letterType={offerForm.letterType}
                        customTemplates={templates}
                        onUploadTemplate={handleUploadTemplate}
                      />
                    </>
                  )}

                  {/* STEP 2: Content Form */}
                  {modalStep === 2 && (
                    <ContentForm
                      formData={offerForm}
                      onFormChange={setOfferForm}
                      letterType={offerForm.letterType}
                      customTemplates={templates}
                    />
                  )}

                </div>

                <div className="modal-footer-glass" style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 30px' }}>
                  <div>
                    {modalStep === 2 && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setModalStep(1)}
                      >
                        <i className="bi bi-arrow-left"></i> Back to Design
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn reset"
                      onClick={() => { setOfferCandidate(null); setModalStep(1); }}
                    >
                      Cancel
                    </button>
                    {modalStep === 1 ? (
                      <button
                        type="button"
                        className="btn primary"
                        disabled={!offerForm.designId}
                        onClick={() => setModalStep(2)}
                      >
                        Next: Enter Content <i className="bi bi-arrow-right"></i>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="btn primary"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Sending...' : 'Generate & Send PDF'}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div >
        )
      }

      <style>{`
        .modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(15, 23, 42, 0.6); z-index: 1100;
            display: flex; align-items: center; justify-content: center;
            backdrop-filter: blur(8px);
            animation: fadeIn 0.3s ease;
        }
        
        .header-offer { 
            background: #ffffff !important; 
            border-bottom: 1px solid #f1f5f9;
        }
        .header-offer .header-content h3 { color: #0f172a !important; }
        .header-offer .header-subtitle { color: #64748b !important; }
        .header-offer .close-btn-glass { background: #f1f5f9 !important; color: #64748b !important; }
        .header-offer .close-btn-glass:hover { background: #e2e8f0 !important; color: #0f172a !important; transform: rotate(90deg); }

        .modal-content-glass {
            background: #ffffff; width: 95%; max-width: 800px; /* WIDENED MODAL */
            border-radius: 20px; overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
        }
        
        /* Header */
        .modal-header-premium {
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            padding: 20px 30px;
            color: white;
            display: flex; justify-content: space-between; align-items: flex-start;
        }
        .header-content h3 { margin: 0; font-size: 1.4rem; font-weight: 700; }
        .header-subtitle { opacity: 0.8; font-size: 0.9rem; margin-top: 5px; display: block; }
        
        .close-btn-glass {
            background: rgba(255,255,255,0.1); border: none; width: 32px; height: 32px;
            border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;
            font-size: 1.2rem; transition: 0.2s;
        }
        .close-btn-glass:hover { background: rgba(255,255,255,0.2); transform: rotate(90deg); }

        /* Body */
        .modal-body-scroll { 
            padding: 30px; 
            max-height: 70vh; 
            overflow-y: auto; 
            scrollbar-width: thin;
            scrollbar-color: #cbd5e1 #f1f5f9;
        }
        
        .modal-body-scroll::-webkit-scrollbar { width: 6px; }
        .modal-body-scroll::-webkit-scrollbar-track { background: transparent; }
        .modal-body-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .modal-body-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        .view-grid-premium { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }
        .info-group label {
            display: block; font-size: 0.75rem; color: #64748b; margin-bottom: 6px;
            text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;
        }
        .info-group label i { margin-right: 5px; color: #94a3b8; }
        .info-group p { margin: 0; font-size: 1rem; color: #1e293b; font-weight: 500; }
        .info-group.full { grid-column: span 2; }
        
        .status-pill { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
        .link-premium { color: #2563eb; text-decoration: none; font-weight: 500; display: inline-flex; align-items: center; gap: 6px; }
        .link-premium:hover { text-decoration: underline; }

        /* ATS CARD STYLES */
        .ats-card {
            background: #f8fafc; border: 1px solid #e2e8f0;
            border-radius: 16px; padding: 20px;
        }
        .ats-header { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; }
        .ats-score-circle {
            width: 60px; height: 60px; border-radius: 50%; border: 4px solid #e2e8f0;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            background: white; flex-shrink: 0;
        }
        .score-num { font-weight: 800; font-size: 1.1rem; line-height: 1; }
        .score-label { font-size: 0.6rem; color: #64748b; text-transform: uppercase; }
        .ats-skills { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        .skill-label { font-size: 0.75rem; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 5px; }
        .skill-label.success { color: #10b981; }
        .skill-label.danger { color: #ef4444; }
        .skill-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .skill-tag { padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
        .skill-tag.match { background: #d1fae5; color: #065f46; }
        .skill-tag.missing { background: #fee2e2; color: #991b1b; }


        /* File Card Design */
        .file-card {
            display: flex; align-items: center; gap: 15px;
            background: #f8fafc; border: 1px solid #e2e8f0;
            padding: 15px; border-radius: 16px;
            transition: 0.2s;
        }
        .file-card:hover { border-color: #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
        
        .file-icon {
            width: 48px; height: 48px; background: #fee2e2; color: #ef4444;
            border-radius: 12px; display: flex; align-items: center; justify-content: center;
            font-size: 1.5rem;
        }
        .file-info { flex: 1; }
        .file-name { display: block; font-weight: 600; color: #1e293b; font-size: 0.95rem; }
        .file-meta { font-size: 0.8rem; color: #64748b; }
        
        .file-actions { display: flex; gap: 10px; }
        .btn-file-view, .btn-file-download {
            display: inline-flex; align-items: center; justify-content: center;
            height: 36px; padding: 0 15px; border-radius: 8px;
            font-size: 0.85rem; font-weight: 600; text-decoration: none;
            transition: 0.2s; gap: 6px;
        }
        .btn-file-view { background: white; border: 1px solid #e2e8f0; color: #334155; }
        .btn-file-view:hover { border-color: #3b82f6; color: #3b82f6; }
        
        .btn-file-download { background: #eff6ff; color: #3b82f6; border: 1px solid transparent; width: 36px; padding: 0; }
        .btn-file-download:hover { background: #3b82f6; color: white; }

        /* Footer */
        .modal-footer-glass {
            padding: 20px 30px; background: #f8fafc; border-top: 1px solid #f1f5f9;
            text-align: right;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        @media (max-width: 600px) {
            .view-grid-premium { grid-template-columns: 1fr; gap: 15px; }
            .info-group.full { grid-column: span 1; }
            .file-card { flex-direction: column; align-items: flex-start; }
            .file-actions { width: 100%; justify-content: flex-end; margin-top: 10px; }
        }
      `}</style>
    </div >
  );
}