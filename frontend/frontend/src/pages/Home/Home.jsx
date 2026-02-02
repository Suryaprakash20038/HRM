import React, { useState, useEffect } from 'react';
import LandingHeader from '../../components/LandingHeader';
import logo from '../../assets/logo4.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Particles from '../../components/Particles';
import {
    Users,
    Clock,
    CreditCard,
    Briefcase,
    BarChart3,
    ShieldCheck,
    CheckCircle2,
    XCircle,
    Menu,
    X,
    ArrowRight,
    Building2,
    LayoutDashboard,
    Smartphone,
    PieChart,
    UserCheck,
    Globe,
    Sparkles,
    Check,
    Play,
    Star,
    FileText,
    Zap
} from "lucide-react";

const Home = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const heroImages = [
        "/purple_dashboard.png",
        "/purple_attendance.png",
        "/purple_employee.png",
        "/purple_task.png"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const getDashboardPath = () => {
        if (!user) return '/login';
        const role = user?.role?.toLowerCase();
        if (['employee', 'teamlead', 'manager'].includes(role)) {
            return '/employee/dashboard';
        }
        return '/dashboard';
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const fadeInLeft = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const fadeInRight = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const zoomIn = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#E6C7E6] selection:text-[#2E1A47] overflow-x-hidden">

            {/* Navbar */}
            <LandingHeader />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-36 lg:pb-32 overflow-hidden bg-slate-50">

                {/* Background Decor - Made Lighter/Subtle */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50rem] h-[50rem] bg-[#E6C7E6]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="absolute top-[20%] right-[-20%] w-[40rem] h-[40rem] bg-[#A3779D]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-[-10%] left-[20%] w-[45rem] h-[45rem] bg-[#663399]/5 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                    <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#E6C7E6]/5 to-transparent"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 h-full flex items-center">
                    <div className="grid lg:grid-cols-2 gap-16 w-full items-center">

                        {/* Left: Content */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            className="max-w-2xl pt-10 lg:pt-0"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E6C7E6] text-[#663399] text-sm font-semibold shadow-sm mb-8 hover:scale-105 transition-transform cursor-pointer">
                                <span className="flex h-2 w-2 rounded-full bg-[#663399] animate-pulse"></span>
                                <span className="bg-gradient-to-r from-[#663399] to-[#2E1A47] bg-clip-text text-transparent">New: AI-Powered Recruitment</span>
                                <ArrowRight size={14} className="text-[#663399]" />
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-[#2E1A47] leading-[1.1] mb-6">
                                The Future of <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#663399] via-[#A3779D] to-[#2E1A47]">Workforce Management</span>
                            </h1>

                            <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                                Eliminate manual tasks, automate payroll, and streamline hiring with a platform designed for <span className="text-[#2E1A47] font-semibold">fast-growing teams</span>.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-10">
                                <button
                                    onClick={() => navigate('/register')}
                                    className="px-8 py-4 bg-[#663399] text-white font-bold rounded-xl shadow-xl shadow-[#663399]/20 hover:bg-[#2E1A47] hover:scale-105 transition-all text-lg flex items-center justify-center gap-2"
                                >
                                    Get Started <ArrowRight size={20} />
                                </button>
                                <button
                                    onClick={() => window.open('mailto:demo@hrmpro.com')}
                                    className="px-8 py-4 bg-white text-[#2E1A47] border border-slate-200 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                >
                                    <Play size={20} className="fill-[#663399] text-[#663399]" />
                                    Watch Demo
                                </button>
                            </div>

                            {/* Trust Signals */}
                            <div className="flex items-center gap-6">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-slate-200 overflow-hidden">
                                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />)}
                                    </div>
                                    <p className="text-sm font-medium text-slate-600">Loved by <span className="text-[#2E1A47] font-bold">500+</span> teams</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Column Spacer (Hidden on Mobile) */}
                        <div className="hidden lg:block"></div>

                    </div>
                </div>

                {/* Right: Slider Image - Absolute Positioned to Right Half */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="absolute right-0 top-0 bottom-0 w-full lg:w-[50%] hidden lg:block overflow-hidden"
                >
                    <div className="relative w-full h-full">

                        {/* Slideshow Image */}
                        <AnimatePresence mode='popLayout'>
                            <motion.img
                                key={currentImageIndex}
                                src={heroImages[currentImageIndex]}
                                initial={[
                                    { opacity: 0, x: 50 },
                                    { opacity: 0, scale: 0.9 },
                                    { opacity: 0, y: 50 }
                                ][currentImageIndex % 3]}
                                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.6, ease: "circOut" }}
                                alt="Dashboard Preview"
                                className="w-full h-full object-cover object-left"
                            />
                        </AnimatePresence>

                        {/* Gradient Overlay for Text Readability (Optional but good for full cover) */}
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-transparent to-transparent z-10"></div>

                        {/* Floating Badges (Positioned relative to this half) */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute left-[10%] bottom-[15%] bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 flex items-center gap-3 z-20"
                        >
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <CheckCircle2 size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-semibold uppercase">Payroll</p>
                                <p className="text-sm font-bold text-slate-800">Completed</p>
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute right-[5%] top-[25%] bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 flex items-center gap-3 z-20"
                        >
                            <div className="w-10 h-10 rounded-full bg-[#E6C7E6]/40 flex items-center justify-center text-[#663399]">
                                <Users size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-semibold uppercase">New Hires</p>
                                <p className="text-sm font-bold text-slate-800">+12 this week</p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* Overview Section - Text Reveal Style */}
            <section id="overview" className="py-24 bg-white relative overflow-hidden">
                {/* Particles Background */}
                <div className="absolute inset-0 z-0">
                    <Particles
                        particleColor="rgba(163, 119, 157, 0.3)" // Soft Violet
                        lineColor="rgba(230, 199, 230, 0.2)" // Lilac Mist
                        particleCount={60}
                        lineDistance={120}
                    />
                </div>

                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-[#E6C7E6]/30 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[20%] right-[10%] w-72 h-72 bg-[#663399]/10 rounded-full blur-[100px]" />
                </div>
                <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto p-12 rounded-3xl bg-white/50 backdrop-blur-sm border border-slate-100 shadow-2xl shadow-indigo-100/50"
                    >
                        <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-8 tracking-tight">
                            What is <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#663399] to-[#A3779D]">HRM Software?</span>
                        </h2>
                        <p className="text-xl text-slate-600 leading-relaxed font-light">
                            Human Resource Management (HRM) software sits at the intersection of business and people. It <span className="font-semibold text-[#2E1A47]">operationalizes your HR tasks</span>, centralizing employee data, automating payroll, and simplifying recruitment—so you can focus on building a great culture.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Problem vs Solution - Split Cards */}
            <section className="py-24 bg-slate-50 relative perspective-[2000px]">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">

                    {/* Floating VS Badge for Desktop */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 hidden md:flex items-center justify-center w-16 h-16 rounded-full bg-white border-4 border-slate-100 shadow-xl text-slate-300 font-black text-xl">
                        VS
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 lg:gap-20 relative">
                        {/* Problems Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -50, rotateY: 5 }}
                            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            whileHover={{ y: -5, rotateZ: -1 }}
                            className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-10 shadow-2xl shadow-red-100/50 border border-red-100 relative overflow-hidden group z-10"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-[80px] -mr-32 -mt-32 transition-all group-hover:bg-red-100 scale-150"></div>
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-50 rounded-full blur-[60px] -ml-20 -mb-20"></div>

                            <h3 className="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-4 relative z-10">
                                <span className="bg-red-50 text-red-500 p-3 rounded-2xl shadow-inner"><XCircle size={32} /></span>
                                Without HRM
                            </h3>

                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={{
                                    visible: { transition: { staggerChildren: 0.1 } }
                                }}
                                className="space-y-4 relative z-10"
                            >
                                {[
                                    "Chaotic manual attendance tracking",
                                    "Endless Excel sheets silos",
                                    "Recurring payroll calculation errors",
                                    "Slow, disjointed hiring processes",
                                    "Zero visibility into analytics"
                                ].map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        variants={{
                                            hidden: { opacity: 0, x: -20 },
                                            visible: { opacity: 1, x: 0 }
                                        }}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 border border-red-50 hover:bg-red-50 hover:border-red-100 transition-all cursor-default group/item"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 shrink-0 group-hover/item:scale-110 transition-transform">
                                            <X size={16} strokeWidth={3} />
                                        </div>
                                        <span className="text-slate-600 font-medium text-lg">{item}</span>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>

                        {/* Solutions Card - Highlight */}
                        <motion.div
                            initial={{ opacity: 0, x: 50, rotateY: -5 }}
                            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            whileHover={{ y: -10, scale: 1.02 }}
                            className="bg-[#2E1A47] text-white rounded-[2.5rem] p-10 shadow-2xl shadow-[#663399]/40 relative overflow-hidden group z-20"
                        >
                            {/* Animated Gradient Shine */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#663399]/0 via-[#A3779D]/10 to-[#663399]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                            {/* Abstract Shapes */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-[#663399] rounded-full blur-[100px] -mr-20 -mt-20 opacity-50 group-hover:opacity-70 transition-opacity"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#A3779D] rounded-full blur-[80px] -ml-20 -mb-20 opacity-30"></div>

                            <h3 className="text-3xl font-bold text-white mb-8 flex items-center gap-4 relative z-10">
                                <span className="bg-gradient-to-br from-[#A3779D] to-[#663399] p-3 rounded-2xl shadow-lg border border-white/20"><CheckCircle2 size={32} /></span>
                                With HRMPro
                            </h3>

                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={{
                                    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
                                }}
                                className="space-y-4 relative z-10"
                            >
                                {[
                                    "Automated biometric & digital attendance",
                                    "Centralized, secure employee database",
                                    "One-click error-free payroll processing",
                                    "Streamlined recruitment pipeline",
                                    "Real-time role-based insights"
                                ].map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        variants={{
                                            hidden: { opacity: 0, x: 20 },
                                            visible: { opacity: 1, x: 0 }
                                        }}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/5 hover:bg-white/20 transition-all cursor-default hover:shadow-lg group/item"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A3779D] to-[#663399] flex items-center justify-center text-white shrink-0 group-hover/item:scale-110 transition-transform shadow-md">
                                            <Check size={16} strokeWidth={4} />
                                        </div>
                                        <span className="text-white font-medium text-lg">{item}</span>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Core Modules - Modern Widget Style */}
            <section id="modules" className="py-32 bg-slate-50 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#E6C7E6]/20 rounded-full blur-[150px] pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#663399]/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="absolute inset-0 z-0 opacity-40">
                    <Particles
                        particleColor="rgba(102, 51, 153, 0.15)"
                        lineColor="rgba(102, 51, 153, 0.05)"
                        particleCount={40}
                        lineDistance={180}
                    />
                </div>

                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-24">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={zoomIn}
                            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white border border-[#E6C7E6] text-[#663399] font-semibold text-sm mb-6 shadow-sm hover:shadow-md transition-shadow cursor-default"
                        >
                            <Sparkles size={16} />
                            <span>POWERFUL FEATURES</span>
                        </motion.div>
                        <motion.h2
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            className="text-5xl lg:text-6xl font-extrabold text-[#2E1A47] mb-6 tracking-tight"
                        >
                            Redesigned for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#663399] to-[#A3779D]">Modern Teams</span>
                        </motion.h2>
                        <motion.p
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            className="text-xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed"
                        >
                            Experience a workspace that feels less like "software" and more like a superpower for your HR department.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[350px]">

                        {/* 1. Employee Management (Featured - 8 cols) */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInLeft}
                            className="md:col-span-8 group relative rounded-[3rem] bg-[#2E1A47] overflow-hidden shadow-2xl transition-all hover:shadow-[#663399]/30"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#2E1A47] to-[#1E1035]"></div>
                            <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-[#663399]/20 blur-[100px] rounded-full"></div>

                            <div className="relative z-10 h-full p-10 flex flex-col md:flex-row items-center gap-10">
                                <div className="flex-1 space-y-6">
                                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 text-[#E6C7E6]">
                                        <Users size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-bold text-white mb-3">Employee Directory</h3>
                                        <p className="text-[#E6C7E6]/70 text-lg leading-relaxed">
                                            A central hub for all your people. Manage profiles, track history, and store documents in one secure, beautiful dashboard.
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white">Secure Storage</span>
                                        <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white">Easy Search</span>
                                    </div>
                                </div>

                                {/* Floating Widget UI */}
                                <div className="flex-1 w-full h-full relative perspective-[1000px]">
                                    <motion.div
                                        whileHover={{ rotateY: -5, rotateX: 5, scale: 1.05 }}
                                        transition={{ type: "spring", stiffness: 100 }}
                                        className="relative w-full h-[120%] bg-white rounded-2xl border-[6px] border-[#2E1A47]/20 overflow-hidden shadow-2xl ml-4 mt-8"
                                    >
                                        <img src="/purple_employee.png" alt="Employee List" className="w-full h-full object-cover object-top" />

                                        {/* Floating Badge */}
                                        <div className="absolute -left-6 top-10 bg-white p-3 rounded-xl shadow-lg flex items-center gap-3 border border-slate-100">
                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">JD</div>
                                            <div>
                                                <div className="text-xs text-slate-400">Status</div>
                                                <div className="text-sm font-bold text-slate-800">Active</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>

                        {/* 2. Attendance (Vertical - 4 cols) */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            transition={{ delay: 0.2 }}
                            className="md:col-span-4 group relative rounded-[3rem] bg-white border border-slate-100 overflow-hidden shadow-xl hover:shadow-2xl transition-all"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white"></div>

                            <div className="absolute top-0 right-0 p-8 z-20 text-right w-full">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#E6C7E6]/20 text-[#663399] mb-4">
                                    <Clock size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800">Smart Attendance</h3>
                                <p className="text-slate-500 text-sm mt-2">Biometric & Geo-fencing ready.</p>
                            </div>

                            {/* Mobile App Style View */}
                            <div className="absolute bottom-[-10%] left-[50%] -translate-x-[50%] w-[80%] h-[70%] bg-slate-900 rounded-t-[2.5rem] p-2 shadow-2xl border-t-[8px] border-x-[8px] border-slate-200 group-hover:translate-y-[-10px] transition-transform duration-500">
                                <div className="w-full h-full bg-white rounded-t-[2rem] overflow-hidden relative">
                                    <img src="/purple_attendance.png" alt="Attendance App" className="w-full h-full object-cover object-top" />
                                    <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black/50 to-transparent"></div>
                                </div>
                            </div>
                        </motion.div>

                        {/* 3. Payroll (Square - 4 cols) */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={zoomIn}
                            transition={{ delay: 0.3 }}
                            className="md:col-span-4 group relative rounded-[3rem] bg-white border border-slate-100 overflow-hidden shadow-xl hover:scale-[1.02] transition-all"
                        >
                            <div className="p-8 h-full flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <CreditCard size={32} className="text-[#A3779D]" />
                                    <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">Automated</span>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">Auto Payroll</h3>
                                <p className="text-slate-500 text-sm mb-6">Tax calculations, slip generation, and compliance in one click.</p>

                                <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-100 shadow-inner group-hover:shadow-lg transition-shadow">
                                    <img src="/purple_dashboard.png" alt="Payroll" className="w-full h-full object-cover object-left-top hover:scale-110 transition-transform duration-700" />
                                </div>
                            </div>
                        </motion.div>

                        {/* 4. Recruitment (Wide - 8 cols) */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInRight}
                            transition={{ delay: 0.4 }}
                            className="md:col-span-8 group relative rounded-[3rem] bg-gradient-to-r from-slate-50 to-white border border-slate-100 overflow-hidden shadow-xl"
                        >
                            <div className="flex flex-col md:flex-row h-full">
                                <div className="p-10 flex-1 flex flex-col justify-center relative z-10">
                                    <div className="w-12 h-12 rounded-2xl bg-[#663399]/10 flex items-center justify-center text-[#663399] mb-4">
                                        <Briefcase size={24} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Recruitment Pipeline</h3>
                                    <p className="text-slate-600 mb-6">Drag-and-drop candidates through stages. Send offers in seconds.</p>
                                    <button className="self-start text-sm font-bold text-[#663399] flex items-center gap-2 hover:gap-3 transition-all">
                                        View Pipeline <ArrowRight size={16} />
                                    </button>
                                </div>
                                <div className="flex-1 relative h-64 md:h-auto overflow-hidden">
                                    {/* Tilted Card Effect */}
                                    <div className="absolute top-10 left-0 w-[120%] h-[120%] bg-white rounded-tl-[2rem] shadow-[-20px_20px_60px_rgba(0,0,0,0.1)] border-l border-t border-slate-100 overflow-hidden transform rotate-[-3deg] transition-transform group-hover:rotate-[0deg] duration-500">
                                        <img src="/purple_task.png" alt="Recruitment Board" className="w-full h-full object-cover object-left-top" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* WRAPPED FEATURES SECTION - for Navigation */}
            <div id="features" className="scroll-mt-24">
                <section className="py-24 bg-white overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            {/* Content */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeInLeft}
                                className="order-2 lg:order-1"
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E6C7E6]/30 text-[#663399] font-bold text-xs uppercase tracking-wider mb-6">
                                    <Sparkles size={14} /> Recruitment Suite
                                </div>
                                <h2 className="text-4xl lg:text-5xl font-bold text-[#2E1A47] mb-6 leading-tight">
                                    Hire the best talent, <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#663399] to-[#A3779D]">twice as fast.</span>
                                </h2>
                                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                    Our built-in Applicant Tracking System (ATS) simplifies the entire hiring process. From one-click job postings to automated offer letters.
                                </p>

                                <ul className="space-y-4 mb-10">
                                    {[
                                        "Visual Kanban Board for candidate tracking",
                                        "Automated email triggers for interview scheduling",
                                        "Resume parsing and smart-search",
                                        "One-click Offer Letter generation"
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-[#663399] flex items-center justify-center text-white">
                                                <Check size={14} strokeWidth={3} />
                                            </div>
                                            <span className="text-slate-700 font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button className="px-6 py-3 bg-[#2E1A47] text-white font-semibold rounded-xl hover:bg-[#663399] transition-all flex items-center gap-2 shadow-lg hover:shadow-[#663399]/25">
                                    Explore ATS Features <ArrowRight size={18} />
                                </button>
                            </motion.div>

                            {/* Image / Visual */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeInRight}
                                className="order-1 lg:order-2 relative"
                            >

                                <div className="relative rounded-3xl overflow-hidden border-[8px] border-slate-100 shadow-2xl bg-slate-50">
                                    <img src="/purple_task.png" alt="ATS Interface" className="w-full h-auto object-cover" />

                                    {/* Overlay Card */}
                                    <div className="absolute bottom-6 left-6 p-4 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/50 max-w-xs">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600"><CheckCircle2 size={16} /></div>
                                            <span className="text-sm font-bold text-slate-800">Offer Sent!</span>
                                        </div>
                                        <p className="text-xs text-slate-500">Candidate moved to 'Hired' stage automatically.</p>
                                    </div>
                                </div>
                                {/* Decor */}
                                <div className="absolute -z-10 top-[-20%] right-[-20%] w-72 h-72 bg-[#E6C7E6] rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Deep Dive Feature 2: Templates & Documents */}
                <section className="py-24 bg-slate-50 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">

                            {/* Image / Visual */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeInLeft}
                                className="relative"
                            >
                                <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white border border-slate-200 p-2 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                                    <img src="/purple_dashboard.png" alt="Document Templates" className="w-full h-auto rounded-2xl object-cover grayscale-[10%]" />
                                </div>
                                {/* Floating Elements */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -right-8 top-10 p-5 bg-[#2E1A47] text-white rounded-2xl shadow-xl z-10"
                                >
                                    <Briefcase size={24} className="mb-2 text-[#E6C7E6]" />
                                    <div className="font-bold">Offer Letter.pdf</div>
                                    <div className="text-xs text-white/60">Generated in 2s</div>
                                </motion.div>
                            </motion.div>

                            {/* Content */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeInRight}
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#A3779D]/10 text-[#A3779D] font-bold text-xs uppercase tracking-wider mb-6">
                                    <CreditCard size={14} /> Document Engine
                                </div>
                                <h2 className="text-4xl lg:text-5xl font-bold text-[#2E1A47] mb-6 leading-tight">
                                    Professional Templates, <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A3779D] to-[#663399]">Ready to Use.</span>
                                </h2>
                                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                    Never start from scratch again. Choose from our library of lawyer-approved HR templates or upload your own.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                        <h4 className="font-bold text-[#2E1A47] mb-2 flex items-center gap-2"> <FileText size={18} className="text-[#A3779D]" /> 50+ Templates</h4>
                                        <p className="text-sm text-slate-500">Contracts, Offer Letters, Warning Notices, and more.</p>
                                    </div>
                                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                        <h4 className="font-bold text-[#2E1A47] mb-2 flex items-center gap-2"> <Zap size={18} className="text-[#A3779D]" /> Auto-Fill</h4>
                                        <p className="text-sm text-slate-500">Automatically populate employee data into any document.</p>
                                    </div>
                                </div>

                                <button className="text-[#663399] font-bold text-lg flex items-center gap-2 hover:gap-4 transition-all group">
                                    View Template Library <ArrowRight size={20} className="group-hover:text-[#2E1A47]" />
                                </button>
                            </motion.div>

                        </div>
                    </div>
                </section>
            </div>

            {/* Target Audience - Glass Cards */}
            <section className="py-32 bg-[#2E1A47] relative overflow-hidden">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
                    <motion.h2
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="text-3xl font-bold mb-16 text-white tracking-wider uppercase opacity-80"
                    >
                        Trusted By Teams Of All Sizes
                    </motion.h2>
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="flex flex-wrap justify-center gap-8"
                    >
                        {[
                            { icon: Building2, label: "Enterprises", desc: "Scalable at every level." },
                            { icon: Smartphone, label: "Startups", desc: "Move fast, stay organized." },
                            { icon: LayoutDashboard, label: "Agencies", desc: "Manage multiple clients." },
                            { icon: UserCheck, label: "HR Admins", desc: "Your daily command center." },
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                variants={zoomIn}
                                whileHover={{ y: -10, rotateX: 5, rotateY: 5 }}
                                className="flex flex-col items-center justify-center p-10 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 w-64 aspect-square hover:bg-white/10 transition-all shadow-2xl"
                            >
                                <div className="p-4 rounded-2xl bg-[#A3779D]/20 mb-6 text-[#E6C7E6]">
                                    <item.icon size={40} />
                                </div>
                                <span className="text-xl font-bold text-white mb-2">{item.label}</span>
                                <span className="text-sm text-slate-400">{item.desc}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Why Choose Us - Enhanced Visuals */}
            <section id="testimonials" className="py-24 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInLeft}
                        >
                            <h2 className="text-5xl font-extrabold text-[#2E1A47] mb-8 leading-tight">Why top companies <br /> choose <span className="text-[#663399]">HRMPro?</span></h2>
                            <div className="space-y-8">
                                {[
                                    { title: "Incredibly Easy to Use", desc: "Zero learning curve. Designed for humans, not robots." },
                                    { title: "Bank-Grade Security", desc: "Enterprise-level encryption keeps your data safe." },
                                    { title: "Infinite Scalability", desc: "From 10 to 10,000 employees without a hitch." },
                                ].map((feat, idx) => (
                                    <div key={idx} className="flex gap-6 group">
                                        <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#663399] group-hover:text-white transition-all duration-300 shadow-sm shrink-0 font-bold text-xl">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-bold text-slate-900 mb-2">{feat.title}</h4>
                                            <p className="text-slate-600 text-lg">{feat.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Interactive Visual */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={zoomIn}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#E6C7E6] to-[#A3779D] blur-[100px] opacity-20 animate-pulse"></div>
                            <div className="bg-white rounded-[3rem] p-12 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 relative z-10">
                                {/* Animated Rings */}
                                <div className="absolute top-10 right-10 w-20 h-20 border-[3px] border-[#E6C7E6] rounded-full opacity-50 animate-bounce"></div>
                                <div className="absolute bottom-10 left-10 w-32 h-32 border-[4px] border-[#A3779D]/20 rounded-full animate-pulse"></div>

                                <div className="text-center space-y-10 relative z-20">
                                    <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 inline-block shadow-inner">
                                        <div className="text-6xl font-black text-[#663399] mb-2">99.9%</div>
                                        <div className="text-slate-500 font-semibold uppercase tracking-wider text-sm">Uptime Guarantee</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-6 rounded-2xl bg-[#E6C7E6]/20">
                                            <div className="text-3xl font-bold text-[#2E1A47] mb-1">24/7</div>
                                            <div className="text-xs text-slate-600 font-medium">Support</div>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-[#E6C7E6]/20">
                                            <div className="text-3xl font-bold text-[#2E1A47] mb-1">50+</div>
                                            <div className="text-xs text-slate-600 font-medium">Integrations</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Final CTA - Dynamic Background */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[#663399]">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#663399] to-[#2E1A47]"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="absolute -top-[50%] -left-[20%] w-[150%] h-[150%] bg-gradient-to-tr from-transparent via-[#A3779D]/30 to-transparent animate-blob"></div>
                </div>

                <div className="max-w-4xl mx-auto px-6 text-center text-white relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">Ready to transform?</h2>
                        <p className="text-xl text-[#E6C7E6] mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                            Join thousands of forward-thinking companies building better workplaces with HRMPro.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <button onClick={() => navigate('/register')} className="px-12 py-5 bg-white text-[#663399] font-bold rounded-2xl shadow-2xl hover:bg-slate-100 hover:scale-105 transition-all text-xl ring-4 ring-white/30">
                                Start Free Trial
                            </button>
                            <button onClick={() => window.open('mailto:demo@hrmpro.com')} className="px-12 py-5 bg-white/10 backdrop-blur-md border border-white/30 text-white font-bold rounded-2xl hover:bg-white/20 transition-all text-xl">
                                Book a Demo
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#2E1A47] text-slate-400 py-12 border-t border-[#A3779D]/20">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <span className="text-2xl font-bold text-white mb-4 block">HRMPro</span>
                        <p className="max-w-sm mb-6 text-slate-300">Building the future of work, one automated task at a time.</p>
                        <div className="flex gap-4">
                            {/* Social Placeholders */}
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#663399] hover:text-white transition-colors cursor-pointer"><Globe size={20} /></div>
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#663399] hover:text-white transition-colors cursor-pointer"><Users size={20} /></div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Product</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-[#E6C7E6] transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-[#E6C7E6] transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-[#E6C7E6] transition-colors">Integrations</a></li>
                            <li><a href="#" className="hover:text-[#E6C7E6] transition-colors">Updates</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Company</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-[#E6C7E6] transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-[#E6C7E6] transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-[#E6C7E6] transition-colors">Contact</a></li>
                            <li><a href="#" className="hover:text-[#E6C7E6] transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-12 pt-8 border-t border-[#A3779D]/20 text-sm text-center">
                    &copy; 2026 HRMPro Inc. All rights reserved.
                </div>
            </footer>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
};

export default Home;
