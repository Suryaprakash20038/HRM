import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../css/Placement.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Placement() {
  const [placements, setPlacements] = useState([]);
  // Dummy candidates for demo
  const [candidates] = useState([
    { id: "1", name: "Reno Rizx", role: "Frontend Dev" },
    { id: "2", name: "John Wick", role: "Security Lead" },
    { id: "3", name: "Tony Stark", role: "Tech Lead" }
  ]);

  const [form, setForm] = useState({
    id: null,
    candidate: "",
    jobTitle: "",
    department: "",
    location: "On-site",
    probation: "3 Months",
    company: "",
    status: "Placed",
    salary: "",
    joiningDate: "",
    offerLetter: null,
    offerFileName: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  // LOAD DATA
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("placements")) || [];
    setPlacements(saved);
  }, []);

  const saveLocal = (data) => {
    localStorage.setItem("placements", JSON.stringify(data));
  };

  // Helper: File to Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleChange = async (e) => {
    const { id, value, files } = e.target;
    if (id === "offerLetter") {
      const file = files[0];
      if (file) {
        try {
          const base64 = await fileToBase64(file);
          setForm({ ...form, offerLetter: base64, offerFileName: file.name });
        } catch (err) {
          console.error("File error:", err);
        }
      }
    } else {
      setForm({ ...form, [id]: value });
    }
  };

  const savePlacement = () => {
    if (!form.candidate || !form.jobTitle || !form.salary) {
      alert("Candidate, Job Title & Salary are required.");
      return;
    }

    let updated = [];
    if (form.id) {
      updated = placements.map((p) => (p.id === form.id ? form : p));
    } else {
      updated = [...placements, { ...form, id: Date.now() }];
    }

    setPlacements(updated);
    saveLocal(updated);
    resetForm();
  };

  const editPlacement = (p) => {
    setForm(p);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deletePlacement = (id) => {
    if (!window.confirm("Remove this placement record?")) return;
    const newData = placements.filter((p) => p.id !== id);
    setPlacements(newData);
    saveLocal(newData);
  };

  const resetForm = () => {
    setForm({
      id: null,
      candidate: "",
      jobTitle: "",
      department: "",
      location: "On-site",
      probation: "3 Months",
      company: "",
      status: "Placed",
      salary: "",
      joiningDate: "",
      offerLetter: null,
      offerFileName: "",
    });
    setIsEditing(false);
  };

  return (
    <div className="placement-page">
      <div className="container">

        {/* BACK BUTTON */}
        <div className="back-btn-wrapper">
          <Link to="/recruitment" className="back-btn">
            <i className="bi bi-arrow-left"></i> Back to Dashboard
          </Link>
        </div>

        <div className="page-header">
          <h2 className="page-title">Placement & Offers</h2>
          <p className="page-subtitle">Manage successfully hired candidates</p>
        </div>

        {/* ================= FORM SECTION ================= */}
        <div className="glass-form">
          <div className="form-header">
            <div className="icon-box">
              <i className="bi bi-trophy-fill"></i>
            </div>
            <h3>{isEditing ? "Edit Placement Details" : "Add New Placement"}</h3>
          </div>

          <div className="form-grid-3">
            {/* Col 1 */}
            <div className="field">
              <label>Candidate</label>
              <select id="candidate" value={form.candidate} onChange={handleChange}>
                <option value="">Select Candidate</option>
                {candidates.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Job Title</label>
              <input type="text" id="jobTitle" value={form.jobTitle} onChange={handleChange} placeholder="e.g. Senior React Dev" />
            </div>

            <div className="field">
              <label>Department</label>
              <input type="text" id="department" value={form.department} onChange={handleChange} placeholder="e.g. Engineering" />
            </div>

            {/* Col 2 */}
            <div className="field">
              <label>Company / Client</label>
              <input type="text" id="company" value={form.company} onChange={handleChange} placeholder="Company Name" />
            </div>

            <div className="field">
              <label>Annual CTC (Salary)</label>
              <div className="input-icon">
                <span>$</span>
                <input type="text" id="salary" value={form.salary} onChange={handleChange} placeholder="e.g. 12,00,000" />
              </div>
            </div>

            <div className="field">
              <label>Joining Date</label>
              <input type="date" id="joiningDate" value={form.joiningDate} onChange={handleChange} />
            </div>

            {/* Col 3 */}
            <div className="field">
              <label>Location</label>
              <select id="location" value={form.location} onChange={handleChange}>
                <option>On-site</option>
                <option>Remote</option>
                <option>Hybrid</option>
              </select>
            </div>

            <div className="field">
              <label>Probation Period</label>
              <select id="probation" value={form.probation} onChange={handleChange}>
                <option>1 Month</option>
                <option>3 Months</option>
                <option>6 Months</option>
                <option>None</option>
              </select>
            </div>

            <div className="field">
              <label>Status</label>
              <select id="status" value={form.status} onChange={handleChange}>
                <option>Placed</option>
                <option>Joined</option>
                <option>In Process</option>
                <option>Offer Declined</option>
              </select>
            </div>

            {/* File Upload - Full Width */}
            <div className="field full-width">
              <label>Offer Letter / Contract</label>
              <div className="file-upload-box">
                <input type="file" id="offerLetter" onChange={handleChange} />
                <div className="file-placeholder">
                  {form.offerFileName ? (
                    <span className="file-name"><i className="bi bi-file-earmark-pdf-fill"></i> {form.offerFileName}</span>
                  ) : (
                    <span><i className="bi bi-cloud-upload"></i> Upload Offer Letter</span>
                  )}
                </div>
              </div>
            </div>

          </div>

          <div className="form-actions">
            <button className="btn-save" onClick={savePlacement}>
              {isEditing ? "Update Record" : "Confirm Placement"}
            </button>
            {isEditing && <button className="btn-cancel" onClick={resetForm}>Cancel</button>}
          </div>
        </div>

        {/* ================= LIST SECTION (Modern Ticket Rows) ================= */}
        <h3 className="section-heading">Recent Placements</h3>

        <div className="placement-list">
          {placements.length === 0 ? (
            <div className="no-data">No placements recorded yet.</div>
          ) : (
            placements.map((p) => (
              <div key={p.id} className={`placement-ticket ${p.status.toLowerCase().replace(" ", "-")}`}>

                {/* 1. Date Box */}
                <div className="ticket-date">
                  <span className="day">
                    {p.joiningDate ? new Date(p.joiningDate).getDate() : "--"}
                  </span>
                  <span className="month">
                    {p.joiningDate ? new Date(p.joiningDate).toLocaleString('default', { month: 'short' }) : "--"}
                  </span>
                </div>

                {/* 2. Info */}
                <div className="ticket-info">
                  <h4 className="ticket-title">
                    {p.candidate}
                    <span className="job-badge">{p.jobTitle}</span>
                  </h4>
                  <div className="ticket-sub">
                    <span><i className="bi bi-building"></i> {p.company}</span>
                    <span className="salary-text">
                      <i className="bi bi-cash-stack"></i> {p.salary}
                    </span>
                    <span><i className="bi bi-geo-alt"></i> {p.location}</span>
                  </div>
                </div>

                {/* 3. Actions */}
                <div className="ticket-actions">
                  <span className={`status-pill ${p.status.toLowerCase().replace(" ", "-")}`}>
                    {p.status}
                  </span>

                  <div className="action-row">
                    {p.offerLetter && (
                      <a href={p.offerLetter} download={p.offerFileName || "Offer_Letter.pdf"} className="icon-link" title="Download Offer">
                        <i className="bi bi-download"></i>
                      </a>
                    )}
                    <button className="icon-btn" onClick={() => editPlacement(p)}>
                      <i className="bi bi-pencil-fill"></i>
                    </button>
                    <button className="icon-btn delete" onClick={() => deletePlacement(p.id)}>
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}