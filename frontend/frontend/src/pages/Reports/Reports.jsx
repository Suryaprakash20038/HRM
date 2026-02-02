
import React, { useState, useEffect, useMemo } from "react";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import {
  FiActivity, FiCheckCircle, FiClock, FiLayers, FiAlertCircle, FiSearch, FiX,
  FiUsers, FiChevronRight, FiCode, FiCpu, FiTrendingUp, FiPieChart, FiPenTool, FiBriefcase,
  FiSettings, FiHeadphones, FiDollarSign, FiDatabase, FiLayout, FiFileText, FiGlobe
} from "react-icons/fi";
import { FaProjectDiagram } from "react-icons/fa";
import dailyReportService from "../../services/dailyReportService";
import { toast } from "react-hot-toast";
import '../../css/Employee.css';

// Register ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

const lightUI = {
  primary: "#663399",     // Royal Amethyst
  secondary: "#A3779D",   // Royal Amethyst Light
  success: "#059669",     // Formal Green
  danger: "#DC2626",      // Formal Red
  warning: "#D97706",     // Professional Amber
  background: "#fdfbff", // Ivory/White
  cardBg: "#ffffff",
  text: "#2E1A47",       // Royal Amethyst Dark
  textSoft: "#A3779D",
  border: "#E6C7E6",     // Lilac border
  shadow: "0 15px 35px -5px rgba(102, 51, 153, 0.12)",
};

