import React, { useState, useRef, useEffect } from "react";
import shiftService from "../../services/shiftService";
import { FiX, FiUpload, FiTrash2, FiSave, FiCheckCircle } from "react-icons/fi";

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0, 0, 0, 0.85)",
  backdropFilter: "blur(5px)",
  zIndex: 10000,
  display: "grid",
  placeItems: "center",
  padding: "20px",
  overflowY: "auto" // Allow scrolling if modal is taller than screen
};

const modalContentStyle = {
  background: "#ffffff",
  borderRadius: "16px",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  width: "95vw", // Match Employee Details
  maxWidth: "1400px",
  height: "90vh",
  maxHeight: "90vh",
  overflowY: "hidden", // Use inner scroll
  display: "flex",
  flexDirection: "column",
  border: "1px solid rgba(0,0,0,0.05)",
  position: "relative",
  margin: "auto"
};

const headerStyle = {
  padding: "20px 30px",
  borderBottom: "1px solid #f3f4f6",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "rgba(255,255,255,0.9)",
  position: "sticky",
  top: 0,
  zIndex: 10,
  backdropFilter: "blur(8px)"
};

const footerStyle = {
  padding: "20px 30px",
  borderTop: "1px solid #f3f4f6",
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  background: "#f9fafb",
  borderRadius: "0 0 16px 16px"
};

const sectionTitleStyle = {
  fontSize: "0.85rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: '#663399',
  fontWeight: 700,
  marginBottom: "1rem",
  marginTop: "1.5rem",
  borderBottom: "2px solid #E6C7E6",
  paddingBottom: "0.5rem"
};

const inputGroupStyle = {
  marginBottom: "1rem"
};

const labelStyle = {
  display: "block",
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "#2E1A47",
  marginBottom: "0.5rem"
};

const inputStyle = (hasError) => ({
  width: "100%",
  padding: "0.625rem 0.875rem",
  fontSize: "0.95rem",
  lineHeight: "1.25rem",
  color: "#1f2937",
  background: "#fff",
  border: hasError ? "1px solid #ef4444" : "1px solid #E6C7E6",
  borderRadius: "0.5rem",
  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  transition: "all 0.2s",
  outline: "none"
});

const emptyState = {
  id: null,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "India",
  department: "",
  position: "",
  domain: "", // Added domain field
  employeeType: "Full-time",
  employmentStatus: "Confirmed",
  joiningDate: "",
  workLocation: "",
  shift: "",
  basicSalary: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelation: "",
  notes: "",
  photoFile: null,
  // Documents
  tenthMarksheet: null,
  twelfthMarksheet: null,
  degreeCertificate: null,
  consolidatedMarksheet: null,
  provisionalCertificate: null,
  aadharCard: null,
  panCard: null,
  resume: null,
  // Bank Details
  bank_accountNumber: "",
  bank_accountHolderName: "",
  bank_ifscCode: "",
  bank_branchName: "",
};

