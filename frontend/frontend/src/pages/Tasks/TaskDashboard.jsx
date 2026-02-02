import React, { useMemo, useState, useEffect } from "react";
import { FiPlus, FiSearch, FiBell, FiFilter, FiEdit, FiTrash2, FiPaperclip } from "react-icons/fi";
import { FaRegClock } from "react-icons/fa";
import taskService from "../../services/taskService";
import employeeService from "../../services/employeeService";
import { useAuth } from "../../context/AuthContext";
import { DEPARTMENTS } from "../../constants/departments";

/**
 * Task Dashboard — Refined Clean Look with Equal Height Cards
 */

const lightUI = {
  primary: "#663399",     // Royal Amethyst
  secondary: "#A3779D",   // Royal Amethyst Light
  success: "#059669",     // Formal Green
  danger: "#DC2626",      // Formal Red
  warning: "#D97706",     // Professional Amber
  background: "#fdfbff", // Ivory/White background
  cardBg: "#ffffff",
  text: "#2E1A47",       // Royal Amethyst Dark
  textSoft: "#A3779D",
  border: "#E6C7E6",     // Lilac border
  shadow: "0 15px 35px -5px rgba(102, 51, 153, 0.12)",
};

// -----------------------------------------------------------------------
// 💡 CONSTANTS
// -----------------------------------------------------------------------

const categories = ["Bug", "Feature", "Daily Task", "Meeting", "Support", "Other"];
const priorities = ["Low", "Medium", "High", "Urgent"];
const statuses = ["To Do", "In Progress", "Completed", "Cancelled"]; // Matches backend enum
const allDepartments = DEPARTMENTS;