// --- Report Department Card ---
const ReportDepartmentCard = ({ department, count, employees, onClick }) => {
  const previewEmployees = useMemo(() => {
    const unique = [];
    const seen = new Set();
    employees.forEach(e => {
      if (e && e._id && !seen.has(e._id)) {
        seen.add(e._id);
        unique.push(e);
      }
    });
    return unique.slice(0, 3);
  }, [employees]);

  const { icon: Icon, color } = useMemo(() => {
    const dept = (department || '').toLowerCase();
    if (dept.includes('it') || dept.includes('tech')) return { icon: FiCode, color: '#663399' };
    if (dept.includes('hr') || dept.includes('human')) return { icon: FiUsers, color: '#A3779D' };
    if (dept.includes('sales')) return { icon: FiTrendingUp, color: '#059669' };
    if (dept.includes('finance')) return { icon: FiPieChart, color: '#D97706' };
    return { icon: FiLayout, color: '#663399' };
  }, [department]);

  return (
    <div className="col-12 col-md-6 col-lg-4 col-xl-3 mb-4">
      <div className="card h-100 border-0"
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          border: `1px solid ${lightUI.border}`,
          boxShadow: lightUI.shadow,
          cursor: 'pointer',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          overflow: 'hidden'
        }}
        onClick={onClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-12px)';
          e.currentTarget.style.borderColor = lightUI.primary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = lightUI.border;
        }}
      >
        <div className="card-body p-4 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div className="p-3 d-flex align-items-center justify-content-center"
              style={{ background: `${lightUI.primary}10`, borderRadius: '18px', color: lightUI.primary, border: `1px solid ${lightUI.primary}20`, width: '56px', height: '56px' }}>
              <Icon size={28} />
            </div>
            <div className="badge rounded-pill px-3 py-2 d-flex align-items-center gap-1"
              style={{ background: `${lightUI.primary}05`, border: `1px solid ${lightUI.border}`, color: lightUI.text, fontWeight: 700, fontSize: '11px' }}>
              {count} INTEL LOGS
            </div>
          </div>
          <div className="mb-4">
            <h4 className="card-title fw-800 mb-1" style={{ color: lightUI.text, fontSize: '1.25rem', letterSpacing: '-0.5px' }}>{department}</h4>
            <p className="small mb-0" style={{ color: lightUI.textSoft, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '10px' }}>Tactical Division</p>
          </div>
          <div className="d-flex align-items-center justify-content-between mt-auto pt-3 border-top" style={{ borderColor: lightUI.border }}>
            <div className="d-flex ps-2">
              {previewEmployees.map((emp, index) => (
                <div key={emp._id} className="position-relative" style={{ marginLeft: index > 0 ? '-12px' : '0', zIndex: 3 - index }}>
                  <img
                    src={emp.profileImage ? (emp.profileImage.startsWith('http') ? emp.profileImage : `http://localhost:5000/${emp.profileImage}`) : `https://ui-avatars.com/api/?name=${emp.firstName}&background=E6C7E6&color=663399`}
                    alt={emp.firstName}
                    className="rounded-circle border border-2 border-white shadow-sm"
                    style={{ width: '34px', height: '34px', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
            <div className="btn btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
              style={{ background: lightUI.primary, color: 'white', width: '32px', height: '32px' }}>
              <FiChevronRight size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportModal = ({ show, title, reports, onClose }) => {
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(46, 26, 71, 0.7)', backdropFilter: 'blur(12px)', zIndex: 100000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>

      <div style={{
        width: '95vw', maxWidth: '1400px', height: '85vh',
        background: '#ffffff', borderRadius: '32px', boxShadow: '0 50px 100px -20px rgba(46, 26, 71, 0.4)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', border: `1px solid ${lightUI.border}`
      }}>

        {/* Header */}
        <div style={{
          padding: '32px 48px', background: '#ffffff',
          borderBottom: `1px solid ${lightUI.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div className="d-flex align-items-center gap-4">
            <div style={{
              width: '64px', height: '64px', borderRadius: '20px',
              background: `${lightUI.primary}10`, color: lightUI.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px'
            }}>
              <FiFileText />
            </div>
            <div>
              <h2 className="mb-1 fw-800" style={{ color: lightUI.text, fontSize: '1.75rem', letterSpacing: '-0.5px' }}>{title} Intelligence Logs</h2>
              <div className="d-flex align-items-center gap-3">
                <span className="badge px-3 py-1 rounded-pill" style={{ background: lightUI.border, color: lightUI.primary, fontWeight: 700 }}>
                  {reports.length} SUBMISSIONS
                </span>
                <span className="small fw-600" style={{ color: lightUI.textSoft }}>Authorized tactical progression reports</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn-close shadow-none" style={{ fontSize: '1.2rem' }}></button>
        </div>

        {/* Table Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0', background: '#fdfbff' }}>
          <div className="table-responsive p-4">
            <table className="table align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 12px' }}>
              <thead>
                <tr>
                  <th className="ps-4 border-0 text-uppercase small fw-800" style={{ color: lightUI.primary, letterSpacing: '1px' }}>Timestamp</th>
                  <th className="border-0 text-uppercase small fw-800" style={{ color: lightUI.primary, letterSpacing: '1px' }}>Personnel</th>
                  <th className="border-0 text-uppercase small fw-800" style={{ color: lightUI.primary, letterSpacing: '1px' }}>Timing</th>
                  <th className="border-0 text-uppercase small fw-800" style={{ color: lightUI.primary, letterSpacing: '1px' }}>Mission Objective</th>
                  <th className="border-0 text-uppercase small fw-800" style={{ color: lightUI.primary, letterSpacing: '1px' }}>Maturity</th>
                  <th className="border-0 text-uppercase small fw-800" style={{ color: lightUI.primary, letterSpacing: '1px' }}>Effort</th>
                  <th className="text-center border-0 text-uppercase small fw-800 pe-4" style={{ color: lightUI.primary, letterSpacing: '1px' }}>Assets</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report._id} style={{ background: '#ffffff', boxShadow: '0 4px 15px -5px rgba(102, 51, 153, 0.05)', borderRadius: '16px' }}>
                    <td className="ps-4 py-4 fw-bold" style={{ color: lightUI.text, borderRadius: '16px 0 0 16px', border: `1px solid ${lightUI.border}`, borderRight: 'none' }}>
                      {new Date(report.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-4" style={{ borderTop: `1px solid ${lightUI.border}`, borderBottom: `1px solid ${lightUI.border}` }}>
                      <div className="d-flex align-items-center gap-3">
                        <img src={report.employee?.profileImage ? (report.employee.profileImage.startsWith('http') ? report.employee.profileImage : `http://localhost:5000/${report.employee.profileImage}`) : `https://ui-avatars.com/api/?name=${report.employee?.firstName}&background=E6C7E6&color=663399`}
                          alt="" className="rounded-circle border" width="36" height="36" style={{ objectFit: 'cover' }} />
                        <div>
                          <div className="fw-bold" style={{ color: lightUI.text }}>{report.employee?.firstName} {report.employee?.lastName}</div>
                          <div className="small fw-600" style={{ color: lightUI.textSoft }}>{report.employee?.position}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4" style={{ borderTop: `1px solid ${lightUI.border}`, borderBottom: `1px solid ${lightUI.border}` }}>
                      <span className="badge rounded-pill px-3 py-1 fw-700" style={{ background: `${lightUI.border}40`, color: lightUI.primary }}>
                        {report.submissionTiming || 'FULL CYCLE'}
                      </span>
                    </td>
                    <td className="py-4 fw-bold" style={{ color: lightUI.text, borderTop: `1px solid ${lightUI.border}`, borderBottom: `1px solid ${lightUI.border}` }}>{report.title}</td>
                    <td className="py-4" style={{ borderTop: `1px solid ${lightUI.border}`, borderBottom: `1px solid ${lightUI.border}` }}>
                      <span className={`badge rounded-pill px-3 py-2 fw-bold`} style={{
                        background: report.status === 'Completed' ? '#dcfce7' : report.status === 'In Progress' ? '#e0f2fe' : '#f1f5f9',
                        color: report.status === 'Completed' ? '#059669' : report.status === 'In Progress' ? '#0284c7' : '#64748b'
                      }}>
                        {report.status}
                      </span>
                    </td>
                    <td className="py-4 fw-800" style={{ color: lightUI.text, borderTop: `1px solid ${lightUI.border}`, borderBottom: `1px solid ${lightUI.border}` }}>{report.actualHours}H</td>
                    <td className="py-4 text-center pe-4" style={{ borderRadius: '0 16px 16px 0', border: `1px solid ${lightUI.border}`, borderLeft: 'none' }}>
                      {report.uploadUrl && (
                        <a href={`http://localhost:5000/${report.uploadUrl.replace(/\\/g, '/')}`} target="_blank" rel="noreferrer" className="btn btn-sm px-3 rounded-pill fw-bold" style={{ background: lightUI.primary, color: 'white' }}>
                          INTEL
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---
export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await dailyReportService.getAllReports();
      setReports(data);
    } catch (error) {
      toast.error("Network interface error");
    } finally {
      setLoading(false);
    }
  };

  const kpis = useMemo(() => {
    const total = reports.length;
    const completed = reports.filter(r => r.status === 'Completed').length;
    const inProgress = reports.filter(r => r.status === 'In Progress').length;
    const hours = reports.reduce((acc, curr) => acc + (curr.actualHours || 0), 0);
    return { total, completed, inProgress, hours: hours.toFixed(1) };
  }, [reports]);

  const departmentGroups = useMemo(() => {
    const groups = {};
    reports.forEach(r => {
      const dept = r.employee?.department || 'Operational Unity';
      if (!groups[dept]) groups[dept] = [];
      groups[dept].push(r);
    });
    return groups;
  }, [reports]);

  return (
    <div className="container-fluid" style={{ padding: '32px', minHeight: '100vh', background: lightUI.background }}>

      {/* Header */}
      <div className="mb-5 d-flex justify-content-between align-items-center">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <div style={{ width: 4, height: 24, backgroundColor: lightUI.primary, borderRadius: 4 }}></div>
            <h2 style={{ margin: 0, fontWeight: 800, color: lightUI.text, letterSpacing: '-0.5px' }}>Mission Analysis Hub</h2>
          </div>
          <div style={{ color: lightUI.textSoft, fontSize: 13, fontWeight: 600 }}>Real-time tactical intelligence and operational performance metrics</div>
        </div>
        <button
          className="btn"
          onClick={fetchReports}
          style={{ background: lightUI.primary, color: 'white', borderRadius: '12px', padding: '10px 24px', fontWeight: 700, boxShadow: '0 10px 20px -5px rgba(102, 51, 153, 0.3)' }}
        >
          Synchronize Data
        </button>
      </div>

      {/* KPIs */}
      <div className="row g-4 mb-5">
        {[
          { label: 'Total Logs', value: kpis.total, icon: FiLayers, color: lightUI.primary, bg: `${lightUI.primary}10` },
          { label: 'Objectives Secured', value: kpis.completed, icon: FiCheckCircle, color: lightUI.success, bg: '#ecfdf5' },
          { label: 'Active Missions', value: kpis.inProgress, icon: FiActivity, color: lightUI.textSoft, bg: `${lightUI.primary}05` },
          { label: 'Validated Hours', value: kpis.hours, icon: FiClock, color: lightUI.warning, bg: '#fffbeb' },
        ].map((kpi, i) => (
          <div key={i} className="col-6 col-md-3">
            <div style={{ background: '#ffffff', borderRadius: '24px', padding: '24px', border: `1px solid ${lightUI.border}`, boxShadow: lightUI.shadow, display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: 54, height: 54, borderRadius: '16px', background: kpi.bg, color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                <kpi.icon />
              </div>
              <div>
                <div style={{ color: lightUI.textSoft, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{kpi.label}</div>
                <div style={{ color: lightUI.text, fontSize: '24px', fontWeight: 800 }}>{kpi.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Projects Grid Section */}
      <h5 className="fw-800 mb-4" style={{ color: lightUI.text, letterSpacing: '-0.2px' }}>Operational Intelligence by Division</h5>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: lightUI.primary }}></div>
          <p className="mt-3 fw-600" style={{ color: lightUI.textSoft }}>Acquiring global intelligence...</p>
        </div>
      ) : (
        <div className="row">
          {Object.keys(departmentGroups).length > 0 ? (
            Object.entries(departmentGroups).map(([dept, groupReports]) => (
              <ReportDepartmentCard
                key={dept}
                department={dept}
                count={groupReports.length}
                employees={groupReports.map(r => r.employee).filter(Boolean)}
                onClick={() => setSelectedDepartment(dept)}
              />
            ))
          ) : (
            <div className="text-center py-5">
              <FiAlertCircle size={48} style={{ color: lightUI.border, marginBottom: '16px' }} />
              <h4 style={{ color: lightUI.textSoft }}>No tactical data found</h4>
            </div>
          )}
        </div>
      )}

      <ReportModal
        show={!!selectedDepartment}
        title={selectedDepartment}
        reports={selectedDepartment ? departmentGroups[selectedDepartment] : []}
        onClose={() => setSelectedDepartment(null)}
      />

    </div>
  );
}
