import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiCheckCircle, FiClock, FiXCircle, FiArrowRight
} from "react-icons/fi";
import {
  ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { getLeaveAnalytics } from "../../services/analyticsService";
import { leaveService } from "../../services/leaveService";

// --- THEME ---
const COLORS = {
  primary: "#2E1A47", // Midnight Plum
  secondary: "#A3779D", // Soft Violet
  accent: "#663399", // Royal Amethyst
  charts: ["#663399", "#A3779D", "#E6C7E6", "#2E1A47"]
};

// --- COMPONENTS ---

const MetricCard = ({ title, value, subtext, icon: Icon, colorBg, colorText, link }) => (
  <Link to={link} className="block group h-full">
    <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group-hover:-translate-y-1 h-full flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-xl shrink-0"
          style={{ backgroundColor: colorBg, color: colorText }}
        >
          <Icon />
        </div>
        <div>
          <h3 className="text-2xl font-bold leading-none mb-1" style={{ color: COLORS.primary }}>{value}</h3>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">{title}</p>
        </div>
      </div>

      <div className="bg-slate-50 p-2 rounded-lg group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
        <FiArrowRight size={16} className="text-slate-400 group-hover:text-purple-600" />
      </div>
    </div>
  </Link>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 h-full flex flex-col">
    <h4 className="font-bold mb-4 text-sm uppercase tracking-wide text-slate-500">{title}</h4>
    <div className="flex-grow min-h-[180px]">
      {children}
    </div>
  </div>
);

export default function LeaveDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [pendingByDept, setPendingByDept] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Analytics
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);

        // Fetch basic analytics
        const analyticsRes = await getLeaveAnalytics({
          startDate: start.toISOString(),
          endDate: end.toISOString()
        });

        // 2. Fetch Recent Leaves
        const leavesRes = await leaveService.getLeaves({ limit: 20 });

        if (analyticsRes.data?.data) {
          setStats(analyticsRes.data.data);
        }

        if (leavesRes.data?.leaves) {
          setRecentLeaves(leavesRes.data.leaves.slice(0, 5));

          // Fallback logic for charts/stats
          const allLeaves = leavesRes.data.leaves;
          const pendingMap = {};
          allLeaves.filter(l => l.status === 'Pending').forEach(l => {
            const dept = l.user?.department || l.department || "General";
            pendingMap[dept] = (pendingMap[dept] || 0) + 1;
          });

          const chartData = Object.keys(pendingMap).map(dept => ({
            name: dept,
            count: pendingMap[dept]
          }));

          setPendingByDept(chartData.length > 0 ? chartData : [{ name: 'No Pending', count: 0 }]);
        }

      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Derived Data
  let pendingCount = stats?.byStatus?.find(s => s._id === 'Pending')?.count || 0;
  let approvedCount = stats?.byStatus?.find(s => s._id === 'Approved')?.count || 0;
  let rejectedCount = stats?.byStatus?.find(s => s._id === 'Rejected')?.count || 0;

  // Fallback logic
  if (pendingCount === 0 && recentLeaves.length > 0) pendingCount = recentLeaves.filter(l => l.status === 'Pending').length;
  if (approvedCount === 0 && recentLeaves.length > 0) approvedCount = recentLeaves.filter(l => l.status === 'Approved').length;
  if (rejectedCount === 0 && recentLeaves.length > 0) rejectedCount = recentLeaves.filter(l => l.status === 'Rejected').length;

  const trendData = [
    { name: 'Mon', apps: 2 },
    { name: 'Tue', apps: 5 },
    { name: 'Wed', apps: 3 },
    { name: 'Thu', apps: 8 },
    { name: 'Fri', apps: 4 },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderBottomColor: COLORS.accent }}></div>
      </div>
    );
  }

  return (
    <div className="p-2 animate-in fade-in duration-500">
      {/* --- HEADER --- */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold" style={{ color: COLORS.primary }}>Leave Overview</h2>
          <p className="text-sm text-slate-500">Snapshot of leave activities</p>
        </div>
      </div>

      {/* --- METRIC CARDS (Compact Horizontal) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <MetricCard
          title="Pending"
          value={pendingCount}
          icon={FiClock}
          colorBg="#FEF3C7"
          colorText="#D97706" // Amber
          link="/leave/pending"
        />
        <MetricCard
          title="Approved"
          value={approvedCount}
          icon={FiCheckCircle}
          colorBg="#E6C7E6"
          colorText="#663399" // Purple
          link="/leave/approved"
        />
        <MetricCard
          title="Rejected"
          value={rejectedCount}
          icon={FiXCircle}
          colorBg="#FEE2E2"
          colorText="#DC2626" // Red
          link="/leave/rejected"
        />
      </div>

      {/* --- CHARTS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 h-64">
        {/* PENDING BY DEPARTMENT */}
        <div className="lg:col-span-1 h-full">
          <ChartCard title="Pending Queue">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pendingByDept} layout="vertical" margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 10, fill: "#64748b" }} />
                <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="count" fill={COLORS.secondary} radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* WEEKLY TREND */}
        <div className="lg:col-span-2 h-full">
          <ChartCard title="Weekly Trend">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="apps" fill={COLORS.accent} radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* --- RECENT ACTIVITY --- */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex justify-between items-center">
          <h4 className="font-bold text-sm uppercase tracking-wide text-slate-500">Recent Applications</h4>
          <Link to="/leave/pending" className="text-xs font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1">
            View All <FiArrowRight />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Dates</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLeaves.length > 0 ? (
                recentLeaves.map(leave => (
                  <tr key={leave._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-900">
                      {leave.user?.name || leave.employeeName || "Unknown"}
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-medium uppercase">
                        {leave.leaveType}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-500 text-xs">
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border
                                                    ${leave.status === 'Approved' ? 'bg-green-50 text-green-600 border-green-100' :
                            leave.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                              'bg-amber-50 text-amber-600 border-amber-100'}`}
                      >
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-400">
                    No recent leave activity found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
