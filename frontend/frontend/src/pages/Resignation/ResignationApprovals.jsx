import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, FileText, User, Calendar, Download } from 'lucide-react';
import resignationService from '../../services/resignationService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const ResignationApprovals = () => {
    const { user } = useAuth();
    const [resignations, setResignations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedResignation, setSelectedResignation] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedLWD, setSelectedLWD] = useState('');

    // Determine effective role for viewing approvals
    // Logic: Admin/HR -> Admin View
    // Manager Role OR Position 'Manager' -> Manager View
    // Team Lead Role OR Position 'TL'/'Lead' -> TL View
    const getEffectiveRole = () => {
        if (!user) return '';
        const role = (user.role || '').toLowerCase();
        const pos = (user.position || '').toLowerCase();

        if (role === 'admin' || role === 'hr') return 'admin';
        if (role === 'manager' || pos.includes('manager')) return 'manager';
        if (role === 'teamlead' || pos.includes('lead') || pos.includes('tl')) return 'teamlead';

        return role;
    };

    const effectiveRole = getEffectiveRole();

    useEffect(() => {
        if (effectiveRole) {
            fetchResignations(effectiveRole);
        }
    }, [effectiveRole]);

    const fetchResignations = async (role) => {
        try {
            let data;
            // Admins can see manager view + potentially others if we added admin specific endpoint, 
            // but for now admins/managers see the manager list (final approval before Notice)
            if (role === 'teamlead') {
                data = await resignationService.getTLResignations();
            } else if (role === 'admin' || role === 'hr') {
                data = await resignationService.getHRResignations();
            } else {
                data = await resignationService.getManagerResignations();
            }
            setResignations(data.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load resignations');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, lwd) => {
        if (!window.confirm('Are you sure you want to approve this resignation?')) return;
        try {
            if (effectiveRole === 'teamlead') {
                // TL Approval
                await resignationService.approveResignationByTL(id, "Approved by TL");
                toast.success('Resignation Approved by TL. Sent to Manager.');
            } else {
                // Manager/Admin Approval (Admin can bypass)
                await resignationService.approveResignation(id, lwd);
                toast.success('Resignation Approved and Notice Period Started');
            }
            setResignations(prev => prev.filter(r => r.employeeId !== id));
            setShowDetailsModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve');
        }
    };

    const handleReject = async () => {
        if (!rejectReason) return toast.error('Reason is required');
        try {
            if (effectiveRole === 'teamlead') {
                await resignationService.rejectResignationByTL(selectedResignation.employeeId, rejectReason);
            } else {
                await resignationService.rejectResignation(selectedResignation.employeeId, rejectReason);
            }
            toast.success('Resignation Rejected');
            setResignations(prev => prev.filter(r => r.employeeId !== selectedResignation.employeeId));
            setShowRejectModal(false);
            setSelectedResignation(null);
            setRejectReason('');
        } catch (error) {
            toast.error('Failed to reject');
        }
    };

    const openDetails = (emp) => {
        setSelectedResignation(emp);
        const lwd = emp.resignationData.requestedLWD
            ? new Date(emp.resignationData.requestedLWD).toISOString().split('T')[0]
            : '';
        setSelectedLWD(lwd);
        setShowDetailsModal(true);
    };

    // Helper to get status label
    const getStatusLabel = (emp) => {
        if (emp.resignationData.domainTLApprovalStatus === 'Pending') return 'Pending TL Approval';
        if (emp.resignationData.managerApprovalStatus === 'Pending') return 'Pending Manager Approval';
        if (emp.resignationData.domainTLApprovalStatus === 'Not Required' && emp.resignationData.managerApprovalStatus === 'Not Required') return 'Pending Admin Approval (Manager)';
        return 'Pending';
    };

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-8 bg-[#fdfbff] min-h-screen">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-10"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div style={{ width: 4, height: 28, backgroundColor: '#663399', borderRadius: 4 }}></div>
                    <h1 className="text-3xl font-black text-[#2E1A47] tracking-tight">
                        Service Separation Terminal
                    </h1>
                </div>
                <p className="text-[#A3779D] font-semibold">Review and authorize agent decommissioning protocols.</p>
            </motion.div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {resignations.map(emp => (
                    <motion.div
                        key={emp.employeeId}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white p-6 rounded-[24px] shadow-[0_10px_30px_-10px_rgba(102,51,153,0.1)] border border-[#E6C7E6] hover:shadow-[0_20px_50px_-15px_rgba(102,51,153,0.15)] transition-all cursor-pointer group"
                        onClick={() => openDetails(emp)}
                    >
                        <div className="flex justify-between items-start mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-[#f3e8ff] flex items-center justify-center text-[#663399] font-black border border-[#E6C7E6]">
                                    {emp.firstName[0]}{emp.lastName[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#2E1A47] group-hover:text-[#663399] transition-colors">{emp.firstName} {emp.lastName}</h3>
                                    <p className="text-[#A3779D] text-xs font-bold uppercase tracking-wider">{emp.position}</p>
                                </div>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusLabel(emp).includes('TL')
                                    ? 'bg-[#fffbeb] text-[#D97706] border-[#fef08a]'
                                    : 'bg-[#f3e8ff] text-[#663399] border-[#E6C7E6]'
                                }`}>
                                {getStatusLabel(emp)}
                            </span>
                        </div>

                        <div className="space-y-4 text-sm mb-6">
                            <div className="bg-[#fdfbff] p-3 rounded-xl border border-[#f1f5f9]">
                                <span className="text-[10px] font-black text-[#663399] uppercase block mb-1">Stated Rationale</span>
                                <p className="text-[#2E1A47] font-semibold line-clamp-2">{emp.resignationData.reason}</p>
                            </div>
                            <div className="flex items-center gap-2 text-[#A3779D] font-bold text-xs uppercase tracking-wider">
                                <Calendar size={14} /> Requested Final Operational Date: <span className="text-[#663399]">{new Date(emp.resignationData.requestedLWD).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-[#f1f5f9]">
                            <button className="text-[#663399] text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                                Analyze Protocol <FileText size={14} />
                            </button>
                        </div>
                    </motion.div>
                ))}
                {resignations.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-20 bg-white rounded-[32px] border-2 border-dashed border-[#E6C7E6] shadow-inner">
                        <div className="w-20 h-20 rounded-full bg-[#fdfbff] flex items-center justify-center mb-6">
                            <Check className="text-[#663399] w-10 h-10" />
                        </div>
                        <p className="text-[#2E1A47] text-xl font-black">Archive Clear</p>
                        <p className="text-[#A3779D] font-semibold mt-2">No pending decommissioning directives in current terminal access.</p>
                        <div className="mt-6 px-4 py-1.5 bg-[#f3e8ff] rounded-lg text-[10px] font-black text-[#663399] uppercase tracking-widest">
                            Authorized as: {effectiveRole.toUpperCase()}
                        </div>
                    </div>
                )}
            </div>

            {/* Details Modal */}
            <AnimatePresence>
                {showDetailsModal && selectedResignation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#2E1A47]/40 backdrop-blur-md flex items-center justify-center z-[1000] p-4"
                        onClick={(e) => { if (e.target === e.currentTarget) setShowDetailsModal(false); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-[40px] shadow-[0_50px_100px_-20px_rgba(46,26,71,0.3)] w-full max-w-2xl overflow-hidden border border-[#E6C7E6]"
                        >
                            <div className="p-10 border-b bg-[#fdfbff] flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div style={{ width: 4, height: 24, backgroundColor: '#663399', borderRadius: 4 }}></div>
                                    <h2 className="text-2xl font-black text-[#2E1A47] tracking-tight">Full Strategic Analysis</h2>
                                </div>
                                <button onClick={() => setShowDetailsModal(false)} className="p-3 hover:bg-[#f3e8ff] hover:text-[#663399] rounded-2xl transition-all text-[#A3779D]"><X className="w-6 h-6" /></button>
                            </div>
                            <div className="p-10 space-y-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-[#663399] rounded-3xl flex items-center justify-center text-2xl font-black text-white shadow-lg rotate-3 group-hover:rotate-0 transition-all">
                                        {selectedResignation.firstName[0]}{selectedResignation.lastName[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-[#2E1A47]">{selectedResignation.firstName} {selectedResignation.lastName}</h3>
                                        <p className="text-[#A3779D] font-bold uppercase tracking-wider text-sm">{selectedResignation.position} • <span className="text-[#663399]">{selectedResignation.department}</span></p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6 bg-[#fdfbff] p-8 rounded-[32px] border border-[#E6C7E6]">
                                    <div>
                                        <label className="text-[10px] font-black text-[#663399] uppercase tracking-widest block mb-1">Primary Rationale</label>
                                        <p className="font-bold text-[#2E1A47] text-lg">{selectedResignation.resignationData.reason}</p>
                                    </div>
                                    <div className="pt-4 border-t border-[#f1f5f9]">
                                        <label className="text-[10px] font-black text-[#663399] uppercase tracking-widest block mb-2">Authorize Operational End Date</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                className="w-full bg-white border-2 border-[#f1f5f9] rounded-2xl px-5 py-3 font-bold text-[#2E1A47] focus:border-[#663399] focus:bg-white outline-none transition-all shadow-sm"
                                                value={selectedLWD}
                                                onChange={(e) => setSelectedLWD(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-[#f1f5f9]">
                                        <label className="text-[10px] font-black text-[#663399] uppercase tracking-widest block mb-1">Agent Intelligence Comments</label>
                                        <p className="text-[#2E1A47] font-semibold leading-relaxed">{selectedResignation.resignationData.comments || 'No supplementary data provided.'}</p>
                                    </div>
                                    {selectedResignation.resignationData.attachmentUrl && (
                                        <div className="pt-4 border-t border-[#f1f5f9]">
                                            <a
                                                href={selectedResignation.resignationData.attachmentUrl.startsWith('http')
                                                    ? selectedResignation.resignationData.attachmentUrl
                                                    : `http://localhost:5000${selectedResignation.resignationData.attachmentUrl}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-3 text-[#663399] border-2 border-[#E6C7E6] bg-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#663399] hover:text-white hover:border-[#663399] transition-all"
                                            >
                                                <Download size={14} /> Strategic Separation Letter
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        onClick={() => handleApprove(selectedResignation.employeeId, selectedLWD)}
                                        className="flex-[2] bg-[#663399] hover:bg-[#2E1A47] text-white font-black uppercase text-xs tracking-widest py-4 rounded-2xl shadow-xl shadow-purple-200 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Check size={18} />
                                        {effectiveRole === 'teamlead' ? 'Authorize & Escalate' :
                                            (effectiveRole === 'admin' && selectedResignation.resignationData.domainTLApprovalStatus === 'Pending') ? 'Protocol Override' :
                                                'Authorize Decommissioning'}
                                    </button>
                                    <button
                                        onClick={() => { setShowRejectModal(true); setShowDetailsModal(false); }}
                                        className="flex-1 bg-white border-2 border-[#E6C7E6] text-[#DC2626] hover:bg-[#fee2e2] hover:border-[#DC2626] font-black uppercase text-xs tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                                    >
                                        <X size={18} /> Reject
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reject Modal */}
            <AnimatePresence>
                {showRejectModal && (
                    <div className="fixed inset-0 bg-[#2E1A47]/60 backdrop-blur-md flex items-center justify-center z-[1100] p-4">
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white p-10 rounded-[40px] max-w-md w-full shadow-[0_50px_100px_-20px_rgba(220,38,38,0.2)] border border-[#E6C7E6]"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div style={{ width: 4, height: 24, backgroundColor: '#DC2626', borderRadius: 4 }}></div>
                                <h3 className="text-2xl font-black text-[#2E1A47]">Deny Protocol</h3>
                            </div>
                            <p className="text-sm text-[#A3779D] font-bold mb-6">Specify the strategic reason for denying this decommission request. Agent will be briefed.</p>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="State termination denial rationale..."
                                className="w-full bg-[#fdfbff] border-2 border-[#f1f5f9] rounded-[24px] p-5 h-40 font-semibold text-[#2E1A47] focus:border-[#DC2626] outline-none transition-all resize-none mb-6"
                            />
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setShowRejectModal(false)} className="px-6 py-3 text-[#A3779D] hover:bg-[#f1f5f9] rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">Cancel</button>
                                <button onClick={handleReject} className="px-6 py-3 bg-[#DC2626] text-white rounded-2xl hover:bg-[#991b1b] font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-100 transition-all">Deny Protocol</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
export default ResignationApprovals;
