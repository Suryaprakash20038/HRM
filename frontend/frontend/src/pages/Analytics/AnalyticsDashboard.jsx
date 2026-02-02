
import React, { useState, useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, Line, AreaChart, Area
} from "recharts";
import {
    getWorkforceInsights,
    getAttendanceAnalytics,
    getLeaveAnalytics,
    getPerformanceAnalytics,
    getPayrollAnalytics,
    getTicketsAnalytics,
    getRecruitmentAnalytics,
    getAttritionAnalytics
} from "../../services/analyticsService";
import { FiUsers, FiClock, FiCalendar, FiActivity, FiDownload, FiChevronDown, FiHelpCircle } from "react-icons/fi";
import { toast } from "react-toastify";

// --- THEME & COLORS ---
const COLORS = {
    primary: "#2E1A47", // Midnight Plum
    secondary: "#A3779D", // Soft Violet
    accent: "#663399", // Royal Amethyst
    success: "#663399", // Amethyst (Replacement for Green)
    warning: "#A3779D", // Soft Violet (Replacement for Amber)
    danger: "#2E1A47", // Midnight Plum (Replacement for Red)
    charts: [
        "#663399", // Royal Amethyst
        "#A3779D", // Soft Violet
        "#2E1A47", // Midnight Plum
        "#E6C7E6", // Lilac Mist
    ]
};

// --- REUSABLE UI COMPONENTS ---

const SectionHeader = ({ title, subtitle, action }) => (
    <div className="flex justify-between items-end mb-6">
        <div>
            <h2 className="text-2xl font-bold" style={{ color: COLORS.primary }}>{title}</h2>
            <p className="mt-1" style={{ color: COLORS.secondary }}>{subtitle}</p>
        </div>
        {action && <div>{action}</div>}
    </div>
);

const MetricCard = ({ title, value, trend, trendLabel, icon: Icon, color }) => {
    // Map legacy colors to strict Purple Palette
    // We'll treat all cards uniformly or alternate slightly based on the 'color' prop hint if needed.
    // User requested "Use this 4 color only". Uniformity is key.

    // Design: White Card, Lilac Icon BG, Amethyst Icon, Plum Text.
    const iconBg = "#E6C7E6"; // LILAC MIST
    const iconColor = "#663399"; // ROYAL AMETHYST
    const valueColor = "#2E1A47"; // MIDNIGHT PLUM
    const titleColor = "#A3779D"; // SOFT VIOLET

    return (
        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium mb-1" style={{ color: titleColor }}>{title}</p>
                    <h3 className="text-3xl font-bold" style={{ color: valueColor }}>{value}</h3>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: iconBg, color: iconColor }}>
                    <Icon size={24} />
                </div>
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    <span className="font-semibold" style={{ color: COLORS.accent }}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                    <span className="ml-2" style={{ color: "#A3779D" }}>{trendLabel}</span>
                </div>
            )}
        </div>
    );
};

const InsightAlert = ({ message, type = "info" }) => {
    // Style override for strict palette
    const bg = "#E6C7E6"; // Lilac Mist
    const border = "#A3779D"; // Soft Violet
    const text = "#2E1A47"; // Midnight Plum
    const iconColor = "#663399"; // Royal Amethyst

    return (
        <div className="p-4 rounded-lg mb-6 flex items-start gap-3" style={{ backgroundColor: bg, borderColor: border, borderWidth: '1px', color: text }}>
            <div className="mt-0.5" style={{ color: iconColor }}><FiHelpCircle /></div>
            <p className="text-sm font-medium">{message}</p>
        </div>
    );
};

const ChartCard = ({ title, children, action }) => (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col h-[300px]">
        <div className="flex justify-between items-center mb-6">
            <h4 className="font-semibold text-slate-800">{title}</h4>
            {action}
        </div>
        <div className="flex-grow w-full h-full min-h-0">
            {children}
        </div>
    </div>
);

// --- MAIN ANALYTICS DASHBOARD ---

