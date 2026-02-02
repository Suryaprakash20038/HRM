import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend, Label
} from "recharts";
import {
  Search, Bell, Mail, ChevronDown, CheckCircle,
  Wallet, TrendingUp, TrendingDown, Users,
  Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight,
  LayoutGrid, Plus, FileText
} from "lucide-react";

import dashboardService from "../../services/dashboardService";
import announcementService from "../../services/announcementService";
import { useAuth } from "../../context/AuthContext";
import CreateAnnouncementModal from "../../components/Dashboard/CreateAnnouncementModal";

// Asset
import bannerImg from "../../assets/mens.png";



// --- THEME CONSTANTS ---
const THEME = {
  primary: "#663399",      // Royal Amethyst
  secondary: "#A3779D",    // Soft Violet
  success: "#663399",      // Royal Amethyst
  warning: "#A3779D",      // Soft Violet
  danger: "#2E1A47",       // Midnight Plum
  textPrimary: "#2E1A47",  // Midnight Plum
  textSecondary: "#A3779D", // Soft Violet
  bgLight: "#E6C7E6",      // Lilac Mist
  cardBg: "#FFFFFF"
};

const COLORS = [THEME.primary, THEME.secondary, "#2E1A47", "#E6C7E6"];

// --- COMPONENTS ---

