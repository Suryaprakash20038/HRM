import React from "react";
import {
  FiUser, FiMapPin, FiBriefcase, FiDollarSign,
  FiFileText, FiCreditCard, FiPhone, FiMail,
  FiCalendar, FiX, FiDownload
} from "react-icons/fi";

export default function EmployeeDetails({ show = false, employee = null, onClose = () => { } }) {
  if (!show || !employee) return null;

  // Helper function to get employee photo URL
  const getEmployeePhotoUrl = (emp) => {
    if (emp.profileImage) {
      if (emp.profileImage.startsWith('http')) return emp.profileImage;
      return `http://localhost:5000/${emp.profileImage}`;
    }
    if (emp.photoUrl && emp.photoUrl.startsWith('http')) return emp.photoUrl;
    return `https://i.pravatar.cc/150?u=${emp._id || emp.id || emp.email}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "—";
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  // Helper function to get document URL
  const getDocumentUrl = (docPath) => {
    if (!docPath) return "#";
    if (docPath.startsWith('http')) return docPath;
    return `http://localhost:5000/${docPath}`;
  };

  // Reusable Section Component
  const Section = ({ icon: Icon, title, children }) => (
    <div className="mb-4 bg-white rounded-3 p-3 border" style={{ borderColor: '#E6C7E6' }}>
      <h6 className="d-flex align-items-center fw-bold mb-3" style={{ color: '#663399' }}>
        <Icon className="me-2" /> {title}
      </h6>
      <div className="row g-3">
        {children}
      </div>
    </div>
  );

  // Field Component
  const Field = ({ label, value, col = 6, fullWidth = false }) => (
    <div className={`col-md-${fullWidth ? 12 : col}`}>
      <label className="small text-muted text-uppercase fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>{label}</label>
      <div className="text-dark fw-medium">{value || '—'}</div>
    </div>
  );

  return (
    <div className="modal fade show" style={{ display: "grid", placeItems: "center", position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: 'blur(5px)', zIndex: 10000, overflow: 'hidden' }}>
      <div className="bg-white rounded-4 shadow-lg d-flex flex-column" style={{ width: '95vw', maxWidth: '1400px', height: '90vh', maxHeight: '90vh', position: 'relative' }}>
        <div className="flex-grow-1 overflow-hidden d-flex flex-column">

          {/* Header */}
          <div className="modal-header border-bottom bg-white p-4 p-lg-5 sticky-top z-3">
            <div className="d-flex align-items-center gap-4 w-100">
              <img
                src={getEmployeePhotoUrl(employee)}
                alt={employee.name}
                className="rounded-4 object-fit-cover shadow-sm"
                style={{ width: '90px', height: '90px' }}
              />
              <div className="flex-grow-1">
                <h3 className="fw-bold text-dark mb-1">{employee.name || `${employee.firstName} ${employee.lastName}`}</h3>
                <div className="d-flex flex-wrap gap-2 align-items-center">
                  <span className="fw-medium px-2 py-1 rounded small" style={{ backgroundColor: '#E6C7E6', color: '#663399' }}>
                    {employee.positionWithDomain || employee.position || employee.role || 'Employee'}
                  </span>
                  <span style={{ color: '#A3779D' }}>•</span>
                  <span style={{ color: '#A3779D' }}>{employee.department || 'General'}</span>
                  <span style={{ color: '#A3779D' }}>•</span>
                  <span className="small" style={{ color: '#A3779D' }}>ID: {employee.employeeId || '—'}</span>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <span className={`badge px-3 py-2 rounded-pill`} style={{ backgroundColor: employee.isActive !== false ? '#E6C7E6' : '#FEE2E2', color: employee.isActive !== false ? '#663399' : '#DC2626' }}>
                  {employee.isActive !== false ? "Active" : "Inactive"}
                </span>
                <button type="button" className="btn-close ms-2" onClick={onClose} aria-label="Close" />
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="modal-body p-4 p-lg-5 bg-white overflow-auto">
            <div className="row g-5">
              {/* Left Column */}
              <div className="col-lg-6 border-end-lg">
                <Section title="Contact & Personal" icon={FiUser}>
                  <Field label="Email Address" value={employee.email} fullWidth />
                  <Field label="Phone Number" value={employee.phone} />
                  <Field label="Date of Birth" value={formatDate(employee.dateOfBirth)} />
                  <Field label="Gender" value={employee.gender} />
                  <Field label="Marital Status" value={employee.maritalStatus} />
                </Section>

                <Section title="Address" icon={FiMapPin}>
                  <Field label="Street" value={employee.address} fullWidth />
                  <Field label="City" value={employee.city} />
                  <Field label="State/Province" value={employee.state} />
                  <Field label="Postal Code" value={employee.zipCode} />
                  <Field label="Country" value={employee.country} />
                </Section>

                <Section title="Emergency Contact" icon={FiPhone}>
                  <Field label="Name" value={employee.emergencyContactName || employee.emergencyContact?.name} />
                  <Field label="Relation" value={employee.emergencyContactRelation || employee.emergencyContact?.relation} />
                  <Field label="Contact Number" value={employee.emergencyContactPhone || employee.emergencyContact?.phone} fullWidth />
                </Section>
              </div>

              {/* Right Column */}
              <div className="col-lg-6">
                <Section title="Employment Information" icon={FiBriefcase}>
                  <Field label="Department" value={employee.department} />
                  <Field label="Job Role" value={employee.position} />
                  <Field label="Domain" value={employee.domain} />
                  <Field label="Employment Type" value={employee.employmentType || employee.type} />
                  <Field label="Joining Date" value={formatDate(employee.joiningDate || employee.joinDate)} />
                  <Field label="Location" value={employee.workLocation} />
                  <Field label="Shift Schedule" value={employee.shift ? (typeof employee.shift === 'object' ? `${employee.shift.shiftName} (${employee.shift.startTime} - ${employee.shift.endTime})` : employee.shift) : null} />
                </Section>

                <Section title="Financial Details" icon={FiDollarSign}>
                  <Field label="Basic Salary" value={formatCurrency(employee.basicSalary || employee.salary)} />
                  <Field label="Allowances" value={formatCurrency(employee.allowances)} />
                  <Field label="Bank Name" value={employee.bankDetails?.branchName} />
                  <Field label="Account Number" value={employee.bankDetails?.accountNumber} />
                  <Field label="IFSC Code" value={employee.bankDetails?.ifscCode} />
                </Section>

                {(employee.documents || employee.resume) && (
                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-3 border-bottom pb-2">
                      <div className="p-2 bg-light rounded-circle me-3 text-primary">
                        <FiFileText size={18} />
                      </div>
                      <h6 className="fw-bold text-uppercase text-secondary m-0 ls-1" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Documents</h6>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {[
                        { key: 'resume', label: 'Resume' },
                        { key: 'tenthMarksheet', label: '10th Marksheet' },
                        { key: 'twelfthMarksheet', label: '12th Marksheet' },
                        { key: 'degreeCertificate', label: 'Degree' },
                        { key: 'aadharCard', label: 'Aadhar' },
                        { key: 'panCard', label: 'PAN' }
                      ].map(doc => {
                        const val = (employee.documents && employee.documents[doc.key]) || employee[doc.key];
                        return val ? (
                          <a
                            key={doc.key}
                            href={getDocumentUrl(val)}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm d-flex align-items-center gap-2 rounded-3 px-3 py-2"
                            style={{ border: '1px solid #E6C7E6', color: '#663399', backgroundColor: '#ffffff' }}
                          >
                            <FiDownload size={14} /> {doc.label}
                          </a>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {employee.notes && (
              <div className="mt-4 p-4 bg-secondary-subtle rounded-3">
                <h6 className="fw-bold text-dark mb-2">Additional Notes</h6>
                <p className="mb-0 text-muted" style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{employee.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
