import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../css/JobPosting.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const JobPosting = () => {
  const [jobs, setJobs] = useState([]);
  const [employees, setEmployees] = useState([]);

  // NEW
  const [otherPlatform, setOtherPlatform] = useState("");

  // Simple Form State
  const [form, setForm] = useState({
    id: null,
    position: "",
    platform: "LinkedIn",
    status: "Active",
    postedBy: "",
    postedDate: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  // Load Data
  useEffect(() => {
    const sampleEmployees = [
      { id: "emp_101", fullName: "Rajesh Kumar" },
      { id: "emp_102", fullName: "Anita Verma" },
    ];

    const storedEmps = localStorage.getItem("employees");
    if (!storedEmps) {
      localStorage.setItem("employees", JSON.stringify(sampleEmployees));
      setEmployees(sampleEmployees);
    } else {
      setEmployees(JSON.parse(storedEmps));
    }

    const storedJobs = JSON.parse(localStorage.getItem("jobs")) || [];
    setJobs(storedJobs);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveJob = () => {
    if (!form.position || !form.postedBy) {
      alert("Position & Posted By are required!");
      return;
    }

    let updated = [];
    if (form.id) {
      updated = jobs.map((j) => (j.id === form.id ? form : j));
    } else {
      const newJob = {
        ...form,
        id: Date.now(),
        postedDate: new Date().toISOString(),
      };
      updated = [...jobs, newJob];
    }

    setJobs(updated);
    localStorage.setItem("jobs", JSON.stringify(updated));
    resetForm();
  };

  const editJob = (job) => {
    setForm(job);
    setIsEditing(true);

    // If editing custom platform, show text field
    if (
      job.platform !== "LinkedIn" &&
      job.platform !== "Naukri" &&
      job.platform !== "Indeed" &&
      job.platform !== "Website"
    ) {
      setOtherPlatform(job.platform);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteJob = (id) => {
    if (!window.confirm("Delete this job post?")) return;
    const updated = jobs.filter((j) => j.id !== id);
    setJobs(updated);
    localStorage.setItem("jobs", JSON.stringify(updated));
  };

  const resetForm = () => {
    setForm({
      id: null,
      position: "",
      platform: "LinkedIn",
      status: "Active",
      postedBy: "",
      postedDate: "",
    });
    setOtherPlatform("");
    setIsEditing(false);
  };

  const getPlatformIcon = (platform) => {
    const p = (platform || "").toLowerCase();
    if (p === "linkedin") return "bi-linkedin";
    if (p === "naukri") return "bi-briefcase-fill";
    if (p === "indeed") return "bi-search";
    return "bi-globe";
  };

  return (
    <div className="job-page">
      <div className="container">

        {/* BACK BUTTON */}
        <div className="back-btn-wrapper">
          <Link to="/recruitment" className="back-btn">
            <i className="bi bi-chevron-left"></i> Recruitment Terminal
          </Link>
        </div>

        <div className="page-header d-flex align-items-center gap-2 mb-2">
          <div style={{ width: 4, height: 28, backgroundColor: '#663399', borderRadius: 4 }}></div>
          <h2 className="page-title mb-0">Talent Acquisition Hub</h2>
        </div>
        <p style={{ color: '#A3779D', fontWeight: 600, marginTop: -32, marginBottom: 48 }}>Manage global mission role deployments and personnel acquisition</p>

        {/* =========== FORM =========== */}
        <div className="glass-form">
          <div className="form-header">
            <h3>{isEditing ? "Modify Directive" : "Deploy New Directive"}</h3>
          </div>

          <div className="form-grid-2">

            {/* Position */}
            <div className="field">
              <label>Mission Role Specification</label>
              <input
                name="position"
                value={form.position}
                onChange={handleChange}
                placeholder="e.g. Senior Logic Architect"
              />
            </div>

            {/* Platform + Other Input */}
            <div>
              <div className="field">
                <label>Deployment Platform</label>
                <select
                  name="platform"
                  value={
                    form.platform === "LinkedIn" ||
                      form.platform === "Naukri" ||
                      form.platform === "Indeed" ||
                      form.platform === "Website"
                      ? form.platform
                      : "Other"
                  }
                  onChange={(e) => {
                    const value = e.target.value;

                    if (value === "Other") {
                      setOtherPlatform("");
                      setForm({ ...form, platform: "" });
                    } else {
                      setOtherPlatform("");
                      setForm({ ...form, platform: value });
                    }
                  }}
                >
                  <option value="LinkedIn">LinkedIn Terminal</option>
                  <option value="Naukri">Naukri Network</option>
                  <option value="Indeed">Indeed Portal</option>
                  <option value="Website">Global Website</option>
                  <option value="Other">External Protocol</option>
                </select>
              </div>

              {/* SHOW ONLY WHEN OTHER IS SELECTED */}
              {form.platform === "" && (
                <div className="field mt-3">
                  <label>Custom Protocol Name</label>
                  <input
                    value={otherPlatform}
                    onChange={(e) => {
                      setOtherPlatform(e.target.value);
                      setForm({ ...form, platform: e.target.value });
                    }}
                    placeholder="Enter platform identifier"
                  />
                </div>
              )}
            </div>

            {/* Posted By */}
            <div className="field">
              <label>Authorizing Personnel</label>
              <select
                name="postedBy"
                value={form.postedBy}
                onChange={handleChange}
              >
                <option value="">Select Protocol Officer</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.fullName}>
                    {emp.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="field">
              <label>Lifecycle Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Active">Directly Active</option>
                <option value="Closed">Mission Completed</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-save" onClick={saveJob}>
              {isEditing ? "Update Directive" : "Authorize Deployment"}
            </button>
            {isEditing && (
              <button className="btn-cancel" onClick={resetForm}>
                Abort Change
              </button>
            )}
          </div>
        </div>

        {/* =========== LIST =========== */}
        <div className="d-flex align-items-center gap-2 mb-4">
          <div style={{ width: 3, height: 20, backgroundColor: '#A3779D', borderRadius: 4 }}></div>
          <h3 className="section-heading mb-0">Active Deployment Directives</h3>
        </div>

        <div className="job-list">
          {jobs.length === 0 ? (
            <div className="no-data">No active directives found in terminal.</div>
          ) : (
            jobs.map((job) => {
              const safePlatform = job.platform || "LinkedIn";
              const safeStatus = job.status || "Active";
              const displayDate = job.postedDate
                ? new Date(job.postedDate).toLocaleDateString()
                : "Active Now";

              return (
                <div
                  key={job.id}
                  className={`job-ticket ${safeStatus.toLowerCase()}`}
                >
                  <div className={`platform-icon ${safePlatform.toLowerCase()}`}>
                    <i className={`bi ${getPlatformIcon(safePlatform)}`}></i>
                  </div>

                  <div className="ticket-info">
                    <h4 className="ticket-title">{job.position}</h4>
                    <div className="ticket-meta">
                      <span>{safePlatform.toUpperCase()} PROTOCOL</span> <span className="mx-2">•</span>
                      <span> {displayDate}</span> <span className="mx-2">•</span>
                      <span> {job.postedBy || "SEC OPS"}</span>
                    </div>
                  </div>

                  <div className="ticket-actions">
                    <span
                      className={`status-pill ${safeStatus.toLowerCase()}`}
                    >
                      {safeStatus === 'Active' ? 'DEPLOYED' : 'TERMINATED'}
                    </span>

                    <div className="action-row">
                      <button
                        className="icon-btn"
                        onClick={() => editJob(job)}
                        title="Edit Directive"
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button
                        className="icon-btn delete"
                        onClick={() => deleteJob(job.id)}
                        title="Remove Directive"
                      >
                        <i className="bi bi-trash3-fill"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default JobPosting;