// 1. Wall Clock Component
const WallClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourDeg = (hours * 30) + (minutes * 0.5);
  const minuteDeg = minutes * 6;
  const secondDeg = seconds * 6;

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#E6C7E6]/40" style={{ boxShadow: '0 1px 3px rgba(102, 51, 153, 0.04), 0 1px 2px rgba(102, 51, 153, 0.06)' }}>
      <div className="flex flex-col items-center">
        {/* Clock Face */}
        <div className="relative w-44 h-44 rounded-full border-4 border-[#663399] shadow-lg bg-gradient-to-br from-white to-[#E6C7E6]/10">
          {/* Clock Center Dot */}
          <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-[#663399] rounded-full transform -translate-x-1/2 -translate-y-1/2 z-30 shadow-md"></div>

          {/* Hour Markers */}
          {[...Array(12)].map((_, i) => {
            const angle = i * 30;
            const isMainHour = i % 3 === 0;
            return (
              <div
                key={i}
                className={`absolute top-1/2 left-1/2 origin-center ${isMainHour ? 'w-1 h-4 bg-[#663399]' : 'w-0.5 h-3 bg-[#A3779D]'}`}
                style={{
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-80px)`,
                }}
              ></div>
            );
          })}

          {/* Hour Hand */}
          <div
            className="absolute top-1/2 left-1/2 origin-bottom z-20"
            style={{
              width: '6px',
              height: '40px',
              backgroundColor: '#2E1A47',
              borderRadius: '3px',
              transform: `translate(-50%, -100%) rotate(${hourDeg}deg)`,
              transition: 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)',
            }}
          ></div>

          {/* Minute Hand */}
          <div
            className="absolute top-1/2 left-1/2 origin-bottom z-20"
            style={{
              width: '4px',
              height: '60px',
              backgroundColor: '#663399',
              borderRadius: '2px',
              transform: `translate(-50%, -100%) rotate(${minuteDeg}deg)`,
              transition: 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)',
            }}
          ></div>

          {/* Second Hand */}
          <div
            className="absolute top-1/2 left-1/2 origin-bottom z-20"
            style={{
              width: '2px',
              height: '70px',
              backgroundColor: '#A3779D',
              borderRadius: '1px',
              transform: `translate(-50%, -100%) rotate(${secondDeg}deg)`,
              transition: 'transform 0.1s linear',
            }}
          ></div>
        </div>

        {/* Digital Time Display */}
        <div className="mt-4 text-center">
          <div className="text-2xl font-bold text-[#2E1A47] tracking-tight">
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-xs text-[#A3779D] font-medium mt-1">
            {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Simple Calendar Component
const SimpleCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const renderDays = () => {
    const totalDays = daysInMonth(currentDate);
    const startDay = firstDayOfMonth(currentDate);
    const blanks = Array(startDay).fill(null);
    const dayArray = Array.from({ length: totalDays }, (_, i) => i + 1);

    const allDays = [...blanks, ...dayArray];

    return allDays.map((day, index) => {
      const isToday = day === new Date().getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear();

      // Highlight specific dates (dummy data)
      const hasEvent = [16, 24].includes(day);

      return (
        <div key={index} className={`h-8 w-8 flex items-center justify-center rounded-full text-xs font-medium cursor-pointer transition-all
          ${!day ? "" : isToday ? "bg-[#663399] text-white shadow-md scale-110" : "hover:bg-[#E6C7E6] text-[#2E1A47]"}
          ${hasEvent && !isToday ? "border border-[#A3779D] bg-[#E6C7E6] text-[#663399]" : ""}
        `}>
          {day}
        </div>
      );
    });
  };

  return (
    <div className="p-4 bg-white rounded-2xl border border-[#E6C7E6]/40" style={{ boxShadow: '0 1px 3px rgba(102, 51, 153, 0.04), 0 1px 2px rgba(102, 51, 153, 0.06)' }}>
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="p-1 hover:bg-[#E6C7E6] rounded-full text-[#A3779D] hover:text-[#663399] transition"><ChevronLeft size={16} /></button>
        <h3 className="text-sm font-bold text-[#2E1A47]">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
        <button onClick={nextMonth} className="p-1 hover:bg-[#E6C7E6] rounded-full text-[#A3779D] hover:text-[#663399] transition"><ChevronRight size={16} /></button>
      </div>
      <div className="grid grid-cols-7 mb-2 text-center text-[10px] font-bold text-[#A3779D] uppercase tracking-wide">
        {days.map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-2 place-items-center">
        {renderDays()}
      </div>
    </div>
  );
};


// 2. StatCard Component (Compact with Purple Background)
const StatCard = ({ title, value, icon: Icon, bgClass, iconClass, onClick }) => (
  <motion.div
    whileHover={{ y: -2, transition: { duration: 0.2, ease: 'easeOut' } }}
    className="bg-[#663399] p-4 rounded-[20px] cursor-pointer relative overflow-hidden group transition-all duration-300"
    onClick={onClick}
    style={{
      border: '1px solid rgba(163, 119, 157, 0.15)',
      boxShadow: '0 1px 3px rgba(102, 51, 153, 0.12), 0 4px 12px rgba(102, 51, 153, 0.08), 0 8px 24px rgba(102, 51, 153, 0.04)',
      transition: 'box-shadow 0.3s ease, transform 0.2s ease'
    }}
    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 4px rgba(102, 51, 153, 0.14), 0 8px 16px rgba(102, 51, 153, 0.12), 0 16px 32px rgba(102, 51, 153, 0.08)'}
    onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(102, 51, 153, 0.12), 0 4px 12px rgba(102, 51, 153, 0.08), 0 8px 24px rgba(102, 51, 153, 0.04)'}
  >
    <div className="flex justify-between items-start z-10 relative">
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold opacity-75 uppercase tracking-[0.15em] text-white/70 leading-tight">{title}</span>
        <h3 className="text-xl font-extrabold text-white tracking-tight stats-number" style={{ letterSpacing: '-0.02em' }}>{value}</h3>
      </div>

      {/* Icon Circle */}
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#A3779D] shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg" style={{ boxShadow: '0 4px 12px rgba(163, 119, 157, 0.3)' }}>
        <Icon className="w-6 h-6 text-white" strokeWidth={2.2} />
      </div>
    </div>

    {/* Subtle shine effect on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
  </motion.div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

  // Fetch logic
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, annData] = await Promise.all([
          dashboardService.getStats(),
          announcementService.getAllAnnouncements({ limit: 5 })
        ]);
        setStats(statsData || {});
        setAnnouncements(annData.announcements || []);
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cardRoutes = {
    Employees: "/employees",
    Attendance: "/attendance",
    Tasks: "/tasks",
    Projects: "/projects",
    Income: "/payroll",
    Expenses: "/payroll"
  };

  // Helper to format currency
  const fmt = (n) => n?.toLocaleString() || "0";

  return (
    <div className="min-h-screen bg-[#E6C7E6] p-6 font-sans text-slate-800">

      {/* 2. MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* LEFT COLUMN (Content) */}
        <div className="lg:col-span-3 space-y-8">


          {/* BANNER */}
          <div className="relative w-full rounded-[24px] overflow-hidden bg-[#663399] shadow-lg shadow-purple-200/40 h-[160px] flex items-center">
            {/* Geometric Background Pattern */}
            <div className="absolute inset-0 opacity-10 mix-blend-overlay"
              style={{
                backgroundImage: `linear-gradient(45deg, #ffffff 25%, transparent 25%), 
                                      linear-gradient(-45deg, #ffffff 25%, transparent 25%), 
                                      linear-gradient(45deg, transparent 75%, #ffffff 75%), 
                                      linear-gradient(-45deg, transparent 75%, #ffffff 75%)`,
                backgroundSize: '40px 40px',
                backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px'
              }}>
            </div>

            {/* Content */}
            <div className="relative z-10 pl-10 pr-4 py-8 w-full md:w-7/12">
              <h2 className="text-white text-3xl font-bold mb-2 tracking-normal flex items-center gap-3" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.01em' }}>
                Good Afternoon, {user?.firstName || "User"} <span className="animate-wave">👋</span>
              </h2>
              <p className="text-[#E6C7E6]/90 text-sm font-normal leading-relaxed max-w-md" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.01em' }}>
                Here's a quick overview of your organization's activity today. Track employees, attendance, projects, and growth—all in one place.
              </p>
            </div>

            {/* Illustration (Right Aligned) */}
            <div className="hidden md:block absolute right-0 bottom-0 h-full w-[45%]">
              <div className="absolute inset-0 bg-[#2E1A47]/20 backdrop-blur-sm -skew-x-12 translate-x-20"></div> {/* Decorative element */}
              <img
                src={bannerImg}
                alt="Office"
                className="absolute right-4 bottom-0 h-[115%] w-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* STATS GRID (6 Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Income"
              value={`₹${fmt(stats.totalIncome)}`}
              icon={Wallet}
              bgClass=""
              iconClass="text-[#663399]"
              onClick={() => navigate('/payroll')}
            />
            <StatCard
              title="Total Expenses"
              value={`₹${fmt(stats.totalExpense)}`}
              icon={TrendingDown}
              bgClass=""
              iconClass="text-[#A3779D]"
              onClick={() => navigate('/payroll')}
            />
            <StatCard
              title="Total Balance"
              value={`₹${fmt(stats.totalBalance)}`}
              icon={TrendingUp}
              bgClass=""
              iconClass="text-[#2E1A47]"
              onClick={() => navigate('/payroll')}
            />
            <StatCard
              title="Employee"
              value={stats.totalEmployees || 0}
              icon={Users}
              bgClass=""
              iconClass="text-[#663399]"
              onClick={() => navigate('/employees')}
            />
            <StatCard
              title="Attendance"
              value={stats.todayAttendance || 0}
              icon={CheckCircle}
              bgClass=""
              iconClass="text-[#A3779D]"
              onClick={() => navigate('/attendance')}
            />
            <StatCard
              title="Total Tasks"
              value={stats.totalTasks || 0}
              icon={FileText}
              bgClass=""
              iconClass="text-[#2E1A47]"
              onClick={() => navigate('/tasks')}
            />
          </div>

          {/* CHARTS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Attendance Chart (Col Span 2) */}
            <div className="md:col-span-2 bg-gradient-to-br from-[#663399] to-[#2E1A47] p-6 rounded-2xl border border-[#663399]/20 h-[380px] flex flex-col" style={{ boxShadow: '0 1px 3px rgba(102, 51, 153, 0.12), 0 4px 12px rgba(102, 51, 153, 0.10), 0 12px 28px rgba(102, 51, 153, 0.08)' }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">Attendance Overview</h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white bg-white/10 px-3 py-2 rounded-lg border border-white/20 cursor-pointer hover:bg-white/20 transition shadow-sm backdrop-blur-sm">
                    Monthly <ChevronDown className="w-3.5 h-3.5 text-white" />
                  </div>
                  <button onClick={() => navigate('/attendance')} className="text-xs font-semibold text-white hover:text-white/80 transition">View All</button>
                </div>
              </div>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.departmentAttendance || []} barGap={12}>
                    <defs>
                      <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E6C7E6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#A3779D" stopOpacity={0.8} />
                      </linearGradient>
                      <linearGradient id="absentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#ffffff', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{ fontSize: 11, fill: '#ffffff', fontWeight: 500 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        background: 'rgba(46, 26, 71, 0.95)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        padding: '12px',
                        color: '#ffffff'
                      }}
                      labelStyle={{ color: '#ffffff', fontWeight: 600 }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      iconSize={10}
                      wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 600, color: '#ffffff' }}
                    />
                    <Bar dataKey="Present" name="Present" fill="url(#presentGradient)" radius={[8, 8, 0, 0]} barSize={20} />
                    <Bar dataKey="Absent" name="Absent" fill="url(#absentGradient)" radius={[8, 8, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Projects Chart (Col Span 1) */}
            <div className="bg-gradient-to-br from-[#663399] to-[#2E1A47] p-6 rounded-2xl border border-[#663399]/20 h-[380px] flex flex-col relative" style={{ boxShadow: '0 1px 3px rgba(102, 51, 153, 0.12), 0 4px 12px rgba(102, 51, 153, 0.10), 0 12px 28px rgba(102, 51, 153, 0.08)' }}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-white">Projects Status</h3>
                <div className="flex items-center gap-2 text-xs font-semibold text-white bg-white/10 px-3 py-2 rounded-lg border border-white/20 cursor-pointer hover:bg-white/20 transition shadow-sm backdrop-blur-sm">
                  This Week <ChevronDown className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <linearGradient id="activeGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#E6C7E6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#A3779D" stopOpacity={1} />
                      </linearGradient>
                      <linearGradient id="pendingGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity={0.7} />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity={0.4} />
                      </linearGradient>
                      <linearGradient id="completedGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#E6C7E6" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <Pie
                      data={[
                        { name: 'Active', value: stats.activeProjects || 0, fill: 'url(#activeGradient)' },
                        { name: 'Pending', value: stats.pendingProjects || 0, fill: 'url(#pendingGradient)' },
                        { name: 'Completed', value: stats.completedProjects || 0, fill: 'url(#completedGradient)' }
                      ]}
                      cx="50%"
                      cy="45%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth={2}
                    >
                      <Label
                        value={stats.totalProjects || 0}
                        position="center"
                        style={{ fontSize: '32px', fontWeight: 'bold', fill: '#ffffff' }}
                      />
                      <Label
                        value="Total Projects"
                        position="center"
                        dy={25}
                        style={{ fontSize: '12px', fill: 'rgba(255,255,255,0.7)', fontWeight: 600 }}
                      />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        background: 'rgba(46, 26, 71, 0.95)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        padding: '12px',
                        color: '#ffffff'
                      }}
                      labelStyle={{ color: '#ffffff', fontWeight: 600 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="text-center p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                  <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ background: 'linear-gradient(135deg, #E6C7E6, #A3779D)' }}></div>
                  <div className="text-xs font-semibold text-white/80">Active</div>
                  <div className="text-lg font-bold text-white">{stats.activeProjects || 0}</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                  <div className="w-3 h-3 rounded-full bg-white/60 mx-auto mb-2"></div>
                  <div className="text-xs font-semibold text-white/80">Pending</div>
                  <div className="text-lg font-bold text-white">{stats.pendingProjects || 0}</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                  <div className="w-3 h-3 rounded-full bg-white/80 mx-auto mb-2"></div>
                  <div className="text-xs font-semibold text-white/80">Done</div>
                  <div className="text-lg font-bold text-white">{stats.completedProjects || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* EXTRA: GROWTH TIMELINE (Preserved) */}
          <div className="bg-white p-6 rounded-3xl border border-[#E6C7E6]/40" style={{ boxShadow: '0 1px 3px rgba(102, 51, 153, 0.04), 0 1px 2px rgba(102, 51, 153, 0.06)' }}>
            <h3 className="text-lg font-semibold text-[#2E1A47] mb-6">Company Growth</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.projectChart || []}>
                  <defs>
                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={THEME.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Area type="monotone" dataKey="progress" stroke={THEME.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (Sidebar) */}
        <div className="lg:col-span-1 space-y-8">

          {/* Section Header */}
          <div className="flex justify-between items-center mb-[-10px]">
            <h3 className="text-lg font-semibold text-slate-800">Schedules</h3>
            <button className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition">+ Add New</button>
          </div>

          {/* WALL CLOCK */}
          <WallClock />

          {/* CALENDAR */}
          <SimpleCalendar />

          {/* UPCOMING EVENTS (Updates) */}
          <div className="bg-gradient-to-br from-[#663399] to-[#2E1A47] p-5 rounded-3xl border border-[#663399]/20" style={{ boxShadow: '0 1px 3px rgba(102, 51, 153, 0.12), 0 4px 12px rgba(102, 51, 153, 0.10), 0 12px 28px rgba(102, 51, 153, 0.08)' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-white">Upcoming Events</h3>
              <button onClick={() => navigate('/announcement')} className="text-xs font-semibold text-white hover:text-white/80 transition">View All</button>
            </div>

            <div className="space-y-4">
              {announcements.length > 0 ? (
                announcements.slice(0, 3).map((ann, i) => (
                  <div key={i} className="flex gap-4 items-start group cursor-pointer hover:bg-white/5 p-2 rounded-xl transition">
                    {/* Date Box */}
                    <div className="flex-shrink-0 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center text-white border border-white/20">
                      <span className="text-[10px] uppercase font-semibold">{new Date(ann.createdAt).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-lg font-black leading-none stats-number">{new Date(ann.createdAt).getDate()}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate group-hover:text-white/80 transition-colors">{ann.title}</h4>
                      <p className="text-xs text-white/60 mt-1 line-clamp-2">{ann.content}</p>
                      <div className="mt-2 text-[10px] text-white/50 font-medium">09:00 AM - 10:00 PM</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-white/60 text-xs">No upcoming events</div>
              )}
            </div>
          </div>

          {/* SHORTCUTS / MEDIA PREVIEW */}
          <div className="bg-gradient-to-br from-[#663399] to-[#2E1A47] p-6 rounded-3xl text-white relative overflow-hidden border border-[#663399]/20" style={{ boxShadow: '0 1px 3px rgba(102, 51, 153, 0.12), 0 4px 12px rgba(102, 51, 153, 0.10), 0 12px 28px rgba(102, 51, 153, 0.08)' }}>
            <div className="relative z-10">
              <h3 className="text-lg font-semibold mb-1">Company Media</h3>
              <p className="text-[#E6C7E6] text-xs mb-4">Manage your organization's gallery</p>
              <div onClick={() => navigate('/media')} className="bg-white/20 backdrop-blur-md p-3 rounded-xl border border-white/20 cursor-pointer hover:bg-white/30 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <div className="text-xs opacity-75 uppercase font-semibold">Total Media</div>
                    <div className="text-xl font-bold stats-number">{stats.totalMedia || 0} File(s)</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>

        </div>
      </div>

      <CreateAnnouncementModal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        onCreated={() => {/* Refresh logic if needed */ }}
      />
    </div>
  );
}
