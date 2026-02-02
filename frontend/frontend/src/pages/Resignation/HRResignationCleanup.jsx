import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, Calendar, Clock, X, CheckCircle, ArrowRight } from 'lucide-react';
import resignationService from '../../services/resignationService';
import { toast } from 'react-hot-toast';

const HRResignationCleanup = () => {
    const [exitEmployees, setExitEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExitEmployees();
    }, []);

    const fetchExitEmployees = async () => {
        try {
            setLoading(true);
            const data = await resignationService.getExitEmployees();
            setExitEmployees(data.data);
        } catch (error) {
            toast.error('Failed to load exit employees');
        } finally {
            setLoading(false);
        }
    };

    const handleRelieve = async (id) => {
        if (!window.confirm('Are you sure you want to mark this employee as RELIEVED? This action cannot be undone.')) return;
        try {
            await resignationService.relieveEmployee(id);
            toast.success('Employee Relieved Successfully');
            setExitEmployees(prev => prev.filter(e => e.employeeId !== id));
        } catch (error) {
            toast.error('Failed to relieve employee');
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-10 bg-[#fdfbff] min-h-screen">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-10"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div style={{ width: 4, height: 28, backgroundColor: '#663399', borderRadius: 4 }}></div>
                    <h1 className="text-3xl font-black text-[#2E1A47] tracking-tight">
                        Tactical Exit Command
                    </h1>
                </div>
                <p className="text-[#A3779D] font-semibold">Mission debriefing and final integrity clearance for departing agents.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {exitEmployees.map(emp => (
                    <motion.div
                        key={emp.employeeId}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white p-6 rounded-[32px] shadow-[0_15px_40px_-10px_rgba(102,51,153,0.1)] border border-[#E6C7E6] hover:shadow-[0_25px_60px_-15px_rgba(102,51,153,0.15)] transition-all group"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#f3e8ff] flex items-center justify-center text-[#663399] font-black border border-[#E6C7E6]">
                                    {emp.firstName[0]}{emp.lastName[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#2E1A47] group-hover:text-[#663399] transition-colors">{emp.firstName} {emp.lastName}</h3>
                                    <p className="text-[#A3779D] text-[10px] font-black uppercase tracking-widest">{emp.position}</p>
                                </div>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${emp.status === 'Exit Process' ? 'bg-[#fff1f2] text-[#e11d48] border-[#fecdd3]' : 'bg-[#fffbeb] text-[#D97706] border-[#fef08a]'}`}>
                                {emp.status === 'Exit Process' ? 'DEBRIEFING' : 'OBSERVATION'}
                            </span>
                        </div>

                        <div className="space-y-4 text-sm mb-8 bg-[#fdfbff] p-6 rounded-[24px] border border-[#f1f5f9]">
                            <div className="flex justify-between items-center pb-3 border-b border-[#f1f5f9]">
                                <span className="text-[10px] font-black text-[#A3779D] uppercase tracking-wider">Final Operational Log</span>
                                <span className="text-[#2E1A47] font-black">{new Date(emp.resignationData.finalLWD).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-[#f1f5f9]">
                                <span className="text-[10px] font-black text-[#A3779D] uppercase tracking-wider">Time Remaining</span>
                                <span className="text-[#663399] font-black">{emp.status === 'Notice Period' ? `${emp.resignationData.daysRemaining} Cycles` : '0 Cycles'}</span>
                            </div>

                            <div>
                                <span className="text-[10px] font-black text-[#663399] uppercase tracking-widest block mb-3">Integrity Clearances</span>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Assets', val: emp.resignationData.exitClearance?.assetsReturned },
                                        { label: 'Finance', val: emp.resignationData.exitClearance?.financeCleared },
                                        { label: 'Network', val: emp.resignationData.exitClearance?.itCleared },
                                        { label: 'Protocol', val: emp.resignationData.exitClearance?.adminCleared }
                                    ].map((c, i) => (
                                        <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-[10px] font-black uppercase tracking-tighter ${c.val ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#059669]' : 'bg-[#fff1f2] border-[#fecdd3] text-[#e11d48]'}`}>
                                            {c.val ? <CheckCircle size={12} /> : <X size={12} />} {c.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const lwd = new Date(emp.resignationData.finalLWD);
                                if (lwd > today) {
                                    toast.error(`Protocol violation: Cannot terminate before Final Log Date (${lwd.toLocaleDateString()}).`);
                                    return;
                                }
                                handleRelieve(emp.employeeId);
                            }}
                            className="w-full bg-[#663399] hover:bg-[#2E1A47] text-white font-black uppercase text-xs tracking-widest py-4 rounded-2xl shadow-xl shadow-purple-100 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1"
                        >
                            Authorize Terminal Exit <UserCheck size={18} />
                        </button>
                    </motion.div>
                ))}
                {exitEmployees.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-20 bg-white rounded-[40px] border-2 border-dashed border-[#E6C7E6] shadow-inner">
                        <div className="w-20 h-20 rounded-full bg-[#fdfbff] flex items-center justify-center mb-6">
                            <Clock className="text-[#A3779D] w-10 h-10" />
                        </div>
                        <p className="text-[#2E1A47] text-xl font-black">Scanning Complete</p>
                        <p className="text-[#A3779D] font-semibold mt-2">Zero agents in transition phase at this timestamp.</p>
                    </div>
                )}
            </div>
        </div>
    );
};



export default HRResignationCleanup;
