import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, FileText, Calendar, Clock, User } from 'lucide-react';
import { leaveService } from '../services/leaveService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const LeaveApprovals = () => {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Determine effective role for viewing approvals
    const getEffectiveRole = () => {
        if (!user) return '';
        const role = (user.role || '').toLowerCase();
        const pos = (user.position || '').toLowerCase();

        if (role === 'admin' || role === 'hr') return 'hr'; // HR acts as final approver or admin
        if (role === 'manager' || pos.includes('manager')) return 'manager';
        if (role === 'teamlead' || pos.includes('lead') || pos.includes('tl')) return 'teamlead';

        return role; // 'employee'
    };

    const effectiveRole = getEffectiveRole();

    useEffect(() => {
        if (effectiveRole) {
            fetchLeaves();
        }
    }, [effectiveRole]);

    const fetchLeaves = async () => {
        try {
            // Fetch ALL pending leaves
            // Ideally backend should filter, but for now we filter on frontend
            // Fetch ALL pending leaves assigned to this approver
            const response = await leaveService.getLeaves({ status: 'Pending', view: 'approvals' });
            if (response.data.status === 'success') {
                const allPending = response.data.data.leaves;

                // Filter based on Role and Stage
                const filtered = allPending.filter(l => {
                    if (effectiveRole === 'teamlead') {
                        return l.currentStage === 'TeamLead';
                    }
                    if (effectiveRole === 'manager') {
                        return l.currentStage === 'Manager';
                    }
                    if (effectiveRole === 'hr') {
                        return l.currentStage === 'HR';
                    }
                    if (effectiveRole === 'admin') {
                        return l.currentStage === 'Admin' || l.currentStage === 'HR'; // Admin might see HR stage too if they override
                    }
                    return false;
                });
                setLeaves(filtered);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load leave requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (leave) => {
        if (!window.confirm(`Approve leave for ${leave.employee?.firstName || leave.user?.firstName}?`)) return;

        try {
            // Determine stage based on current role/stage logic
            // But controller takes care of moving it specific to stage?
            // Controller checks logic: if currentStage === 'TeamLead' -> update TL status -> move to Manager
            // So we just call approveLeave.

            await leaveService.approveLeave(leave._id);
            toast.success('Leave Request Approved');

            // Remove from list
            setLeaves(prev => prev.filter(l => l._id !== leave._id));
            setShowDetailsModal(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to approve leave');
        }
    };

    const handleReject = async () => {
        if (!rejectReason) return toast.error('Reason is required');
        try {
            await leaveService.rejectLeave(selectedLeave._id, { rejectionReason: rejectReason });
            toast.success('Leave Request Rejected');
            setLeaves(prev => prev.filter(l => l._id !== selectedLeave._id));
            setShowRejectModal(false);
            setSelectedLeave(null);
            setRejectReason('');
        } catch (error) {
            console.error(error);
            toast.error('Failed to reject leave');
        }
    };

    const openDetails = (leave) => {
        setSelectedLeave(leave);
        setShowDetailsModal(true);
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://localhost:5000/${path.replace(/\\/g, '/')}`;
    };

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-0">
            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {leaves.map(leave => {
                    const emp = leave.employee || leave.user || {};
                    return (
                        <motion.div
                            key={leave._id}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white p-6 rounded-[24px] shadow-[0_10px_30px_-10px_rgba(102,51,153,0.1)] border border-[#E6C7E6] hover:shadow-[0_20px_50px_-15px_rgba(102,51,153,0.15)] transition-all cursor-pointer group"
                            onClick={() => openDetails(leave)}
                        >
                            <div className="flex justify-between items-start mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-[#f3e8ff] flex items-center justify-center text-[#663399] font-black border border-[#E6C7E6] overflow-hidden">
                                        {emp.profileImage ? (
                                            <img src={getImageUrl(emp.profileImage)} alt="profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{emp.firstName?.[0]}{emp.lastName?.[0]}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[#2E1A47] group-hover:text-[#663399] transition-colors">{emp.firstName} {emp.lastName}</h3>
                                        <p className="text-[#A3779D] text-xs font-bold uppercase tracking-wider">{emp.position || 'Employee'}</p>
                                    </div>
                                </div>
                                <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-[#fffbeb] text-[#D97706] border-[#fef08a]">
                                    {leave.leaveType}
                                </span>
                            </div>

                            <div className="space-y-4 text-sm mb-6">
                                <div className="bg-[#fdfbff] p-3 rounded-xl border border-[#f1f5f9]">
                                    <span className="text-[10px] font-black text-[#663399] uppercase block mb-1">Reason</span>
                                    <p className="text-[#2E1A47] font-semibold line-clamp-2">{leave.reason}</p>
                                </div>
                                <div className="flex items-center gap-2 text-[#A3779D] font-bold text-xs uppercase tracking-wider">
                                    <Calendar size={14} /> {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2 text-[#663399] font-bold text-xs uppercase tracking-wider">
                                    <Clock size={14} /> {leave.totalDays} Days Duration
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-[#f1f5f9]">
                                <button className="text-[#663399] text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                                    Review Request <FileText size={14} />
                                </button>
                            </div>
                        </motion.div>
                    )
                })}

                {leaves.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-20 bg-white rounded-[32px] border-2 border-dashed border-[#E6C7E6] shadow-inner">
                        <div className="w-20 h-20 rounded-full bg-[#fdfbff] flex items-center justify-center mb-6">
                            <Check className="text-[#663399] w-10 h-10" />
                        </div>
                        <p className="text-[#2E1A47] text-xl font-black">All Clear</p>
                        <p className="text-[#A3779D] font-semibold mt-2">No pending leave requests requiring your authorization.</p>
                        <div className="mt-6 px-4 py-1.5 bg-[#f3e8ff] rounded-lg text-[10px] font-black text-[#663399] uppercase tracking-widest">
                            Authorized as: {effectiveRole.toUpperCase()}
                        </div>
                    </div>
                )}
            </div>

            {/* Details Modal */}
            <AnimatePresence>
                {showDetailsModal && selectedLeave && (
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
                                    <h2 className="text-2xl font-black text-[#2E1A47] tracking-tight">Leave Request Analysis</h2>
                                </div>
                                <button onClick={() => setShowDetailsModal(false)} className="p-3 hover:bg-[#f3e8ff] hover:text-[#663399] rounded-2xl transition-all text-[#A3779D]"><X className="w-6 h-6" /></button>
                            </div>
                            <div className="p-10 space-y-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-3xl bg-[#f3e8ff] flex items-center justify-center text-[#663399] font-black border border-[#E6C7E6] overflow-hidden shadow-lg rotate-3 group-hover:rotate-0 transition-all">
                                        {(selectedLeave.employee?.profileImage || selectedLeave.user?.profileImage) ? (
                                            <img src={getImageUrl(selectedLeave.employee?.profileImage || selectedLeave.user?.profileImage)} alt="profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-2xl">{selectedLeave.employee?.firstName?.[0] || selectedLeave.user?.firstName?.[0]}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-[#2E1A47]">{selectedLeave.employee?.firstName || selectedLeave.user?.firstName} {selectedLeave.employee?.lastName || selectedLeave.user?.lastName}</h3>
                                        <p className="text-[#A3779D] font-bold uppercase tracking-wider text-sm">{selectedLeave.employee?.position || 'Employee'} • <span className="text-[#663399]">{selectedLeave.employee?.department || 'General'}</span></p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6 bg-[#fdfbff] p-8 rounded-[32px] border border-[#E6C7E6]">
                                    <div className="flex justify-between">
                                        <div>
                                            <label className="text-[10px] font-black text-[#663399] uppercase tracking-widest block mb-1">Leave Type</label>
                                            <p className="font-bold text-[#2E1A47] text-lg">{selectedLeave.leaveType}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-[#663399] uppercase tracking-widest block mb-1">Duration</label>
                                            <p className="font-bold text-[#2E1A47] text-lg">{selectedLeave.totalDays} Days</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-[#f1f5f9]">
                                        <label className="text-[10px] font-black text-[#663399] uppercase tracking-widest block mb-2">Dates</label>
                                        <div className="flex gap-4 font-bold text-[#2E1A47]">
                                            <span>{new Date(selectedLeave.startDate).toLocaleDateString()}</span>
                                            <span className="text-[#A3779D]">to</span>
                                            <span>{new Date(selectedLeave.endDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-[#f1f5f9]">
                                        <label className="text-[10px] font-black text-[#663399] uppercase tracking-widest block mb-1">Detailed Reason</label>
                                        <p className="text-[#2E1A47] font-semibold leading-relaxed">{selectedLeave.reason}</p>
                                    </div>

                                    {selectedLeave.documentUrl && (
                                        <div className="pt-4 border-t border-[#f1f5f9]">
                                            <a
                                                href={getImageUrl(selectedLeave.documentUrl)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-3 text-[#663399] border-2 border-[#E6C7E6] bg-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#663399] hover:text-white hover:border-[#663399] transition-all"
                                            >
                                                <FileText size={14} /> View Attached Document
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        onClick={() => handleApprove(selectedLeave)}
                                        className="flex-[2] bg-[#663399] hover:bg-[#2E1A47] text-white font-black uppercase text-xs tracking-widest py-4 rounded-2xl shadow-xl shadow-purple-200 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Check size={18} />
                                        Authorize Request
                                    </button>
                                    <button
                                        onClick={() => { setShowRejectModal(true); setShowDetailsModal(false); }}
                                        className="flex-1 bg-white border-2 border-[#E6C7E6] text-[#DC2626] hover:bg-[#fee2e2] hover:border-[#DC2626] font-black uppercase text-xs tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                                    >
                                        <X size={18} /> Deny
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
                                <h3 className="text-2xl font-black text-[#2E1A47]">Deny Request</h3>
                            </div>
                            <p className="text-sm text-[#A3779D] font-bold mb-6">Please specify the reason for denying this leave request. The employee will be notified.</p>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="State denial reason..."
                                className="w-full bg-[#fdfbff] border-2 border-[#f1f5f9] rounded-[24px] p-5 h-40 font-semibold text-[#2E1A47] focus:border-[#DC2626] outline-none transition-all resize-none mb-6"
                            />
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setShowRejectModal(false)} className="px-6 py-3 text-[#A3779D] hover:bg-[#f1f5f9] rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">Cancel</button>
                                <button onClick={handleReject} className="px-6 py-3 bg-[#DC2626] text-white rounded-2xl hover:bg-[#991b1b] font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-100 transition-all">Deny Request</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LeaveApprovals;