const AnalyticsDashboard = () => {
    const [activeTab, setActiveTab] = useState("workforce");
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState("30");

    // Data State
    const [data, setData] = useState({
        workforce: null,
        attendance: null,
        leave: null,
        performance: null,
        payroll: null,
        tickets: null,
        recruitment: null,
        attrition: null
    });

    // Fetch Data Logic
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const end = new Date();
                const start = new Date();
                start.setDate(end.getDate() - parseInt(dateRange));
                const params = { startDate: start.toISOString(), endDate: end.toISOString() };

                let res;
                if (activeTab === "workforce") res = await getWorkforceInsights(params);
                else if (activeTab === "attendance") res = await getAttendanceAnalytics(params);
                else if (activeTab === "leave") res = await getLeaveAnalytics(params);
                else if (activeTab === "performance") res = await getPerformanceAnalytics(params);
                else if (activeTab === "payroll") res = await getPayrollAnalytics(params);
                else if (activeTab === "tickets") res = await getTicketsAnalytics(params);
                else if (activeTab === "recruitment") res = await getRecruitmentAnalytics(params);
                else if (activeTab === "attrition") res = await getAttritionAnalytics(params);

                if (res?.data?.data) {
                    setData(prev => ({ ...prev, [activeTab]: res.data.data }));
                }
            } catch (error) {
                console.error("Analytics fetch error:", error);
                toast.error("Could not load data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeTab, dateRange]);

    // --- SUB-VIEWS ---

    const renderWorkforce = () => {
        const stats = data.workforce || {};
        const headcount = stats.headcount || { total: 0, active: 0 };
        const distribution = stats.distribution || { byDepartment: [], byRole: [] };

        // Process data for charts
        const deptData = distribution.byDepartment?.map((d, i) => ({ ...d, fill: COLORS.charts[i % COLORS.charts.length] })) || [];

        return (
            <div className="animate-in fade-in duration-500">
                <InsightAlert
                    message={`You have ${headcount.total} total employees. The Engineering department is currently the largest, making up ${(deptData[0]?.count / headcount.total * 100 || 0).toFixed(0)}% of your workforce.`}
                />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        title="Total Headcount"
                        value={headcount.total}
                        trendLabel="vs last month"
                        icon={FiUsers}
                        color="blue"
                    />
                    <MetricCard
                        title="Active Employees"
                        value={headcount.active}
                        trendLabel="Currently active"
                        icon={FiActivity}
                        color="emerald"
                    />
                    <MetricCard
                        title="New Joinees"
                        value={stats.turnover?.newHires || 0}
                        trendLabel="Growth rate"
                        icon={FiUsers}
                        color="violet"
                    />
                    <MetricCard
                        title="Avg Tenure"
                        value={`${Math.round(stats.avgTenureDays || 0)} Days`}
                        trendLabel="Retention metric"
                        icon={FiClock}
                        color="amber"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="Department Distribution">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptData} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="_id" type="category" width={100} tick={{ fontSize: 12, fill: "#64748b" }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                                    {deptData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Employment Status">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distribution.byStatus || []}
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="_id"
                                >
                                    {(distribution.byStatus || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS.charts[index % COLORS.charts.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>
        );
    };

    const renderAttendance = () => {
        const stats = data.attendance || {};
        const summary = stats.summary || {};
        const trends = stats.trends || [];

        return (
            <div className="animate-in fade-in duration-500">
                <InsightAlert
                    type="warning"
                    message="Late arrivals have increased by 15% this week. Consider reviewing the shift timings for the Support team."
                />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        title="Avg Work Hours"
                        value={(summary.avgHours || 0).toFixed(1)}
                        trendLabel="vs target (8h)"
                        icon={FiClock}
                        color="blue"
                    />
                    <MetricCard
                        title="Late Arrivals"
                        value={summary.totalLateLogins || 0}
                        trendLabel="Spike detected"
                        icon={FiActivity}
                        color="amber"
                    />
                    <MetricCard
                        title="Total Overtime"
                        value={`${summary.totalOvertime || 0} hrs`}
                        trendLabel="This period"
                        icon={FiClock}
                        color="emerald"
                    />
                    <MetricCard
                        title="Absent Days"
                        value={summary.totalAbsent || 0}
                        trendLabel="Unscheduled"
                        icon={FiCalendar}
                        color="rose"
                    />
                </div>

                <div className="mb-6">
                    <ChartCard title="Attendance & Work Hours Trend">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.1} />
                                        <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="_id"
                                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    stroke="#94a3b8"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    labelFormatter={(val) => new Date(val).toLocaleDateString()}
                                />
                                <Legend verticalAlign="top" height={36} />
                                <Area
                                    type="monotone"
                                    dataKey="avgWorkingHours"
                                    stroke={COLORS.accent}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorHours)"
                                    name="Avg Hours"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="presentCount"
                                    stroke={COLORS.success}
                                    strokeWidth={2}
                                    dot={false}
                                    name="Present Staff"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>
        );
    };

    const renderLeaves = () => {
        const stats = data.leave || {};
        const byType = stats.byType || [];
        const topLeavers = stats.topLeavers || [];

        return (
            <div className="animate-in fade-in duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* LEAVE TYPE DISTRIBUTION */}
                    <div className="lg:col-span-2">
                        <ChartCard title="Leave Distribution by Type">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={byType} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="_id" type="category" width={120} tick={{ fontSize: 13, fontWeight: 500, fill: "#334155" }} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24} fill={COLORS.accent}>
                                        {byType.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS.charts[index % COLORS.charts.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>

                    {/* TOP LEAVERS LIST */}
                    <div>
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden h-full">
                            <div className="p-6 border-b border-slate-50">
                                <h4 className="font-semibold text-slate-800">Frequent Leavers</h4>
                            </div>
                            <div className="p-0">
                                {topLeavers.length > 0 ? (
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                            <tr>
                                                <th className="px-6 py-3">Employee</th>
                                                <th className="px-6 py-3 text-right">Days</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topLeavers.slice(0, 6).map((l, i) => (
                                                <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                                                    <td className="px-6 py-4 font-medium text-slate-900">{l.name}</td>
                                                    <td className="px-6 py-4 text-right text-slate-600">{l.totalDays}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-8 text-center text-slate-400">No leave data available</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderPerformance = () => {
        const stats = data.performance || {};
        const tasks = stats.tasksByStatus || [];
        const workload = stats.employeeWorkload || [];

        return (
            <div className="animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        title="Completed Tasks"
                        value={tasks.find(t => t._id === 'Completed')?.count || 0}
                        trendLabel="All time"
                        icon={FiActivity}
                        color="emerald"
                    />
                    <MetricCard
                        title="Pending Review"
                        value={tasks.find(t => t._id === 'In Progress')?.count || 0}
                        trendLabel="Active tasks"
                        icon={FiClock}
                        color="blue"
                    />
                    <MetricCard
                        title="Overdue"
                        value={stats.overdueTaskCount || 0}
                        trendLabel="Needs attention"
                        icon={FiActivity}
                        color="rose"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="Task Status Overview">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={tasks}
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="count"
                                    nameKey="_id"
                                >
                                    {tasks.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS.charts[index % COLORS.charts.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Employee Workload (Top 5)">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={workload} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 13, fill: "#64748b" }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="taskCount" radius={[0, 4, 4, 0]} barSize={24} fill={COLORS.accent} name="Active Tasks" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>
        );
    };

    const renderPayroll = () => {
        const stats = data.payroll || {};
        const trends = stats.trends || [];
        const ctcByDept = stats.ctcByDepartment || [];

        return (
            <div className="animate-in fade-in duration-500">
                <InsightAlert
                    message={`Total payroll cost this month: $${(stats.currentMonthCost || 0).toLocaleString()}. Engineering department accounts for the highest salary expenditure.`}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <MetricCard
                        title="Current Month Cost"
                        value={`$${(stats.currentMonthCost || 0).toLocaleString()}`}
                        trendLabel="Total payroll"
                        icon={FiActivity}
                        color="blue"
                    />
                    <MetricCard
                        title="Avg Monthly Cost"
                        value={`$${(trends.reduce((sum, t) => sum + t.totalNetPay, 0) / (trends.length || 1)).toLocaleString()}`}
                        trendLabel="Last 12 months"
                        icon={FiClock}
                        color="emerald"
                    />
                    <MetricCard
                        title="Departments"
                        value={ctcByDept.length}
                        trendLabel="Active departments"
                        icon={FiUsers}
                        color="violet"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="12-Month Payroll Trend">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPayroll" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.1} />
                                        <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="_id"
                                    stroke="#94a3b8"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    formatter={(value) => [`$${value.toLocaleString()}`, 'Net Pay']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="totalNetPay"
                                    stroke={COLORS.accent}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorPayroll)"
                                    name="Total Net Pay"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="CTC by Department">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ctcByDept} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="_id" type="category" width={100} tick={{ fontSize: 12, fill: "#64748b" }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    formatter={(value) => [`$${value.toLocaleString()}`, 'Total CTC']}
                                />
                                <Bar dataKey="totalCTC" radius={[0, 4, 4, 0]} barSize={24} fill={COLORS.accent} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>
        );
    };

    const renderTickets = () => {
        const stats = data.tickets || {};
        const statusDist = stats.statusDistribution || [];
        const byCategory = stats.byCategory || [];

        return (
            <div className="animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <MetricCard
                        title="Avg Resolution Time"
                        value={`${(stats.avgResolutionDays || 0).toFixed(1)} days`}
                        trendLabel="For closed tickets"
                        icon={FiClock}
                        color="blue"
                    />
                    <MetricCard
                        title="Total Tickets"
                        value={statusDist.reduce((sum, s) => sum + s.count, 0)}
                        trendLabel="In selected period"
                        icon={FiActivity}
                        color="emerald"
                    />
                    <MetricCard
                        title="Categories"
                        value={byCategory.length}
                        trendLabel="Ticket types"
                        icon={FiUsers}
                        color="violet"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="Ticket Status">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusDist}
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="_id"
                                >
                                    {statusDist.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS.charts[index % COLORS.charts.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Tickets by Category">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={byCategory} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="_id" type="category" width={100} tick={{ fontSize: 12, fill: "#64748b" }} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24} fill={COLORS.accent} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>
        );
    };

    const renderRecruitment = () => {
        const stats = data.recruitment || {};
        const pipeline = stats.pipelineStages || [];
        const sourceResults = stats.sourceResults || [];

        return (
            <div className="animate-in fade-in duration-500">
                <InsightAlert
                    type="success"
                    message={`Average time to hire: ${(stats.avgTimeToHire || 0).toFixed(0)} days. Your recruitment process is efficient!`}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <MetricCard
                        title="Avg Time to Hire"
                        value={`${(stats.avgTimeToHire || 0).toFixed(0)} days`}
                        trendLabel="Application to offer"
                        icon={FiClock}
                        color="blue"
                    />
                    <MetricCard
                        title="Candidates"
                        value={pipeline.reduce((sum, p) => sum + p.count, 0)}
                        trendLabel="Total applications"
                        icon={FiUsers}
                        color="emerald"
                    />
                    <MetricCard
                        title="Top Source"
                        value={sourceResults.length > 0 ? sourceResults[0]._id : "N/A"}
                        trendLabel={sourceResults.length > 0 ? `${sourceResults[0].count} candidates` : "No data"}
                        icon={FiActivity}
                        color="violet"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="Recruitment Pipeline">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={pipeline} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="_id" tick={{ fontSize: 12, fill: "#64748b" }} />
                                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="count" fill={COLORS.accent} radius={[4, 4, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Candidates by Source">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={sourceResults}
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="_id"
                                >
                                    {sourceResults.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS.charts[index % COLORS.charts.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>
        );
    };

    const renderAttrition = () => {
        const stats = data.attrition || {};
        const byDept = stats.byDepartment || [];
        const reasons = stats.reasons || [];

        return (
            <div className="animate-in fade-in duration-500">
                <InsightAlert
                    type={stats.attritionRate > 10 ? "warning" : "info"}
                    message={`Attrition rate: ${stats.attritionRate || 0}%. ${stats.attritionRate > 10 ? 'This is higher than industry average. Consider retention strategies.' : 'Your retention is healthy!'}`}
                />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        title="Attrition Rate"
                        value={`${stats.attritionRate || 0}%`}
                        trendLabel="Current period"
                        icon={FiActivity}
                        color="rose"
                    />
                    <MetricCard
                        title="Resignations"
                        value={stats.resignationCount || 0}
                        trendLabel="Total count"
                        icon={FiUsers}
                        color="amber"
                    />
                    <MetricCard
                        title="Avg Tenure"
                        value={`${Math.round(stats.avgTenureOfResigned || 0)} days`}
                        trendLabel="Of resigned employees"
                        icon={FiClock}
                        color="blue"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="Resignations by Department">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={byDept} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="_id" type="category" width={100} tick={{ fontSize: 12, fill: "#64748b" }} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24} fill={COLORS.danger} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Resignation Reasons">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={reasons}
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="_id"
                                >
                                    {reasons.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS.charts[index % COLORS.charts.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
            {/* --- HEADER --- */}
            <div className="max-w-7xl mx-auto">
                <SectionHeader
                    title="Analytics Overview"
                    subtitle="Real-time insights into your organization's performance."
                    action={
                        <div className="flex gap-3">
                            <div className="relative">
                                <select
                                    className="appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                >
                                    <option value="7">Last 7 Days</option>
                                    <option value="30">Last 30 Days</option>
                                    <option value="90">Last 3 Months</option>
                                    <option value="365">Last Year</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                    <FiChevronDown />
                                </div>
                            </div>
                            <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 font-medium text-sm">
                                <FiDownload /> Export
                            </button>
                        </div>
                    }
                />

                {/* --- TABS --- */}
                <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
                    {['workforce', 'attendance', 'leave', 'performance', 'payroll', 'tickets', 'recruitment', 'attrition'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap`}
                            style={activeTab === tab
                                ? { borderColor: '#663399', color: '#663399' }
                                : { borderColor: 'transparent', color: '#A3779D' }
                            }
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* --- CONTENT --- */}
                {loading && !data[activeTab] ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderBottomColor: '#663399' }}></div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'workforce' && renderWorkforce()}
                        {activeTab === 'attendance' && renderAttendance()}
                        {activeTab === 'leave' && renderLeaves()}
                        {activeTab === 'performance' && renderPerformance()}
                        {activeTab === 'payroll' && renderPayroll()}
                        {activeTab === 'tickets' && renderTickets()}
                        {activeTab === 'recruitment' && renderRecruitment()}
                        {activeTab === 'attrition' && renderAttrition()}
                    </>
                )}
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
