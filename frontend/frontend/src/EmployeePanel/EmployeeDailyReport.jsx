import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    FaClipboardList, FaCheckCircle, FaClock,
    FaCalendarAlt, FaBullhorn, FaTimesCircle, FaHistory, FaTasks, FaStickyNote, FaProjectDiagram, FaHeading
} from "react-icons/fa";
import toast from "react-hot-toast";
import * as dailyReportService from "../services/dailyReportService";
import { EMP_THEME } from "./theme";

const EmployeeDailyReport = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        project: "",
        title: "",
        taskDetails: "",
        status: "In Progress",
        remarks: "",
        actualHours: 0
    });

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await dailyReportService.getMyReports();
            if (response.data?.success) {
                setReports(response.data.data.reports || []);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.project.trim()) return toast.error("Please fill required fields");

        try {
            const formData = new FormData();
            Object.keys(form).forEach(key => {
                if (key === 'document') {
                    if (form.document) formData.append('document', form.document);
                } else {
                    formData.append(key, form[key]);
                }
            });
            formData.append('date', new Date().toISOString());

            await dailyReportService.createDailyReport(formData);
            toast.success("Report Submitted Successfully!");
            setForm({
                project: "",
                title: "",
                taskDetails: "",
                status: "In Progress",
                remarks: "",
                actualHours: 0,
                document: null
            });
            // Clear file input manually if needed, though react state handled it
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = "";

            fetchReports();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to submit report");
        }
    };

    // --- Helpers ---
    const getBadgeStyle = (status) => {
        switch (status) {
            case 'Completed': return `bg-emerald-100 text-emerald-700 border-l-4 border-l-emerald-500`;
            case 'In Progress': return `bg-purple-100 text-purple-700 border-l-4`; // Purple for in progress
            case 'Pending': return `bg-amber-100 text-amber-700 border-l-4 border-l-amber-500`;
            default: return "bg-gray-100 text-gray-600";
        }
    };

    const getTimingBadge = () => {
        return "bg-violet-100 text-violet-700";
    };

    const getCardBorderColor = (status) => {
        switch (status) {
            case 'Completed': return "#10B981"; // Emerald 500
            case 'In Progress': return EMP_THEME.royalAmethyst;
            case 'Pending': return "#F59E0B"; // Amber 500
            default: return "#D1D5DB"; // Gray 300
        }
    }

    return (
        <div className="min-h-screen p-4 md:p-8 font-sans" style={{ backgroundColor: EMP_THEME.lilacMist, color: EMP_THEME.midnightPlum }}>
            <div className="max-w-7xl mx-auto space-y-8">

                {/* --- Header --- */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b"
                    style={{ borderColor: `${EMP_THEME.softViolet}40` }}
                >
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3" style={{ color: EMP_THEME.midnightPlum }}>
                            <span className="text-white p-3 rounded-2xl shadow-lg" style={{ background: `linear-gradient(135deg, ${EMP_THEME.royalAmethyst}, ${EMP_THEME.softViolet})` }}>
                                <FaClipboardList size={24} />
                            </span>
                            Daily Activity Log
                        </h1>
                        <p className="mt-2 text-lg font-medium" style={{ color: EMP_THEME.softViolet }}>Capture your progress, blockers, and wins.</p>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: `${EMP_THEME.midnightPlum}80` }}>Today's Date</p>
                        <p className="text-xl font-bold" style={{ color: EMP_THEME.midnightPlum }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* --- LEFT COL: Submission Form --- */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-4 sticky top-8"
                    >
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden relative" style={{ boxShadow: `0 20px 25px -5px ${EMP_THEME.royalAmethyst}20` }}>
                            <div className="h-2 w-full" style={{ background: `linear-gradient(to right, ${EMP_THEME.royalAmethyst}, ${EMP_THEME.softViolet})` }}></div>
                            <div className="p-6 md:p-8">
                                <h2 className="text-xl font-bold mb-2 flex items-center gap-2" style={{ color: EMP_THEME.midnightPlum }}>
                                    <FaBullhorn style={{ color: EMP_THEME.royalAmethyst }} />
                                    New Working Update
                                </h2>
                                <p className="text-xs text-rose-500 font-bold mb-6 flex items-center gap-1 bg-rose-50 p-2 rounded-lg border border-rose-100">
                                    <FaClock /> Note: Submissions are required every 2 hours.
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Timing Info - Read Only */}
                                    <div>
                                        <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl p-3 mb-2">
                                            <span className="text-xs font-bold text-blue-800 uppercase tracking-wide flex items-center gap-2">
                                                <FaClock /> Report Type
                                            </span>
                                            <span className="text-sm font-bold text-blue-600">
                                                Periodic Update
                                            </span>
                                        </div>
                                    </div>

                                    {/* Project & Title */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                                            <FaProjectDiagram /> Project
                                        </label>
                                        <input
                                            type="text"
                                            name="project"
                                            value={form.project}
                                            onChange={handleChange}
                                            placeholder="e.g. HRM Portal"
                                            required
                                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-sm font-medium focus:bg-white focus:border-indigo-500 outline-none transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                                            <FaHeading /> Task Title
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={form.title}
                                            onChange={handleChange}
                                            placeholder="e.g. API Integration"
                                            required
                                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-sm font-medium focus:bg-white focus:border-indigo-500 outline-none transition-colors"
                                        />
                                    </div>

                                    {/* Task Details */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                                            <FaTasks /> Task Details <span className="text-red-400">*</span>
                                        </label>
                                        <textarea
                                            name="taskDetails"
                                            rows="4"
                                            required
                                            value={form.taskDetails}
                                            onChange={handleChange}
                                            placeholder="Detailed description of work done..."
                                            className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-700 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none text-sm font-medium leading-relaxed"
                                        ></textarea>
                                    </div>

                                    {/* Upload Field - NEW */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                                            <FaStickyNote /> Upload Work Proof
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                onChange={(e) => setForm({ ...form, document: e.target.files[0] })}
                                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border-2 border-dashed border-slate-200 rounded-xl p-2 hover:border-blue-400 transition-colors"
                                                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.zip,.rar"
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1 font-medium ml-1">
                                            Allowed: Images, Documents, Zip Files. Max 50MB.
                                        </p>
                                    </div>

                                    {/* Status & Hours */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 block">Status</label>
                                            <select
                                                name="status"
                                                value={form.status}
                                                onChange={handleChange}
                                                className="w-full px-3 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-sm font-semibold focus:bg-white focus:border-indigo-500 outline-none"
                                            >
                                                <option>In Progress</option>
                                                <option>Completed</option>
                                                <option>Pending</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1"><FaClock /> Hours</label>
                                            <input
                                                type="number"
                                                name="actualHours"
                                                value={form.actualHours}
                                                onChange={handleChange}
                                                min="0"
                                                step="0.5"
                                                className="w-full px-3 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-sm font-semibold focus:bg-white focus:border-indigo-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Remarks */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                                            <FaStickyNote /> Remarks
                                        </label>
                                        <input
                                            type="text"
                                            name="remarks"
                                            value={form.remarks}
                                            onChange={handleChange}
                                            placeholder="Optional notes..."
                                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-sm font-medium focus:bg-white focus:border-indigo-500 outline-none transition-colors"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                        style={{ backgroundColor: EMP_THEME.royalAmethyst }}
                                    >
                                        <FaCheckCircle className="text-emerald-400" /> Submit Entry
                                    </button>
                                </form>
                            </div>
                        </div>
                    </motion.div>

                    {/* --- RIGHT COL: History --- */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-8 space-y-6"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-bold flex items-center gap-3" style={{ color: EMP_THEME.midnightPlum }}>
                                <span className="p-2 bg-white rounded-lg shadow-sm text-slate-500"><FaHistory /></span>
                                Recent History
                            </h2>
                            <span className="bg-white px-4 py-1.5 rounded-full text-xs font-bold text-slate-500 border border-slate-200 shadow-sm">
                                {reports.length} Entries
                            </span>
                        </div>

                        {loading ? (
                            <div className="h-64 bg-white rounded-3xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 animate-pulse">
                                Loading records...
                            </div>
                        ) : reports.length === 0 ? (
                            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center">
                                <div className="bg-slate-50 p-6 rounded-full mb-4">
                                    <FaTimesCircle size={40} className="text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-700">No reports yet</h3>
                                <p className="text-slate-400 max-w-xs mx-auto mt-1">Your submitted daily reports will appear here in chronological order.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reports.map((report) => (
                                    <motion.div
                                        key={report._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-shadow relative overflow-hidden group border-l-[6px]"
                                        style={{ borderLeftColor: getCardBorderColor(report.status), borderColor: '#f1f5f9' }}
                                    >
                                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wide ${getTimingBadge(report.submissionTiming)}`}>
                                                    {report.submissionTiming || 'Daily Update'}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                    <FaCalendarAlt /> {new Date(report.date).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                    <FaClock /> {new Date(report.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {report.project && (
                                                    <span className="flex items-center gap-1.5 text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                                                        <FaProjectDiagram /> {report.project}
                                                    </span>
                                                )}
                                            </div>

                                            <div
                                                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getBadgeStyle(report.status)}`}
                                                style={report.status === 'In Progress' ? { backgroundColor: `${EMP_THEME.royalAmethyst}20`, color: EMP_THEME.royalAmethyst, borderLeftColor: EMP_THEME.royalAmethyst } : {}}
                                            >
                                                {report.status}
                                            </div>
                                        </div>

                                        <div className="pl-0 md:pl-2">
                                            <h4 className="font-bold text-slate-800 text-lg mb-2">{report.title}</h4>
                                            <p className="text-slate-600 text-sm leading-7 font-medium whitespace-pre-wrap bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                {report.taskDetails || report.remarks}
                                            </p>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-start justify-between gap-2">
                                            {report.remarks && (
                                                <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                                                    <FaStickyNote className="text-amber-400" /> <span className="font-bold text-slate-700">Note:</span> {report.remarks}
                                                </p>
                                            )}
                                            {report.actualHours > 0 && (
                                                <span className="text-xs font-bold text-slate-400 flex items-center gap-1 ml-auto">
                                                    <FaClock /> {report.actualHours} hrs
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default EmployeeDailyReport;