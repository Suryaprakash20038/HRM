import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, MessageSquare, Upload, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import resignationService from '../services/resignationService';
import employeeService from '../services/employeeService';
import { toast } from 'react-hot-toast';
import { EMP_THEME } from './theme';

const SubmitResignation = () => {
    const [loading, setLoading] = useState(false);
    const [employee, setEmployee] = useState(null);
    const [formData, setFormData] = useState({
        reason: '',
        comments: '',
        resignationLetter: null
    });

    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await employeeService.getMyProfile();
            setEmployee(data);
        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 404) {
                setError('Employee profile not found. Please contact HR to link your account.');
                toast.error('Employee profile not found');
            } else {
                toast.error('Failed to load profile');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, resignationLetter: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.reason) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            await resignationService.submitResignation(formData);
            toast.success('Resignation submitted successfully');
            fetchProfile(); // Refresh status
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit resignation');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!window.confirm('Are you sure you want to cancel your resignation request?')) return;

        try {
            await resignationService.cancelResignation();
            toast.success('Resignation request cancelled');
            fetchProfile();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel resignation');
        }
    };

    if (error) return (
        <div className="flex items-center justify-center h-full text-red-600 font-semibold">
            {error}
        </div>
    );

    if (!employee) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    const isResigned = ['Resignation Submitted', 'Notice Period', 'Exit Process', 'Relieved'].includes(employee.status);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${EMP_THEME.midnightPlum}, ${EMP_THEME.royalAmethyst})` }}>
                    Resignation Portal
                </h1>
                <p className="text-gray-500 mt-2">Manage your exit process seamlessly.</p>
            </motion.div>

            {isResigned ? (
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
                >
                    <div className="p-6 text-white" style={{ background: `linear-gradient(to right, ${EMP_THEME.royalAmethyst}, ${EMP_THEME.midnightPlum})` }}>
                        <div className="flex items-center gap-3">
                            <Clock className="w-8 h-8 opacity-80" />
                            <h2 className="text-2xl font-bold">Resignation Status</h2>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm text-gray-500 font-medium uppercase tracking-wider">Current Status</label>
                                <div className="mt-2 inline-flex items-center px-4 py-2 rounded-full font-bold border" style={{ backgroundColor: `${EMP_THEME.royalAmethyst}10`, color: EMP_THEME.royalAmethyst, borderColor: `${EMP_THEME.royalAmethyst}30` }}>
                                    {employee.status}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-gray-500 font-medium uppercase tracking-wider">Submitted On</label>
                                <p className="text-lg font-semibold text-gray-800 mt-1">
                                    {employee.resignationData?.resignationDate
                                        ? new Date(employee.resignationData.resignationDate).toLocaleDateString()
                                        : 'N/A'}
                                </p>
                            </div>


                        </div>

                        <div className="space-y-6">
                            {/* Status Pipeline */}
                            <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Approval Pipeline</h3>

                                {/* TL Approval */}
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 font-medium">1. Team Lead</span>
                                    <span className={`px-2 py-1 text-xs rounded-full font-bold border ${employee.resignationData?.domainTLApprovalStatus === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                        employee.resignationData?.domainTLApprovalStatus === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                            employee.resignationData?.domainTLApprovalStatus === 'Not Required' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                                                'bg-yellow-100 text-yellow-700 border-yellow-200'
                                        }`}>
                                        {employee.resignationData?.domainTLApprovalStatus || 'Pending'}
                                    </span>
                                </div>

                                {/* Manager Approval */}
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 font-medium">2. Manager</span>
                                    <span className={`px-2 py-1 text-xs rounded-full font-bold border ${employee.resignationData?.managerApprovalStatus === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                        employee.resignationData?.managerApprovalStatus === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                            employee.resignationData?.managerApprovalStatus === 'Not Required' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                                                'bg-yellow-100 text-yellow-700 border-yellow-200'
                                        }`}>
                                        {employee.resignationData?.managerApprovalStatus || 'Pending'}
                                    </span>
                                </div>

                                {/* HR/Final Status */}
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 font-medium">3. HR / Final LWD</span>
                                    <span className={`px-2 py-1 text-xs rounded-full font-bold border ${employee.resignationData?.finalLWD ? 'bg-green-100 text-green-700 border-green-200' :
                                        'bg-gray-100 text-gray-500 border-gray-200'
                                        }`}>
                                        {employee.resignationData?.finalLWD ? 'Confirmed' : 'Pending'}
                                    </span>
                                </div>
                            </div>

                            {!employee.resignationData?.finalLWD && employee.resignationData?.requestedLWD && (
                                <div className="mt-4">
                                    <label className="text-sm text-gray-500 font-medium uppercase tracking-wider">Proposed Last Working Day</label>
                                    <p className="text-lg font-semibold text-gray-800 mt-1">
                                        {new Date(employee.resignationData.requestedLWD).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Subject to HR Approval</p>
                                </div>
                            )}

                            {employee.resignationData?.finalLWD && (
                                <div className="p-4 rounded-xl border" style={{ backgroundColor: `${EMP_THEME.royalAmethyst}10`, borderColor: `${EMP_THEME.royalAmethyst}30` }}>
                                    <label className="text-sm font-bold uppercase tracking-wider" style={{ color: EMP_THEME.royalAmethyst }}>Final Last Working Day</label>
                                    <p className="text-2xl font-bold mt-1" style={{ color: EMP_THEME.midnightPlum }}>
                                        {new Date(employee.resignationData?.finalLWD).toLocaleDateString()}
                                    </p>
                                    {employee.status === 'Notice Period' && (
                                        <p className="text-sm mt-2 font-medium" style={{ color: EMP_THEME.softViolet }}>
                                            {employee.resignationData?.daysRemaining} days remaining
                                        </p>
                                    )}
                                </div>
                            )}

                            {['Resignation Submitted', 'Notice Period'].includes(employee.status) && (
                                <div className="pt-4 mt-auto">
                                    <button
                                        onClick={handleCancel}
                                        className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold py-3 rounded-xl transition-all shadow-sm hover:shadow-md"
                                    >
                                        Cancel Resignation Request
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
                >
                    {(employee.status === 'Exit Process' || employee.status === 'Relieved') && employee.resignationData?.exitClearance ? (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-gray-800">Exit Clearance Checklist</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`p-4 rounded-lg border flex items-center gap-3 ${employee.resignationData.exitClearance.assetsReturned ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                    {employee.resignationData.exitClearance.assetsReturned ? <CheckCircle /> : <AlertCircle />}
                                    <span className="font-medium">Assets Returned</span>
                                </div>
                                <div className={`p-4 rounded-lg border flex items-center gap-3 ${employee.resignationData.exitClearance.financeCleared ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                    {employee.resignationData.exitClearance.financeCleared ? <CheckCircle /> : <AlertCircle />}
                                    <span className="font-medium">Finance Clearance</span>
                                </div>
                                <div className={`p-4 rounded-lg border flex items-center gap-3 ${employee.resignationData.exitClearance.itCleared ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                    {employee.resignationData.exitClearance.itCleared ? <CheckCircle /> : <AlertCircle />}
                                    <span className="font-medium">IT Clearance</span>
                                </div>
                                <div className={`p-4 rounded-lg border flex items-center gap-3 ${employee.resignationData.exitClearance.adminCleared ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                    {employee.resignationData.exitClearance.adminCleared ? <CheckCircle /> : <AlertCircle />}
                                    <span className="font-medium">Admin Clearance</span>
                                </div>
                            </div>
                            {employee.status === 'Exit Process' && (
                                <p className="text-sm text-gray-500 mt-4">Please contact respective departments to complete your clearance.</p>
                            )}
                        </div>
                    ) : (
                        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-100 rounded-lg flex gap-3 text-yellow-800">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm">Please consider talking to your manager before submitting your resignation. Once submitted, the process will initiate immediately.</p>
                        </div>
                    )}

                    {(!['Exit Process', 'Relieved'].includes(employee.status)) && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Resignation *</label>
                                <input
                                    type="text"
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    placeholder="e.g. Better Opportunity, Relocation, Higher Studies"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Comments</label>
                                <textarea
                                    name="comments"
                                    value={formData.comments}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all h-32 resize-none"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Attach Resignation Letter (Optional PDF)</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors cursor-pointer text-center relative">
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">
                                        {formData.resignationLetter ? formData.resignationLetter.name : 'Click to upload or drag and drop'}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full text-white font-bold py-3 rounded-lg shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: EMP_THEME.royalAmethyst }}
                                >
                                    {loading ? 'Submitting...' : 'Submit Resignation'}
                                </button>
                            </div>
                        </form>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default SubmitResignation;