// -----------------------------------------------------------------------
// 🛠️ UTILITY FUNCTIONS
// -----------------------------------------------------------------------

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function daysBetween(aIso, bIso) {
  if (!aIso || !bIso) return 0;
  const a = new Date(aIso);
  const b = new Date(bIso);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

// -----------------------------------------------------------------------
// ⚛️ TASK DASHBOARD COMPONENT
// -----------------------------------------------------------------------

export default function TaskDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [query, setQuery] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksData, employeesData] = await Promise.all([
        taskService.getAllTasks(),
        employeeService.getAllEmployees()
      ]);
      setTasks(tasksData.tasks || []);
      setEmployees(employeesData.employees || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // derived KPI counts
  const counts = useMemo(() => {
    const today = todayISO();
    let todayCount = 0, upcoming = 0, overdue = 0;
    tasks.forEach(t => {
      const dueDate = t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : null;
      if (dueDate === today) todayCount++;
      else if (daysBetween(today, dueDate) > 0) upcoming++;
      else if (daysBetween(today, dueDate) < 0 && t.status !== "Completed") overdue++;
    });
    return { today: todayCount, upcoming, overdue };
  }, [tasks]);

  // filtered list
  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (employeeFilter !== "all" && t.assignedTo?._id !== employeeFilter && t.assignedTo !== employeeFilter) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;

      // Department filter logic
      if (departmentFilter !== "all") {
        const assignedEmpId = t.assignedTo?._id || t.assignedTo;
        const assignedEmp = employees.find(e => e._id === assignedEmpId);
        if (!assignedEmp || assignedEmp.department !== departmentFilter) return false;
      }

      if (!query.trim()) return true;
      const s = query.toLowerCase();
      return (t.taskName || "").toLowerCase().includes(s) ||
        (t.description || "").toLowerCase().includes(s);
    }).sort((a, b) => {
      // urgent first, then by due date
      const p = { "Urgent": 0, "High": 1, "Medium": 2, "Low": 3 };
      if (p[a.priority] !== p[b.priority]) return p[a.priority] - p[b.priority];
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }, [tasks, employeeFilter, statusFilter, priorityFilter, departmentFilter, query, employees]);

  // functions
  const openAdd = () => { setEditing(null); setShowModal(true); };
  const openEdit = (t) => { setEditing(t); setShowModal(true); };

  const saveTask = async (payload) => {
    try {
      // Format payload for backend
      const taskData = {
        taskName: payload.title,
        description: payload.description,
        assignedTo: payload.assignedTo,
        assignedBy: user?.id || user?._id, // Current user
        dueDate: payload.dueDate,
        priority: payload.priority,
        status: payload.status,
        estimatedHours: payload.estHours,
        actualHours: payload.actualHours,
        // Add other fields if backend supports them
      };

      if (payload.id) {
        await taskService.updateTask(payload.id, taskData);
      } else {
        await taskService.createTask(taskData);
      }
      fetchData(); // Refresh data
      setShowModal(false);
      setEditing(null);
    } catch (error) {
      console.error("Failed to save task:", error);
      alert("Failed to save task");
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await taskService.deleteTask(id);
      fetchData();
      setShowModal(false); // Close modal if open
      setEditing(null);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  // UI Helper Functions
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return lightUI.danger;
      case 'High': return "#663399";
      case 'Medium': return "#A3779D";
      default: return "#64748b";
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return lightUI.success;
      case 'In Progress': return lightUI.primary;
      case 'Cancelled': return "#64748b";
      default: return lightUI.secondary;
    }
  }

  const getPriorityBg = (priority) => {
    switch (priority) {
      case 'Urgent': return lightUI.danger + '10';
      case 'High': return lightUI.primary + '10';
      case 'Medium': return lightUI.secondary + '10';
      default: return '#f1f5f9';
    }
  }

  // Helper to get employee name from ID or object
  const getEmployeeName = (empIdOrObj) => {
    if (!empIdOrObj) return "—";
    if (typeof empIdOrObj === 'object') return `${empIdOrObj.firstName} ${empIdOrObj.lastName}`;
    const emp = employees.find(e => e._id === empIdOrObj);
    return emp ? `${emp.firstName} ${emp.lastName}` : "—";
  };

  return (
    <div style={{
      minHeight: "100vh",
      padding: 24,
      background: lightUI.background,
      color: lightUI.text,
      WebkitFontSmoothing: "antialiased"
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        marginBottom: 32,
      }}>
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <div style={{ width: 4, height: 24, backgroundColor: '#663399', borderRadius: 4 }}></div>
            <h2 style={{ margin: 0, fontWeight: 800, color: '#2E1A47', letterSpacing: '-0.5px' }}>Task Orchestration</h2>
          </div>
          <div style={{ color: lightUI.textSoft, fontSize: 13, fontWeight: 500 }}>Global mission directive management and employee assignment</div>
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {/* Search Input */}
          <div style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            background: "#ffffff",
            borderRadius: "14px",
            padding: "10px 16px",
            border: `1px solid ${lightUI.border}`,
            boxShadow: "0 4px 20px -5px rgba(102, 51, 153, 0.1)"
          }}>
            <FiSearch style={{ color: '#663399' }} />
            <input
              placeholder="Query task directives..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ background: "transparent", border: "none", outline: "none", color: '#2E1A47', minWidth: 260, fontWeight: 500 }}
            />
          </div>

          <button
            className="btn"
            onClick={openAdd}
            style={{
              background: '#663399',
              color: "#ffffff",
              padding: "12px 24px",
              borderRadius: "14px",
              display: "flex",
              gap: 10,
              alignItems: "center",
              fontWeight: 700,
              boxShadow: "0 10px 25px -5px rgba(102, 51, 153, 0.4)",
              border: "none"
            }}
          >
            <FiPlus size={20} /> Deploy Directive
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-md-4">
          <div style={{
            background: "#ffffff",
            border: `1px solid ${lightUI.border}`,
            padding: 24,
            borderRadius: 24,
            display: "flex",
            alignItems: "center",
            gap: 16,
            boxShadow: lightUI.shadow
          }}>
            <div style={{ fontSize: 24, color: '#663399', background: '#E6C7E6', padding: 12, borderRadius: 16 }}><FaRegClock /></div>
            <div>
              <div style={{ color: '#A3779D', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Active Priority</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#2E1A47' }}>{counts.today}</div>
            </div>
            <div style={{ marginLeft: "auto", color: '#A3779D', fontSize: 12, fontWeight: 600 }}>Due Today</div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div style={{
            background: "#ffffff",
            border: `1px solid ${lightUI.border}`,
            padding: 24,
            borderRadius: 24,
            display: "flex",
            alignItems: "center",
            gap: 16,
            boxShadow: lightUI.shadow
          }}>
            <div style={{ fontSize: 24, color: '#059669', background: '#ecfdf5', padding: 12, borderRadius: 16 }}><FiBell /></div>
            <div>
              <div style={{ color: '#A3779D', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Pipeline</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#2E1A47' }}>{counts.upcoming}</div>
            </div>
            <div style={{ marginLeft: "auto", color: '#A3779D', fontSize: 12, fontWeight: 600 }}>Next Cycle</div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div style={{
            background: "#ffffff",
            border: `1px solid ${lightUI.border}`,
            padding: 24,
            borderRadius: 24,
            display: "flex",
            alignItems: "center",
            gap: 16,
            boxShadow: lightUI.shadow
          }}>
            <div style={{ fontSize: 24, color: '#DC2626', background: '#fef2f2', padding: 12, borderRadius: 16 }}><FiBell /></div>
            <div>
              <div style={{ color: '#A3779D', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Stalled</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#DC2626' }}>{counts.overdue}</div>
            </div>
            <div style={{ marginLeft: "auto", color: '#A3779D', fontSize: 12, fontWeight: 600 }}>Breached</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: 32, background: '#ffffff', padding: '24px', borderRadius: '24px', border: '1px solid #E6C7E6', boxShadow: '0 4px 15px -5px rgba(102, 51, 153, 0.05)' }}>
        <div className="row g-3">
          <div className="col-12 col-md-4 col-lg-3">
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#663399', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Assignee Filter</label>
            <select
              className="form-select"
              style={{ background: '#f8fafc', color: '#2E1A47', border: `1px solid #E6C7E6`, borderRadius: '12px', padding: '10px 14px', fontWeight: 600 }}
              value={employeeFilter}
              onChange={e => setEmployeeFilter(e.target.value)}
            >
              <option value="all">All Personnel</option>
              {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName}</option>)}
            </select>
          </div>

          <div className="col-12 col-md-4 col-lg-3">
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#663399', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Division Unit</label>
            <select
              className="form-select"
              style={{ background: '#f8fafc', color: '#2E1A47', border: `1px solid #E6C7E6`, borderRadius: '12px', padding: '10px 14px', fontWeight: 600 }}
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
            >
              <option value="all">Global Divisions</option>
              {allDepartments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
          </div>

          <div className="col-12 col-md-4 col-lg-2">
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#663399', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Maturity Status</label>
            <select
              className="form-select"
              style={{ background: '#f8fafc', color: '#2E1A47', border: `1px solid #E6C7E6`, borderRadius: '12px', padding: '10px 14px', fontWeight: 600 }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Stages</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="col-12 col-md-4 col-lg-2">
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#663399', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Urgency Level</label>
            <select
              className="form-select"
              style={{ background: '#f8fafc', color: '#2E1A47', border: `1px solid #E6C7E6`, borderRadius: '12px', padding: '10px 14px', fontWeight: 600 }}
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Tiers</option>
              {priorities.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="col-12 col-lg-2 d-flex align-items-end">
            <button
              className="btn w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={() => { setEmployeeFilter("all"); setStatusFilter("all"); setPriorityFilter("all"); setDepartmentFilter("all"); setQuery(""); }}
              style={{ background: '#E6C7E6', color: '#663399', borderRadius: '12px', padding: '11px 20px', fontWeight: 700, border: 'none' }}
            >
              <FiFilter size={16} /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Task Grid */}
      <div className="row gy-4">
        {loading ? (
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-primary" style={{ color: '#663399' }} role="status"></div>
            <p className="mt-3 text-muted">Synchronizing Directives...</p>
          </div>
        ) : filtered.map(task => (
          <div key={task._id || task.id} className="col-12 col-md-6 col-lg-4 d-flex">
            <div
              style={{
                background: "#ffffff",
                border: `1px solid #E6C7E6`,
                padding: "24px",
                borderRadius: "24px",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 10px 30px -10px rgba(102, 51, 153, 0.08)",
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}
              className="task-card-premium"
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <span style={{
                    color: getPriorityColor(task.priority),
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "4px 10px",
                    borderRadius: "8px",
                    background: getPriorityBg(task.priority),
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>{task.priority} Tier</span>

                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>
                    <FiBell size={16} />
                  </div>
                </div>

                <h5 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#2E1A47', marginBottom: 12, lineHeight: '1.4' }}>{task.taskName}</h5>

                <p style={{ color: '#A3779D', fontSize: '0.9rem', marginBottom: 20, lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {task.description || "Mission briefing currently in encryption phase..."}
                </p>

                <div className="d-flex align-items-center gap-3 p-3 rounded-xl mb-3" style={{ backgroundColor: '#fdfbff', border: '1px solid #E6C7E6' }}>
                  <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" style={{ width: 40, height: 40, backgroundColor: '#663399', fontSize: '0.9rem' }}>
                    {getEmployeeName(task.assignedTo)?.[0]}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div className="small fw-bold text-truncate" style={{ color: '#2E1A47' }}>{getEmployeeName(task.assignedTo)}</div>
                    <div className="small opacity-75 fw-medium" style={{ color: '#A3779D' }}>Assigned Agent</div>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div className="d-flex align-items-center gap-2">
                    <FaRegClock size={14} style={{ color: '#663399' }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#2E1A47' }}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending'}</span>
                  </div>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: getStatusColor(task.status),
                    textTransform: 'uppercase',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: getStatusColor(task.status) + '10'
                  }}>
                    {task.status}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button className="btn flex-grow-1" onClick={() => openEdit(task)} style={{
                    background: '#663399',
                    color: '#ffffff',
                    borderRadius: '12px',
                    padding: "10px 12px",
                    fontWeight: 700,
                    border: 'none',
                    fontSize: '0.85rem'
                  }}>
                    Adjust Directive
                  </button>

                  <button className="btn" onClick={() => deleteTask(task._id || task.id)} style={{
                    background: '#fef2f2',
                    color: '#DC2626',
                    borderRadius: '12px',
                    padding: "10px 16px",
                    fontWeight: 700,
                    border: 'none'
                  }}>
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {!loading && filtered.length === 0 && (
          <div className="col-12">
            <div style={{
              padding: 60,
              borderRadius: 24,
              background: "#ffffff",
              color: '#A3779D',
              border: `1px solid #E6C7E6`,
              textAlign: 'center',
              boxShadow: lightUI.shadow
            }}>
              <FiBell size={40} className="mb-3 opacity-25" />
              <div className="h5 fw-bold" style={{ color: '#2E1A47' }}>No Active Directives</div>
              <p className="m-0">Modify parameters or deploy a new mission directive.</p>
            </div>
          </div>
        )}
      </div>

      {
        showModal && (
          <TaskModal
            employees={employees}
            categories={categories}
            priorities={priorities}
            statuses={statuses}
            editing={editing}
            onCancel={() => { setShowModal(false); setEditing(null); }}
            onSave={saveTask}
            onDelete={deleteTask}
            lightUI={lightUI}
            allDepartments={allDepartments}
          />
        )
      }

      <style>{`
        .task-card-premium:hover { transform: translateY(-8px); box-shadow: 0 20px 40px -10px rgba(102, 51, 153, 0.15); border-color: #663399 !important; }
        .rounded-xl { border-radius: 16px; }
        .form-select, .form-control { transition: all 0.2s ease; }
        .form-select:focus, .form-control:focus { border-color: #663399 !important; box-shadow: 0 0 0 4px rgba(102, 51, 153, 0.1) !important; background-color: #fff !important; }
      `}</style>
    </div >
  );
}

// -----------------------------------------------------------------------
// ⚛️ TASK MODAL COMPONENT
// -----------------------------------------------------------------------

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(46, 26, 71, 0.7)",
  backdropFilter: "blur(12px)",
  zIndex: 10000,
  display: "grid",
  placeItems: "center",
  padding: "20px",
  overflowY: "auto"
};

const modalContentStyle = {
  background: "#ffffff",
  borderRadius: "32px",
  boxShadow: "0 40px 100px -20px rgba(0, 0, 0, 0.4)",
  width: "95vw",
  maxWidth: "900px",
  maxHeight: "90vh",
  overflowY: "hidden",
  display: "flex",
  flexDirection: "column",
  border: "1px solid #E6C7E6",
  position: "relative",
  margin: "auto"
};

const headerStyle = {
  padding: "30px 40px",
  borderBottom: "1px solid #f1f5f9",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#ffffff"
};

const footerStyle = {
  padding: "24px 40px",
  borderTop: "1px solid #f1f5f9",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#fdfbff",
  borderRadius: "0 0 32px 32px"
};

function TaskModal({ employees = [], priorities = [], statuses = [], editing, onCancel, onSave, onDelete, lightUI }) {
  const [form, setForm] = useState(() => ({
    id: editing?._id || editing?.id || null,
    title: editing?.taskName || "",
    description: editing?.description || "",
    assignedTo: editing?.assignedTo?._id || editing?.assignedTo || "",
    department: editing?.department || "",
    startDate: editing?.startDate ? new Date(editing.startDate).toISOString().slice(0, 10) : todayISO(),
    dueDate: editing?.dueDate ? new Date(editing.dueDate).toISOString().slice(0, 10) : todayISO(),
    priority: editing?.priority || priorities[1] || "Medium",
    estHours: editing?.estimatedHours || 1,
    actualHours: editing?.actualHours || 0,
    status: editing?.status || statuses[0],
  }));

  useEffect(() => {
    setForm(prevForm => ({
      ...prevForm,
      id: editing?._id || editing?.id || null,
      title: editing?.taskName || "",
      description: editing?.description || "",
      assignedTo: editing?.assignedTo?._id || editing?.assignedTo || "",
      department: editing?.department || "",
      startDate: editing?.startDate ? new Date(editing.startDate).toISOString().slice(0, 10) : todayISO(),
      dueDate: editing?.dueDate ? new Date(editing.dueDate).toISOString().slice(0, 10) : todayISO(),
      priority: editing?.priority || priorities[1] || "Medium",
      estHours: editing?.estimatedHours || 1,
      actualHours: editing?.actualHours || 0,
      status: editing?.status || statuses[0],
    }));
  }, [editing, priorities, statuses]);

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!form.title.trim()) { alert("Please provide directive title"); return; }
    if (!form.assignedTo) { alert("Please assign a mission agent"); return; }
    onSave(form);
  };

  useEffect(() => {
    if (form.assignedTo) {
      const emp = employees.find(e => e._id === form.assignedTo);
      if (emp) setForm(f => ({ ...f, department: emp.department }));
    }
  }, [form.assignedTo, employees]);

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div style={headerStyle}>
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <div style={{ width: 4, height: 20, backgroundColor: '#663399', borderRadius: 4 }}></div>
              <h4 style={{ margin: 0, fontWeight: 800, color: "#2E1A47", letterSpacing: '-0.5px' }}>{form.id ? "Adjust Directive" : "Deploy Directive"}</h4>
            </div>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#A3779D", fontWeight: 500 }}>{form.id ? "Modify tactical parameters for this objective" : "Initiate a new strategic mission mandate"}</p>
          </div>
          <button onClick={onCancel} style={{ background: "#f1f5f9", border: "none", cursor: "pointer", width: 40, height: 40, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
            <FiSearch style={{ transform: 'rotate(45deg)' }} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "40px" }}>
          <form id="taskForm" onSubmit={handleSubmit} className="row g-4">
            <div className="col-12">
              <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#663399", marginBottom: "8px", display: "block", textTransform: 'uppercase', letterSpacing: '1px' }}>Directive Title</label>
              <input required className="form-control shadow-none" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ padding: "12px 16px", borderRadius: "14px", border: "1px solid #E6C7E6", background: '#f8fafc', fontWeight: 600, color: '#2E1A47' }} placeholder="Strategic Objective Name" />
            </div>

            <div className="col-12">
              <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#663399", marginBottom: "8px", display: "block", textTransform: 'uppercase', letterSpacing: '1px' }}>Mission Briefing</label>
              <textarea className="form-control shadow-none" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ padding: "12px 16px", borderRadius: "14px", border: "1px solid #E6C7E6", background: '#f8fafc', fontWeight: 500, color: '#2E1A47', resize: 'none' }} placeholder="Detailed tactical requirements..." />
            </div>

            <div className="col-md-6">
              <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#663399", marginBottom: "8px", display: "block", textTransform: 'uppercase', letterSpacing: '1px' }}>Mission Agent</label>
              <select className="form-select shadow-none" value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} style={{ padding: "12px 16px", borderRadius: "14px", border: "1px solid #E6C7E6", background: '#f8fafc', fontWeight: 600, color: '#2E1A47' }}>
                <option value="">Select Personnel</option>
                {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName}</option>)}
              </select>
            </div>

            <div className="col-md-6">
              <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#663399", marginBottom: "8px", display: "block", textTransform: 'uppercase', letterSpacing: '1px' }}>Operational Unit</label>
              <input className="form-control shadow-none" value={form.department || "System Determined"} readOnly style={{ padding: "12px 16px", borderRadius: "14px", border: "1px solid #E6C7E6", background: '#e2e8f0', fontWeight: 600, color: '#64748b' }} />
            </div>

            <div className="col-md-4">
              <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#663399", marginBottom: "8px", display: "block", textTransform: 'uppercase', letterSpacing: '1px' }}>Urgency Tier</label>
              <select className="form-select shadow-none" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={{ padding: "12px 16px", borderRadius: "14px", border: "1px solid #E6C7E6", background: '#f8fafc', fontWeight: 600, color: '#2E1A47' }}>
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="col-md-4">
              <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#663399", marginBottom: "8px", display: "block", textTransform: 'uppercase', letterSpacing: '1px' }}>Current Status</label>
              <select className="form-select shadow-none" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ padding: "12px 16px", borderRadius: "14px", border: "1px solid #E6C7E6", background: '#f8fafc', fontWeight: 600, color: '#2E1A47' }}>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="col-md-4">
              <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#663399", marginBottom: "8px", display: "block", textTransform: 'uppercase', letterSpacing: '1px' }}>Deadline</label>
              <input type="date" className="form-control shadow-none" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} style={{ padding: "12px 16px", borderRadius: "14px", border: "1px solid #E6C7E6", background: '#f8fafc', fontWeight: 600, color: '#2E1A47' }} />
            </div>
          </form>
        </div>

        <div style={footerStyle}>
          <div>
            {form.id && (
              <button type="button" onClick={() => onDelete(form.id)} className="btn px-4 py-2 d-flex align-items-center gap-2" style={{ color: "#dc2626", background: "#fef2f2", border: "none", fontWeight: 700, borderRadius: "14px" }}>
                <FiTrash2 /> Retire Directive
              </button>
            )}
          </div>
          <div className="d-flex gap-3">
            <button className="btn px-4 py-2" onClick={onCancel} style={{ fontWeight: 700, borderRadius: "14px", border: "1px solid #E6C7E6", background: "white", color: "#64748b" }}>Cancel</button>
            <button type="submit" form="taskForm" className="btn px-5 py-2" style={{ fontWeight: 700, borderRadius: "14px", background: "#663399", color: "white", border: "none", boxShadow: "0 10px 20px -5px rgba(102, 51, 153, 0.4)" }}>
              {form.id ? "Update Parameters" : "Launch Mission"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