export default function AddEmployee({
  show = false,
  mode = "add", // "add" | "edit"
  initialData = null,
  onSave = () => { },
  onClose = () => { },
}) {

  const DEPARTMENT_DOMAINS = {
    "IT": ["MERN Stack", "Python", "Java", "Frontend", "Backend", "DevOps", "Data Science", "Testing", "UI/UX", "Mobile App"],
    "HR": ["Recruitment", "Payroll", "Employee Relations", "Training", "Compliance", "General HR"],
    "Finance": ["Accounting", "Taxation", "Auditing", "Budgeting", "Financial Planning"],
    "Marketing": ["Digital Marketing", "SEO", "Content Writing", "Social Media", "Branding", "Sales"],
    "Sales": ["B2B", "B2C", "Lead Generation", "Account Management", "Business Development"],
    "Operations": ["Logistics", "Supply Chain", "Project Management", "Quality Assurance"],
    "Support": ["Technical Support", "Customer Service", "Help Desk", "Client Success"],
    "Legal": ["Corporate Law", "Compliance", "Contracts", "Intellectual Property"],
    "Management": ["Executive", "Strategic Planning", "Administration"],
    "Other": ["General", "Staff", "Intern"]
  };

  const [form, setForm] = useState(emptyState);
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState("");
  const [shifts, setShifts] = useState([]);
  const fileInputRef = useRef(null);

  // Fetch shifts
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const data = await shiftService.getAllShifts();
        setShifts(data.shifts || []);
      } catch (error) {
        console.error("Failed to fetch shifts:", error);
      }
    };
    fetchShifts();
  }, []);

  // populate when editing
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm({
        ...emptyState,
        ...initialData,
        // keep id
        id: initialData.id ?? null,
        domain: initialData.domain || "", // Populate domain
        // Ensure shift is set correctly
        shift: typeof initialData.shift === 'object' ? initialData.shift?._id : initialData.shift || "",
        // Populate documents
        tenthMarksheet: initialData.documents?.tenthMarksheet || null,
        twelfthMarksheet: initialData.documents?.twelfthMarksheet || null,
        degreeCertificate: initialData.documents?.degreeCertificate || null,
        consolidatedMarksheet: initialData.documents?.consolidatedMarksheet || null,
        provisionalCertificate: initialData.documents?.provisionalCertificate || null,
        aadharCard: initialData.documents?.aadharCard || null,
        panCard: initialData.documents?.panCard || null,
        resume: initialData.documents?.resume || null,
        // Populate bank details
        bank_accountNumber: initialData.bankDetails?.accountNumber || "",
        bank_accountHolderName: initialData.bankDetails?.accountHolderName || "",
        bank_ifscCode: initialData.bankDetails?.ifscCode || "",
        bank_branchName: initialData.bankDetails?.branchName || "",
      });
      if (initialData.photoName) {
        setPreviewUrl(initialData.photoUrl || `https://i.pravatar.cc/80?u=${initialData.id || initialData.email}`);
      } else {
        setPreviewUrl("");
      }
    } else if (mode === "add") {
      setForm(emptyState);
      setPreviewUrl("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [show, mode, initialData]);

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.dateOfBirth) e.dateOfBirth = "Date of birth is required";
    if (!form.gender) e.gender = "Gender is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state.trim()) e.state = "State is required";
    if (!form.zipCode.trim()) e.zipCode = "Zip code is required";
    if (!form.department.trim()) e.department = "Department required";
    if (!form.position.trim()) e.position = "Position required";
    if (!form.domain.trim()) e.domain = "Domain is required";
    if (!form.workLocation.trim()) e.workLocation = "Work location required";
    if (!form.joiningDate) e.joiningDate = "Joining date required";
    if (!form.basicSalary) e.basicSalary = "Basic salary is required";
    else if (isNaN(Number(form.basicSalary))) e.basicSalary = "Salary must be a number";
    if (!form.emergencyContactName.trim()) e.emergencyContactName = "Emergency contact name is required";
    if (!form.emergencyContactPhone.trim()) e.emergencyContactPhone = "Emergency contact phone is required";
    if (!form.emergencyContactRelation.trim()) e.emergencyContactRelation = "Emergency contact relation is required";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleFile = (e, field = 'photoFile') => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setForm((s) => ({ ...s, [field]: file }));
      if (field === 'photoFile') {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    } else {
      // Don't keep old files if explicitly removed or changed to nothing (though file inputs don't work that way easily without reset)
      // but we can just set to null if needed
    }
  };

  const handleClearPhoto = () => {
    setForm((s) => ({ ...s, photoFile: null }));
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (evt) => {
    evt.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      // scroll to top?
      return;
    }

    // build employee object (same as before)
    const employee = {
      ...form, // spread all first
      id: form.id ?? Date.now(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      email: form.email.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      zipCode: form.zipCode.trim(),
      shift: form.shift || null,
      basicSalary: form.basicSalary ? Number(form.basicSalary) : null,
      emergencyContact: {
        name: form.emergencyContactName,
        phone: form.emergencyContactPhone,
        relation: form.emergencyContactRelation,
      },
      photoName: form.photoFile ? form.photoFile.name : null,
      photoUrl: previewUrl || null,
    };

    onSave(employee, mode);
  };

  if (!show) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle} className="animate__animated animate__fadeInUp animate__faster">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

          {/* Header */}
          <div style={headerStyle}>
            <div>
              <h5 className="m-0 fw-bold" style={{ color: '#663399' }}>{mode === "add" ? "New Employee" : "Edit Employee"}</h5>
              <p className="m-0 small" style={{ color: '#A3779D' }}>Fill in the information below</p>
            </div>
            <button type="button" onClick={onClose} className="btn-close shadow-none" aria-label="Close"></button>
          </div>

          <div style={{ padding: "30px", flex: 1, overflowY: "auto" }}>

            {/* Personal Info */}
            <div style={{ ...sectionTitleStyle, marginTop: 0 }}>Personal Information</div>
            <div className="row g-4">
              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>First Name <span className="text-danger">*</span></label>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    style={inputStyle(errors.firstName)}
                    placeholder="e.g. John"
                  />
                  {errors.firstName && <div className="small text-danger mt-1">{errors.firstName}</div>}
                </div>
              </div>

              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Last Name <span className="text-danger">*</span></label>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    style={inputStyle(errors.lastName)}
                    placeholder="e.g. Doe"
                  />
                  {errors.lastName && <div className="small text-danger mt-1">{errors.lastName}</div>}
                </div>
              </div>

              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Email Address <span className="text-danger">*</span></label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    style={inputStyle(errors.email)}
                    placeholder="john@example.com"
                  />
                  {errors.email && <div className="small text-danger mt-1">{errors.email}</div>}
                </div>
              </div>

              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Phone Number <span className="text-danger">*</span></label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    style={inputStyle(errors.phone)}
                    placeholder="+91 9876543210"
                  />
                  {errors.phone && <div className="small text-danger mt-1">{errors.phone}</div>}
                </div>
              </div>

              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Date of Birth <span className="text-danger">*</span></label>
                  <input
                    name="dateOfBirth"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    style={inputStyle(errors.dateOfBirth)}
                  />
                  {errors.dateOfBirth && <div className="small text-danger mt-1">{errors.dateOfBirth}</div>}
                </div>
              </div>

              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Gender <span className="text-danger">*</span></label>
                  <select
                    name="gender"
                    value={["Male", "Female"].includes(form.gender) ? form.gender : (form.gender ? "Other" : "")}
                    onChange={(e) => {
                      if (e.target.value === "Other") setForm(s => ({ ...s, gender: "Other" }));
                      else handleChange(e);
                    }}
                    style={inputStyle(errors.gender)}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {(form.gender === "Other" || (form.gender && !["Male", "Female"].includes(form.gender))) && (
                    <input
                      type="text"
                      className="mt-2"
                      value={form.gender === "Other" ? "" : form.gender}
                      onChange={(e) => setForm(s => ({ ...s, gender: e.target.value }))}
                      style={inputStyle(errors.gender)}
                      placeholder="Specify Gender"
                    />
                  )}
                  {errors.gender && <div className="small text-danger mt-1">{errors.gender}</div>}
                </div>
              </div>

              <div className="col-md-6">
                <label style={labelStyle}>Profile Photo</label>
                <div className="d-flex gap-3 align-items-center">
                  {previewUrl && (
                    <div style={{ width: 48, height: 48, borderRadius: "50%", overflow: "hidden", border: "1px solid #e5e7eb" }}>
                      <img src={previewUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    name="photoFile"
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    className="form-control form-control-sm"
                    style={{ maxWidth: "250px" }}
                  />
                  {previewUrl && (
                    <button type="button" onClick={handleClearPhoto} className="btn btn-sm btn-outline-danger" title="Remove Photo">
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Address */}
            <div style={sectionTitleStyle}>Address Details</div>
            <div className="row g-4">
              <div className="col-12">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Street Address</label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    style={{ ...inputStyle(false), minHeight: "80px", resize: "vertical" }}
                    placeholder="Enter full address"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>City <span className="text-danger">*</span></label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    style={inputStyle(errors.city)}
                  />
                  {errors.city && <div className="small text-danger mt-1">{errors.city}</div>}
                </div>
              </div>

              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>State <span className="text-danger">*</span></label>
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    style={inputStyle(errors.state)}
                  />
                  {errors.state && <div className="small text-danger mt-1">{errors.state}</div>}
                </div>
              </div>

              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Zip Code <span className="text-danger">*</span></label>
                  <input
                    name="zipCode"
                    value={form.zipCode}
                    onChange={handleChange}
                    style={inputStyle(errors.zipCode)}
                  />
                  {errors.zipCode && <div className="small text-danger mt-1">{errors.zipCode}</div>}
                </div>
              </div>

              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Country</label>
                  <input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    style={inputStyle(false)}
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Employment */}
            <div style={sectionTitleStyle}>Employment Details</div>
            <div className="row g-4">


              {/* Department */}
              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Department <span className="text-danger">*</span></label>
                  <select
                    name="department"
                    value={["HR", "Sales", "IT", "Support", "Finance", "Marketing", "Operations", "Legal", "Management"].includes(form.department) ? form.department : (form.department ? "Other" : "")}
                    onChange={(e) => {
                      if (e.target.value === "Other") {
                        // Keep current value if it's already custom, or clear it?
                        // If they click Other, we want them to type.
                        // Let's set it to "Other" string temporarily or handle via UI?
                        // If we set it to "Other", it saves as "Other".
                        // Let's use a specialized handler.
                        setForm(s => ({ ...s, department: "Other" }));
                      } else {
                        handleChange(e);
                      }
                    }}
                    style={inputStyle(errors.department)}
                  >
                    <option value="">Select Department</option>
                    {["HR", "Sales", "IT", "Support", "Finance", "Marketing", "Operations", "Legal", "Management"].map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                  {/* If value is 'Other' or not in list (and not empty), show input */}
                  {(form.department === "Other" || (form.department && !["HR", "Sales", "IT", "Support", "Finance", "Marketing", "Operations", "Legal", "Management"].includes(form.department))) && (
                    <input
                      type="text"
                      className="mt-2"
                      value={form.department === "Other" ? "" : form.department}
                      onChange={(e) => setForm(s => ({ ...s, department: e.target.value }))}
                      style={inputStyle(errors.department)}
                      placeholder="Enter Department Name"
                      autoFocus={form.department === "Other"}
                    />
                  )}
                  {errors.department && <div className="small text-danger mt-1">{errors.department}</div>}
                </div>
              </div>

              {/* Position - Already an Input, keeping it as is or adding suggestions? User said 'Task or Shift in option add other'. Position is input.*/}
              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Position <span className="text-danger">*</span></label>
                  <input
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    style={inputStyle(errors.position)}
                    placeholder="e.g. Senior Developer"
                    list="positionOptions"
                  />
                  <datalist id="positionOptions">
                    <option value="Manager" />
                    <option value="Team Lead" />
                    <option value="Senior Developer" />
                    <option value="Junior Developer" />
                    <option value="Intern" />
                    <option value="HR Executive" />
                    <option value="Sales Executive" />
                  </datalist>
                </div>
              </div>

              {/* Domain Field */}
              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Domain / Specialization <span className="text-danger">*</span></label>
                  <input
                    name="domain"
                    value={form.domain}
                    onChange={handleChange}
                    style={inputStyle(errors.domain)}
                    placeholder={form.department ? `Select ${form.department} Domain` : "Select Domain"}
                    list="domainOptions"
                    disabled={!form.department}
                  />
                  <datalist id="domainOptions">
                    {(DEPARTMENT_DOMAINS[form.department] || DEPARTMENT_DOMAINS["Other"] || []).map((dom) => (
                      <option key={dom} value={dom} />
                    ))}
                  </datalist>
                  {errors.domain && <div className="small text-danger mt-1">{errors.domain}</div>}
                  {!form.department && <div className="small text-muted mt-1">Please select a department first.</div>}
                </div>
              </div>

              {/* Employee Type */}
              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Employee Type</label>
                  <select
                    name="employeeType"
                    value={["Full-time", "Part-time", "Contract", "Intern"].includes(form.employeeType) ? form.employeeType : (form.employeeType ? "Other" : "")}
                    onChange={(e) => {
                      if (e.target.value === "Other") setForm(s => ({ ...s, employeeType: "Other" }));
                      else handleChange(e);
                    }}
                    style={inputStyle(false)}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Intern">Intern</option>
                    <option value="Other">Other</option>
                  </select>
                  {(form.employeeType === "Other" || (form.employeeType && !["Full-time", "Part-time", "Contract", "Intern"].includes(form.employeeType))) && (
                    <input
                      type="text"
                      className="mt-2"
                      value={form.employeeType === "Other" ? "" : form.employeeType}
                      onChange={(e) => setForm(s => ({ ...s, employeeType: e.target.value }))}
                      style={inputStyle(false)}
                      placeholder="Enter Employee Type"
                    />
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Status</label>
                  <select
                    name="employmentStatus"
                    value={["Confirmed", "Probation", "Temporary", "Intern", "Notice Period"].includes(form.employmentStatus) ? form.employmentStatus : (form.employmentStatus ? "Other" : "")}
                    onChange={(e) => {
                      if (e.target.value === "Other") setForm(s => ({ ...s, employmentStatus: "Other" }));
                      else handleChange(e);
                    }}
                    style={inputStyle(false)}
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Probation">Probation</option>
                    <option value="Temporary">Temporary</option>
                    <option value="Intern">Intern</option>
                    <option value="Notice Period">Notice Period</option>
                    <option value="Other">Other</option>
                  </select>
                  {(form.employmentStatus === "Other" || (form.employmentStatus && !["Confirmed", "Probation", "Temporary", "Intern", "Notice Period"].includes(form.employmentStatus))) && (
                    <input
                      type="text"
                      className="mt-2"
                      value={form.employmentStatus === "Other" ? "" : form.employmentStatus}
                      onChange={(e) => setForm(s => ({ ...s, employmentStatus: e.target.value }))}
                      style={inputStyle(false)}
                      placeholder="Enter Status"
                    />
                  )}
                </div>
              </div>

              {/* Joining Date - Keep */}
              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Date of Joining <span className="text-danger">*</span></label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={form.joiningDate}
                    onChange={handleChange}
                    style={inputStyle(errors.joiningDate)}
                  />
                  {errors.joiningDate && <div className="small text-danger mt-1">{errors.joiningDate}</div>}
                </div>
              </div>

              {/* Work Location - Input with Datalist */}
              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Work Location <span className="text-danger">*</span></label>
                  <input
                    name="workLocation"
                    value={form.workLocation}
                    onChange={handleChange}
                    style={inputStyle(errors.workLocation)}
                    placeholder="e.g. Headquarters"
                    list="locationOptions"
                  />
                  <datalist id="locationOptions">
                    <option value="Headquarters" />
                    <option value="Remote" />
                    <option value="Tiruppur Branch" />
                    <option value="Coimbatore Branch" />
                    <option value="Bangalore Branch" />
                  </datalist>
                  {errors.workLocation && <div className="small text-danger mt-1">{errors.workLocation}</div>}
                </div>
              </div>

              {/* Shift - Keep as Select from DB, maybe add Other if user wants to create on fly? 
                  Creating shift on fly involves times. Let's keep Shift as is for now unless requested. 
                  User said "in task or in shift". Probably referring to Shift Form itself, not assigning shift.
                  But I'll add 'Other' just in case they want a text override (though it breaks shift logic probably).
                  Let's NOT break shift logic. Shifts are objects with times. 
                  If they type "Other", we don't know start/end time.
                  I will SKIP Shift for now as it requires complex object creation.
              */}
              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Shift</label>
                  <select
                    name="shift"
                    value={form.shift}
                    onChange={handleChange}
                    style={inputStyle(false)}
                  >
                    <option value="">Select Shift</option>
                    {shifts.map((shift) => (
                      <option key={shift._id} value={shift._id}>
                        {shift.shiftName} ({shift.startTime} - {shift.endTime})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Basic Salary <span className="text-danger">*</span></label>
                  <input
                    name="basicSalary"
                    value={form.basicSalary}
                    onChange={handleChange}
                    style={inputStyle(errors.basicSalary)}
                    placeholder="0.00"
                  />
                  {errors.basicSalary && <div className="small text-danger mt-1">{errors.basicSalary}</div>}
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div style={sectionTitleStyle}>Emergency Contact</div>
            <div className="row g-4">
              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Contact Name <span className="text-danger">*</span></label>
                  <input
                    name="emergencyContactName"
                    value={form.emergencyContactName}
                    onChange={handleChange}
                    style={inputStyle(errors.emergencyContactName)}
                  />
                  {errors.emergencyContactName && <div className="small text-danger mt-1">{errors.emergencyContactName}</div>}
                </div>
              </div>
              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Contact Phone <span className="text-danger">*</span></label>
                  <input
                    name="emergencyContactPhone"
                    value={form.emergencyContactPhone}
                    onChange={handleChange}
                    style={inputStyle(errors.emergencyContactPhone)}
                  />
                  {errors.emergencyContactPhone && <div className="small text-danger mt-1">{errors.emergencyContactPhone}</div>}
                </div>
              </div>
              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Relation <span className="text-danger">*</span></label>
                  <input
                    name="emergencyContactRelation"
                    value={form.emergencyContactRelation}
                    onChange={handleChange}
                    style={inputStyle(errors.emergencyContactRelation)}
                  />
                  {errors.emergencyContactRelation && <div className="small text-danger mt-1">{errors.emergencyContactRelation}</div>}
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div style={sectionTitleStyle}>Bank Information</div>
            <div className="row g-4">
              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Account Number</label>
                  <input
                    name="bank_accountNumber"
                    value={form.bank_accountNumber || ''}
                    onChange={handleChange}
                    style={inputStyle(false)}
                    placeholder="XXXXXXXXXXXXXXXX"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Holder Name</label>
                  <input
                    name="bank_accountHolderName"
                    value={form.bank_accountHolderName || ''}
                    onChange={handleChange}
                    style={inputStyle(false)}
                    placeholder="As per bank records"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>IFSC Code</label>
                  <input
                    name="bank_ifscCode"
                    value={form.bank_ifscCode || ''}
                    onChange={handleChange}
                    style={inputStyle(false)}
                    placeholder="SBIN0000000"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Branch Name</label>
                  <input
                    name="bank_branchName"
                    value={form.bank_branchName || ''}
                    onChange={handleChange}
                    style={inputStyle(false)}
                    placeholder="e.g. Main Branch"
                  />
                </div>
              </div>
            </div>

            {/* Documents */}
            <div style={sectionTitleStyle}>Documents</div>
            <div className="row g-4">
              {[
                { key: 'tenthMarksheet', label: '10th Marksheet' },
                { key: 'twelfthMarksheet', label: '12th Marksheet' },
                { key: 'degreeCertificate', label: 'Degree Certificate' },
                { key: 'consolidatedMarksheet', label: 'Consolidated Marksheet' },
                { key: 'provisionalCertificate', label: 'Provisional Certificate' },
                { key: 'aadharCard', label: 'Aadhar Card' },
                { key: 'panCard', label: 'PAN Card' },
                { key: 'resume', label: 'Resume' }
              ].map((doc) => (
                <div className="col-md-6" key={doc.key}>
                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>{doc.label}</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => handleFile(e, doc.key)}
                      style={{ fontSize: "0.9rem" }}
                    />
                    {form[doc.key] && typeof form[doc.key] === 'string' && (
                      <div className="mt-1">
                        <a href={form[doc.key]} target="_blank" rel="noreferrer" className="text-decoration-none small" style={{ color: '#663399' }}>
                          <FiCheckCircle className="me-1" /> View Uploaded Document
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div style={sectionTitleStyle}>Additional Notes</div>
            <div className="row">
              <div className="col-12">
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  style={{ ...inputStyle(false), minHeight: "100px" }}
                  placeholder="Any other relevant details..."
                />
              </div>
            </div>

          </div>

          {/* Footer */}
          <div style={footerStyle}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-light"
              style={{ fontWeight: 500 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn d-flex align-items-center gap-2"
              style={{ fontWeight: 600, paddingLeft: "1.5rem", paddingRight: "1.5rem", backgroundColor: '#663399', color: '#ffffff' }}
            >
              <FiSave />
              {mode === "add" ? "Save Employee" : "Update Employee"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

