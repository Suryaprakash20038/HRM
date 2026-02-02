import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Search, Filter, CheckCircle, Clock, AlertCircle,
    Briefcase, RefreshCw, Ticket as TicketIcon, Trash2, ChevronDown
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const StatusDropdown = ({ currentStatus, onStatusChange, getStatusColor }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const statuses = [
        { value: 'Open', icon: AlertCircle },
        { value: 'In Progress', icon: Clock },
        { value: 'Waiting', icon: Clock },
        { value: 'Resolved', icon: CheckCircle },
        { value: 'Closed', icon: CheckCircle },
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (status) => {
        onStatusChange(status);
        setIsOpen(false);
    };

    const currentStatusObj = statuses.find(s => s.value === currentStatus) || { value: currentStatus, icon: AlertCircle };
    const Icon = currentStatusObj.icon;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all min-w-[150px] justify-between ${getStatusColor(currentStatus)}`}
                style={{ boxShadow: '0 4px 10px rgba(102, 51, 153, 0.05)' }}
            >
                <div className="flex items-center gap-2">
                    <Icon size={14} />
                    <span className="uppercase tracking-wider">{currentStatus}</span>
                </div>
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-full min-w-[180px] bg-white border border-[#E6C7E6] rounded-2xl shadow-2xl overflow-hidden right-0 fade-in">
                    {statuses.map((status) => {
                        const StatusIcon = status.icon;
                        const isSelected = currentStatus === status.value;
                        return (
                            <button
                                key={status.value}
                                onClick={() => handleSelect(status.value)}
                                className={`w-full flex items-center gap-3 px-5 py-3.5 text-xs text-left hover:bg-[#fdfbff] transition-colors ${isSelected ? 'bg-[#f3e8ff] text-[#663399] font-bold' : 'text-[#A3779D]'}`}
                            >
                                <StatusIcon size={14} className={isSelected ? 'text-[#663399]' : 'text-[#E6C7E6]'} />
                                <span className="uppercase tracking-wider">{status.value}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const AdminTicketList = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/tickets/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setTickets(response.data.data.tickets);
            }
        } catch (error) {
            console.error('Network Interface Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (ticketId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            setTickets(prev => prev.map(t => t._id === ticketId ? { ...t, status: newStatus } : t));

            await axios.put(`http://localhost:5000/api/tickets/${ticketId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Protocol updated to ${newStatus}`);
        } catch (error) {
            toast.error('Protocol alignment failure');
            fetchTickets();
        }
    };

    const handleDelete = async (ticketId) => {
        if (!window.confirm("Authorize permanent removal of this directive?")) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`http://localhost:5000/api/tickets/${ticketId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success('Directive purged successfully');
                setTickets(prev => prev.filter(t => t._id !== ticketId));
            }
        } catch (error) {
            toast.error('Security purge failed');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Open': return 'bg-[#fff1f2] text-[#e11d48] border-[#fecdd3]';
            case 'In Progress': return 'bg-[#fefce8] text-[#ca8a04] border-[#fef08a]';
            case 'Waiting': return 'bg-[#f3e8ff] text-[#663399] border-[#E6C7E6]';
            case 'Resolved': return 'bg-[#f0fdf4] text-[#059669] border-[#bbf7d0]';
            case 'Closed': return 'bg-[#f1f5f9] text-[#64748b] border-[#e2e8f0]';
            default: return 'bg-white text-[#A3779D] border-[#E6C7E6]';
        }
    };

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'High': return 'text-[#DC2626] bg-[#fee2e2] border-[#fecdd3]';
            case 'Medium': return 'text-[#D97706] bg-[#fffbeb] border-[#fef08a]';
            case 'Low': return 'text-[#059669] bg-[#ecfdf5] border-[#bbf7d0]';
            default: return 'text-[#A3779D] bg-white border-[#E6C7E6]';
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch =
            ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (ticket.employeeId && (ticket.employeeId.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || ticket.employeeId.lastName.toLowerCase().includes(searchTerm.toLowerCase())));

        const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter;
        const matchesPriority = priorityFilter === 'All' || ticket.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    const stats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'Open').length,
        pending: tickets.filter(t => t.status === 'In Progress').length,
        resolved: tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length
    };

    return (
        <div className="min-h-screen bg-[#fdfbff] p-8 lg:p-10 font-sans">
            <div className="max-w-[1600px] mx-auto space-y-10">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div style={{ width: 4, height: 24, backgroundColor: '#663399', borderRadius: 4 }}></div>
                            <h1 className="text-3xl font-extrabold text-[#2E1A47] tracking-tight">Communications Terminal</h1>
                        </div>
                        <p className="text-[#A3779D] font-semibold">Monitor and orchestrate global support intelligence</p>
                    </div>
                    <button
                        onClick={fetchTickets}
                        className="flex items-center gap-3 px-6 py-3 bg-white border border-[#E6C7E6] text-[#2E1A47] rounded-2xl hover:border-[#663399] transition-all shadow-sm font-bold"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin text-[#663399]" : "text-[#A3779D]"} />
                        <span>Synchronize Data</span>
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Logs', value: stats.total, icon: TicketIcon, color: '#663399', bg: '#f3e8ff' },
                        { label: 'Active Alerts', value: stats.open, icon: AlertCircle, color: '#DC2626', bg: '#fee2e2' },
                        { label: 'Operations', value: stats.pending, icon: Clock, color: '#D97706', bg: '#fffbeb' },
                        { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: '#059669', bg: '#ecfdf5' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-[#E6C7E6] shadow-[0_15px_30px_-10px_rgba(102,51,153,0.08)] flex items-center justify-between group hover:border-[#663399] transition-all">
                            <div>
                                <p className="text-[#A3779D] text-xs font-bold uppercase tracking-wider">{s.label}</p>
                                <h3 className="text-3xl font-black text-[#2E1A47] mt-1">{s.value}</h3>
                            </div>
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: s.bg, color: s.color }}>
                                <s.icon size={28} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-[32px] border border-[#E6C7E6] shadow-[0_25px_60px_-15px_rgba(102,51,153,0.12)] flex flex-col overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-8 border-b border-[#f1f5f9] flex flex-col lg:flex-row gap-6 justify-between items-center">
                        <div className="relative w-full lg:w-[500px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3779D]" size={20} />
                            <input
                                type="text"
                                placeholder="Query tactical logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 bg-[#f8fafc] border-2 border-transparent rounded-2xl text-sm font-semibold text-[#2E1A47] focus:bg-white focus:border-[#663399] transition-all outline-none"
                            />
                        </div>
                        <div className="flex w-full lg:w-auto items-center gap-4">
                            <div className="flex items-center gap-3 px-4 py-3 bg-[#f8fafc] border-2 border-transparent rounded-2xl hover:border-[#E6C7E6] transition-all">
                                <Filter size={18} className="text-[#A3779D]" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="bg-transparent text-sm font-bold text-[#2E1A47] outline-none border-none cursor-pointer pr-4 focus:ring-0"
                                >
                                    <option value="All">Global Phase</option>
                                    <option value="Open">Active Phase</option>
                                    <option value="In Progress">Execution Phase</option>
                                    <option value="Resolved">Resolution Phase</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-3 bg-[#f8fafc] border-2 border-transparent rounded-2xl hover:border-[#E6C7E6] transition-all">
                                <AlertCircle size={18} className="text-[#A3779D]" />
                                <select
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                    className="bg-transparent text-sm font-bold text-[#2E1A47] outline-none border-none cursor-pointer pr-4 focus:ring-0"
                                >
                                    <option value="All">All Priority</option>
                                    <option value="High">Urgent</option>
                                    <option value="Medium">Standard</option>
                                    <option value="Low">Low Priority</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-[#fdfbff] text-[11px] uppercase tracking-widest text-[#663399] font-black">
                                    <th className="px-8 py-5 border-b border-[#f1f5f9]">Directive ID</th>
                                    <th className="px-8 py-5 border-b border-[#f1f5f9]">Reporting Agent</th>
                                    <th className="px-8 py-5 border-b border-[#f1f5f9]">Subject Matter</th>
                                    <th className="px-8 py-5 border-b border-[#f1f5f9] text-center">Urgency</th>
                                    <th className="px-8 py-5 border-b border-[#f1f5f9] text-center">Maturity</th>
                                    <th className="px-8 py-5 border-b border-[#f1f5f9]">Deployment</th>
                                    <th className="px-8 py-5 border-b border-[#f1f5f9] text-center">Purge</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f1f5f9]">
                                {loading ? (
                                    <tr><td colSpan="7" className="p-32 text-center text-[#A3779D] font-bold">Acquiring Global Data...</td></tr>
                                ) : filteredTickets.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-32 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-24 h-24 bg-[#fdfbff] rounded-full flex items-center justify-center mb-6">
                                                    <TicketIcon size={40} className="text-[#E6C7E6]" />
                                                </div>
                                                <p className="text-xl font-extrabold text-[#2E1A47]">Directive Archive Empty</p>
                                                <p className="text-[#A3779D] font-semibold mt-2">Adjust your parameters or check global sync</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTickets.map((ticket) => (
                                        <tr key={ticket._id} className="hover:bg-[#fdfbff] transition-colors group">
                                            <td className="px-8 py-6">
                                                <span className="font-mono text-xs font-black text-[#663399] bg-[#f3e8ff] px-3 py-1.5 rounded-lg border border-[#E6C7E6]">
                                                    {ticket.ticketId.slice(-8).toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-[#f3e8ff] flex items-center justify-center overflow-hidden border-2 border-white shadow-sm ring-1 ring-[#E6C7E6]">
                                                        {ticket.employeeId?.profileImage ? (
                                                            <img src={`http://localhost:5000/${ticket.employeeId.profileImage}`} className="w-full h-full object-cover" alt="" />
                                                        ) : (
                                                            <span className="text-[#663399] font-black">{ticket.employeeId?.firstName?.[0]}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-[#2E1A47]">
                                                            {ticket.employeeId ? `${ticket.employeeId.firstName} ${ticket.employeeId.lastName}` : 'System Agent'}
                                                        </div>
                                                        <div className="text-[10px] font-black text-[#A3779D] uppercase tracking-wider">{ticket.employeeId?.department || 'GENERAL OPS'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-[#2E1A47] line-clamp-1">{ticket.title}</span>
                                                    <span className="text-[10px] font-bold text-[#A3779D] mt-1 uppercase tracking-widest">{ticket.category}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getPriorityStyle(ticket.priority)}`}>
                                                    {ticket.priority}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <StatusDropdown
                                                    currentStatus={ticket.status}
                                                    onStatusChange={(newStatus) => handleStatusUpdate(ticket._id, newStatus)}
                                                    getStatusColor={getStatusStyle}
                                                />
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="text-xs font-bold text-[#2E1A47]">{format(new Date(ticket.createdAt), 'MMM dd, yyyy')}</div>
                                                <div className="text-[10px] font-semibold text-[#A3779D]">{format(new Date(ticket.createdAt), 'hh:mm a')}</div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <button
                                                    onClick={() => handleDelete(ticket._id)}
                                                    className="w-10 h-10 flex items-center justify-center bg-[#fff1f2] hover:bg-[#ffe4e6] rounded-xl text-[#e11d48] transition-all border border-transparent hover:border-[#fb7185] active:scale-90"
                                                    title="Purge Directive"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTicketList;
