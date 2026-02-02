import React, { useState, useEffect, useMemo } from "react";
import EmployeeDashboard from "./EmployeeDashboard";
import AddEmployee from "./AddEmployee";
import DepartmentCard from "./DepartmentCard";
import DepartmentModal from "./DepartmentModal";
import EmployeeDetails from "./EmployeeDetails";
import employeeService from "../../services/employeeService";
import toast from "react-hot-toast";
import '../../css/Employee.css';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);

  // Department Modal State
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAllEmployees({ limit: 1000 });
      setEmployees(data.employees);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAdd = async (employeeData, mode) => {
    try {
      // Map frontend form data to backend expected format with proper defaults
      const backendData = {
        firstName: employeeData.firstName || "",
        lastName: employeeData.lastName || "",
        email: employeeData.email || "",
        phone: employeeData.phone || "",
        dateOfBirth: employeeData.dateOfBirth || new Date().toISOString().split('T')[0],
        gender: employeeData.gender || "Male",
        address: employeeData.address || "Not provided",
        city: employeeData.city || "Not provided",
        state: employeeData.state || "Not provided",
        zipCode: employeeData.zipCode || "000000",
        country: employeeData.country || "India",
        department: employeeData.department || "General",
        position: employeeData.position || "Employee",
        domain: employeeData.domain || "", // Add domain
        employmentType: employeeData.employeeType || employeeData.employmentType || "Full-time",
        joiningDate: employeeData.joiningDate || new Date().toISOString().split('T')[0],
        workLocation: employeeData.workLocation || "Office",
        shift: employeeData.shift || null,
        basicSalary: employeeData.basicSalary || 0,
        emergencyContactName: employeeData.emergencyContact?.name || employeeData.emergencyContactName || "Not provided",
        emergencyContactPhone: employeeData.emergencyContact?.phone || employeeData.emergencyContactPhone || "0000000000",
        emergencyContactRelation: employeeData.emergencyContact?.relation || employeeData.emergencyContactRelation || "Not specified",
        notes: employeeData.notes || "",

        // Documents
        tenthMarksheet: employeeData.tenthMarksheet,
        twelfthMarksheet: employeeData.twelfthMarksheet,
        degreeCertificate: employeeData.degreeCertificate,
        consolidatedMarksheet: employeeData.consolidatedMarksheet,
        provisionalCertificate: employeeData.provisionalCertificate,
        aadharCard: employeeData.aadharCard,
        panCard: employeeData.panCard,
        resume: employeeData.resume,

        // Bank Details
        bank_accountNumber: employeeData.bank_accountNumber,
        bank_accountHolderName: employeeData.bank_accountHolderName,
        bank_ifscCode: employeeData.bank_ifscCode,
        bank_branchName: employeeData.bank_branchName,
      };

      // Handle profile image
      if (employeeData.photoFile) {
        backendData.profileImage = employeeData.photoFile;
      }

      if (mode === "add") {
        await employeeService.createEmployee(backendData);
        toast.success("Employee added successfully");
      } else if (mode === "edit") {
        await employeeService.updateEmployee(employeeData.id, backendData);
        toast.success("Employee updated successfully");
      }

      fetchEmployees();
      setShowAddModal(false);
      setEditTarget(null);
    } catch (error) {
      console.error("Failed to save employee:", error);
      const errorMsg = error.response?.data?.message || "Failed to save employee";
      const validationErrors = error.response?.data?.errors;

      if (validationErrors && Array.isArray(validationErrors)) {
        const details = validationErrors.map(e => e.message || e).join(", ");
        toast.error(`${errorMsg}: ${details}`);
      } else {
        toast.error(errorMsg);
      }
    }
  };

  const handleEdit = (emp) => {
    setSelectedDepartment(null);
    // Map backend data back to form format
    const formData = {
      id: emp._id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone,
      dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split('T')[0] : "",
      gender: emp.gender || "",
      address: emp.address || "",
      city: emp.city || "",
      state: emp.state || "",
      zipCode: emp.zipCode || "",
      country: emp.country || "India",
      department: emp.department,
      position: emp.position,
      domain: emp.domain, // Add domain
      employeeType: emp.employmentType || "Full-time",
      employmentStatus: emp.status || "Confirmed",
      joiningDate: emp.joiningDate ? emp.joiningDate.split('T')[0] : "",
      workLocation: emp.workLocation || "",
      shift: emp.shift || "Day",
      basicSalary: emp.basicSalary || "",
      emergencyContactName: emp.emergencyContactName || "",
      emergencyContactPhone: emp.emergencyContactPhone || "",
      emergencyContactRelation: emp.emergencyContactRelation || "",
      notes: emp.notes || "",
      photoUrl: emp.profileImage,
      documents: emp.documents,
      bankDetails: emp.bankDetails || {},
    };
    setEditTarget(formData);
    setShowAddModal(true);
  };

  const handleView = (emp) => {
    setSelectedDepartment(null);
    setViewTarget(emp);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this employee?")) {
      try {
        await employeeService.deleteEmployee(id);
        toast.success("Employee deleted successfully");
        fetchEmployees();
      } catch (error) {
        console.error("Failed to delete employee:", error);
        toast.error("Failed to delete employee");
      }
    }
  };

  const openAdd = () => {
    setEditTarget(null);
    setShowAddModal(true);
  };

  // Helper function to get employee photo URL
  const getEmployeePhotoUrl = (employee) => {
    if (employee.profileImage) {
      // If profileImage starts with http, use it directly
      if (employee.profileImage.startsWith('http')) {
        return employee.profileImage;
      }
      // Otherwise prepend the backend URL
      return `http://localhost:5000/${employee.profileImage}`;
    }
    // Fallback to avatar
    return `https://i.pravatar.cc/100?u=${employee._id || employee.email}`;
  };

  // Map employees for the list view
  const mappedEmployees = useMemo(() => employees.filter(e => e.isActive !== false).map(emp => ({
    ...emp, // Pass full object first so we can override properties below
    id: emp._id,
    name: `${emp.firstName} ${emp.lastName}`,
    email: emp.email,
    // Explicitly construct string on frontend for robustness
    position: emp.domain ? `${emp.position} (${emp.domain})` : emp.position,
    role: emp.position, // Keep raw position in role or backward compatibility
    department: emp.department,
    type: emp.employmentType,
    status: emp.isActive ? "Active" : "Inactive",
    photoUrl: getEmployeePhotoUrl(emp)
  })).sort((a, b) => {
    const getRank = (p) => {
      const pos = (p || "").toLowerCase();
      if (pos.includes('manager')) return 1;
      if (pos.includes('lead') || pos.includes('tl')) return 2;
      return 3;
    };
    return getRank(a.position) - getRank(b.position);
  }), [employees]);

  // Group employees by department
  const departmentGroups = useMemo(() => {
    const groups = {};
    mappedEmployees.forEach(emp => {
      const dept = emp.department || "General";
      if (!groups[dept]) {
        groups[dept] = [];
      }
      groups[dept].push(emp);
    });
    return groups;
  }, [mappedEmployees]);

  // Get employees for the selected department modal
  const selectedDepartmentEmployees = useMemo(() => {
    if (!selectedDepartment) return [];
    return departmentGroups[selectedDepartment] || [];
  }, [selectedDepartment, departmentGroups]);

  return (
    <div className="container-fluid employee-page" style={{ paddingBottom: 50 }}>
      {/* ADDED SUBTLE BACKGROUND GRADIENTS TO MATCH OTHER PAGES */}
      <style>{`
        .employee-page {
            background-image:
                radial-gradient(at 0% 0%, rgba(102, 51, 153, 0.05) 0px, transparent 50%),
                radial-gradient(at 100% 0%, rgba(163, 119, 157, 0.05) 0px, transparent 50%);
        }
      `}</style>

      <div className="mb-4">
        <EmployeeDashboard employees={mappedEmployees} />
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0" style={{ color: '#2E1A47' }}>Departments</h3>
        <button className="btn" style={{ backgroundColor: '#663399', color: '#ffffff' }} onClick={openAdd}>
          + Add Employee
        </button>
      </div>

      <div className="mb-4">
        {loading ? (
          <div className="text-center py-5">Loading employees...</div>
        ) : (
          <div className="row justify-content-center">
            {Object.keys(departmentGroups).length > 0 ? (
              Object.entries(departmentGroups).map(([deptName, deptEmployees]) => (
                <DepartmentCard
                  key={deptName}
                  department={deptName}
                  count={deptEmployees.length}
                  employees={deptEmployees}
                  onClick={() => setSelectedDepartment(deptName)}
                />
              ))
            ) : (
              <div className="col-12 text-center py-5 text-muted">
                <h4>No departments found</h4>
                <p>Add employees to see departments here.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Department Modal (Pop Table) */}
      <DepartmentModal
        show={!!selectedDepartment}
        department={selectedDepartment}
        employees={selectedDepartmentEmployees}
        onClose={() => setSelectedDepartment(null)}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Add / Edit modal */}
      <AddEmployee
        show={showAddModal}
        mode={editTarget ? "edit" : "add"}
        initialData={editTarget}
        onSave={handleAdd}
        onClose={() => { setShowAddModal(false); setEditTarget(null); }}
      />

      {/* View modal */}
      <EmployeeDetails show={!!viewTarget} employee={viewTarget} onClose={() => setViewTarget(null)} />
    </div>
  );
}
