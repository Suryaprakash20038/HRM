import React, { useEffect, useState } from "react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell,
    RadialBarChart, RadialBar, Legend,
    FunnelChart, Funnel, LabelList // <--- Add these 3
} from "recharts";
import { Users, Briefcase, Calendar, Trophy, ArrowRight } from "lucide-react";
import "../../css/RecurementOverview.css";

// --- 1. CUSTOM GLASS TOOLTIP COMPONENT ---
const GlassTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-glass-tooltip" style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid #E6C7E6', borderRadius: '12px', padding: '12px', boxShadow: '0 10px 25px -5px rgba(102, 51, 153, 0.1)' }}>
                <p className="tooltip-label" style={{ margin: 0, fontWeight: 800, color: '#2E1A47', fontSize: '0.8rem', textTransform: 'uppercase' }}>{label}</p>
                <p className="tooltip-value" style={{ margin: '4px 0 0', fontWeight: 700, color: '#663399' }}>
                    Count: <span>{payload[0].value}</span>
                </p>
            </div>
        );
    }
    return null;
};

const RecruitmentOverview = () => {
    const [metrics, setMetrics] = useState({
        totalCandidates: 0,
        activeJobs: 0,
        totalHired: 0,
        interviewCount: 0
    });

    const [jobPostData, setJobPostData] = useState([]);
    const [referralData, setReferralData] = useState([]);
    const [interviewData, setInterviewData] = useState([]);
    const [placementData, setPlacementData] = useState([]);

    // Load Data
    useEffect(() => {
        const candidates = JSON.parse(localStorage.getItem("candidates")) || [];
        const jobs = JSON.parse(localStorage.getItem("jobs")) || [];
        const placements = JSON.parse(localStorage.getItem("placements")) || [];
        const interviews = JSON.parse(localStorage.getItem("interviewsData")) || [];

        setMetrics({
            totalCandidates: candidates.length,
            activeJobs: jobs.filter(j => j.status === "Active").length,
            totalHired: placements.length,
            interviewCount: interviews.length
        });

        // Process Job Data
        const jobCounts = jobs.reduce((acc, curr) => {
            const recruiter = curr.postedBy || "Unknown";
            acc[recruiter] = (acc[recruiter] || 0) + 1;
            return acc;
        }, {});
        setJobPostData(Object.keys(jobCounts).map(key => ({ name: key, count: jobCounts[key] })));

        // Process Referral Data
        const referralCounts = candidates.reduce((acc, curr) => {
            if (curr.source === "Referral" && curr.referralName) {
                acc[curr.referralName] = (acc[curr.referralName] || 0) + 1;
            }
            return acc;
        }, {});
        setReferralData(Object.keys(referralCounts).map(key => ({ name: key, count: referralCounts[key] })));

        // Process Interview Data
        const intCounts = interviews.reduce((acc, curr) => {
            const cName = curr.candidateName || "Unknown";
            acc[cName] = (acc[cName] || 0) + 1;
            return acc;
        }, {});
        setInterviewData(Object.keys(intCounts).map(key => ({ name: key, count: intCounts[key] })).slice(0, 5));

        // Process Placement
        let pCounts = { "Placed": 0, "Joined": 0, "In Process": 0, "Declined": 0 };
        placements.forEach(p => {
            const status = p.status?.trim() || "Placed";
            if (status.includes("Decline")) pCounts["Declined"]++;
            else if (pCounts.hasOwnProperty(status)) pCounts[status]++;
            else pCounts["Placed"]++;
        });
        setPlacementData([
            { name: "Joined", value: pCounts["Joined"] },
            { name: "Placed", value: pCounts["Placed"] },
            { name: "In Process", value: pCounts["In Process"] },
        ].filter(i => i.value > 0));

    }, []);

    const COLORS_PIE = ["#663399", "#A3779D", "#E6C7E6", "#2E1A47"];

    return (
        <div className="overview-page" style={{ background: '#fdfbff', minHeight: '100vh', padding: '2rem 0' }}>
            <div className="container">

                <div className="mb-10">
                    <div className="d-flex align-items-center gap-3 mb-2">
                        <div style={{ width: 4, height: 28, backgroundColor: '#663399', borderRadius: 4 }}></div>
                        <h2 className="mb-0 fw-black text-[#2E1A47] tracking-tight" style={{ fontSize: '2.5rem', fontWeight: 900 }}>Recruitment Intelligence</h2>
                    </div>
                    <p className="text-[#A3779D] fw-bold" style={{ fontSize: '1.1rem' }}>Real-time operational data from your hiring pipeline</p>
                </div>

                {/* KPI CARDS (Same as before) */}
                <div className="stats-grid">
                    <div className="stat-card fade-in-up" style={{ animationDelay: '0.1s', background: 'white', borderRadius: '32px', padding: '24px', border: '1px solid #E6C7E6', boxShadow: '0 10px 30px -10px rgba(102, 51, 153, 0.1)' }}>
                        <div className="stat-icon p-3 rounded-2xl mb-3 d-inline-block" style={{ backgroundColor: '#f3e8ff', color: '#663399' }}><Users size={24} /></div>
                        <div><h3 style={{ fontWeight: 900, color: '#2E1A47', fontSize: '2rem' }}>{metrics.totalCandidates}</h3><span style={{ fontWeight: 700, color: '#A3779D', fontSize: '0.8rem', textTransform: 'uppercase' }}>Field Assets</span></div>
                    </div>
                    <div className="stat-card fade-in-up" style={{ animationDelay: '0.2s', background: 'white', borderRadius: '32px', padding: '24px', border: '1px solid #E6C7E6', boxShadow: '0 10px 30px -10px rgba(102, 51, 153, 0.1)' }}>
                        <div className="stat-icon p-3 rounded-2xl mb-3 d-inline-block" style={{ backgroundColor: '#f3e8ff', color: '#663399' }}><Briefcase size={24} /></div>
                        <div><h3 style={{ fontWeight: 900, color: '#2E1A47', fontSize: '2rem' }}>{metrics.activeJobs}</h3><span style={{ fontWeight: 700, color: '#A3779D', fontSize: '0.8rem', textTransform: 'uppercase' }}>Active Vocations</span></div>
                    </div>
                    <div className="stat-card fade-in-up" style={{ animationDelay: '0.3s', background: 'white', borderRadius: '32px', padding: '24px', border: '1px solid #E6C7E6', boxShadow: '0 10px 30px -10px rgba(102, 51, 153, 0.1)' }}>
                        <div className="stat-icon p-3 rounded-2xl mb-3 d-inline-block" style={{ backgroundColor: '#f3e8ff', color: '#663399' }}><Calendar size={24} /></div>
                        <div><h3 style={{ fontWeight: 900, color: '#2E1A47', fontSize: '2rem' }}>{metrics.interviewCount}</h3><span style={{ fontWeight: 700, color: '#A3779D', fontSize: '0.8rem', textTransform: 'uppercase' }}>Screening Protocols</span></div>
                    </div>
                    <div className="stat-card fade-in-up" style={{ animationDelay: '0.4s', background: 'white', borderRadius: '32px', padding: '24px', border: '1px solid #E6C7E6', boxShadow: '0 10px 30px -10px rgba(102, 51, 153, 0.1)' }}>
                        <div className="stat-icon p-3 rounded-2xl mb-3 d-inline-block" style={{ backgroundColor: '#f3e8ff', color: '#663399' }}><Trophy size={24} /></div>
                        <div><h3 style={{ fontWeight: 900, color: '#2E1A47', fontSize: '2rem' }}>{metrics.totalHired}</h3><span style={{ fontWeight: 700, color: '#A3779D', fontSize: '0.8rem', textTransform: 'uppercase' }}>Successful Activations</span></div>
                    </div>
                </div>

                {/* ================= ANALYTICS GRID ================= */}
                <div className="analytics-grid">

                    {/* 1. JOB POSTINGS (Blue Gradient) */}
                    <div className="chart-card fade-in-up" style={{ animationDelay: '0.5s' }}>
                        <div className="chart-header">
                            <h4>Job Posting Performance</h4>
                            <span className="badge pulse">Live</span>
                        </div>
                        <div className="chart-body">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={jobPostData} barSize={40}>
                                    {/* GRADIENT DEFINITION */}
                                    <defs>
                                        <linearGradient id="colorJob" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                                    <Tooltip content={<GlassTooltip />} cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="count" fill="url(#colorJob)" radius={[8, 8, 0, 0]} animationDuration={1500} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 2. REFERRALS (Radial Activity Rings) */}
                    <div className="chart-card fade-in-up" style={{ animationDelay: '0.6s' }}>
                        <div className="chart-header">
                            <h4>Monthly Referrals</h4>
                            <span className="badge green">Top Referrers</span>
                        </div>

                        {/* Flex container for Ring Chart + Legend */}
                        <div className="chart-body flex-row" style={{ justifyContent: 'space-between', padding: '0 10px' }}>

                            {/* The Rings */}
                            <div style={{ width: '50%', height: 250, position: 'relative' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadialBarChart
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="30%"
                                        outerRadius="100%"
                                        barSize={15}
                                        data={referralData.map((entry, index) => ({
                                            ...entry,
                                            fill: ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"][index % 4] // Assign shades of green
                                        })).reverse()} // Reverse so biggest is outside
                                    >
                                        <RadialBar
                                            minAngle={15}
                                            background={{ fill: '#f1f5f9' }} // The grey track behind the bar
                                            clockWise
                                            dataKey="count"
                                            cornerRadius={10} // Rounded modern edges
                                        />
                                        <Tooltip content={<GlassTooltip />} cursor={false} />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Custom Legend (Right Side) */}
                            <div className="custom-legend" style={{ width: '45%' }}>
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '15px' }}>Leaderboard</p>
                                {referralData.map((entry, index) => {
                                    const colors = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"];
                                    const color = colors[index % colors.length];

                                    return (
                                        <div key={index} className="legend-row" style={{ marginBottom: '15px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '32px', height: '32px',
                                                    borderRadius: '8px',
                                                    background: `${color}20`, // 20% opacity background
                                                    color: color,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 'bold', fontSize: '0.8rem'
                                                }}>
                                                    #{index + 1}
                                                </div>
                                                <div>
                                                    <span style={{ display: 'block', fontWeight: '700', color: '#334155', fontSize: '0.9rem' }}>
                                                        {entry.name}
                                                    </span>
                                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                        {entry.count} Referrals
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    </div>

                    {/* 3. INTERVIEWS (Orange Gradient) */}
                    <div className="chart-card fade-in-up" style={{ animationDelay: '0.7s' }}>
                        <div className="chart-header">
                            <div>
                                <h4>Candidate Interviews</h4>
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Pipeline Activity</p>
                            </div>
                            <span className="badge orange pulse">Active</span>
                        </div>

                        <div className="chart-body">
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={interviewData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        {/* 1. The Gradient Fill (Fades down) */}
                                        <linearGradient id="colorIntGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>

                                        {/* 2. The Neon Glow Filter */}
                                        <filter id="neonGlow" height="300%" width="300%" x="-75%" y="-75%">
                                            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                            <feMerge>
                                                <feMergeNode in="coloredBlur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>

                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10} // Push text down slightly
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                    />

                                    <Tooltip content={<GlassTooltip />} cursor={{ stroke: '#f59e0b', strokeWidth: 1, strokeDasharray: '4 4' }} />

                                    {/* The Wave */}
                                    <Area
                                        type="monotone" // This makes it wavy
                                        dataKey="count"
                                        stroke="#f59e0b"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorIntGradient)"
                                        filter="url(#neonGlow)" // Applies the glow
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 4. PLACEMENT (Donut with Center Text) */}
                    <div className="chart-card fade-in-up" style={{ animationDelay: '0.8s' }}>
                        <div className="chart-header">
                            <h4>Placement Status</h4>
                            <span className="badge purple">Pipeline</span>
                        </div>
                        <div className="chart-body flex-row relative-container">
                            <div style={{ width: '60%', height: 250, position: 'relative' }}>
                                {/* CENTER TEXT */}
                                <div className="donut-center-text">
                                    <h3>{metrics.totalHired}</h3>
                                    <span>Total</span>
                                </div>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={placementData}
                                            innerRadius={65}
                                            outerRadius={85}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                            animationDuration={1500}
                                        >
                                            {placementData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            {/* Custom Legend */}
                            <div className="custom-legend">
                                {placementData.map((entry, index) => (
                                    <div key={index} className="legend-row">
                                        <span className="dot" style={{ background: COLORS_PIE[index % COLORS_PIE.length] }}></span>
                                        <span className="lbl">{entry.name}</span>
                                        <span className="val">{entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default RecruitmentOverview;