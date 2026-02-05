import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Plus, Search, Filter, Layers, Clock, CheckCircle, AlertCircle, ChevronRight, Ticket as TicketIcon, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const TicketList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await api.get('/tickets/my-tickets');
            if (response.data.success) {
                setTickets(response.data.data.tickets);
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (ticketId, e) => {
        e.stopPropagation(); // Prevent navigating to details
        if (!window.confirm("Are you sure you want to permanently delete this ticket?")) return;

        try {
            const response = await api.delete(`/tickets/${ticketId}`);

            if (response.data.success) {
                toast.success('Ticket deleted successfully');
                setTickets(prev => prev.filter(t => t._id !== ticketId));
            }
        } catch (error) {
            console.error('Error deleting ticket:', error);
            toast.error(error.response?.data?.message || 'Failed to delete ticket');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Open': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'In Progress': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Waiting': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'Resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Closed': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'High': return 'text-red-600 bg-red-50 border-red-100';
            case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'Low': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            default: return 'text-slate-600 bg-slate-50 border-slate-100';
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch =
            ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || ticket.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'Open').length,
        pending: tickets.filter(t => t.status === 'In Progress').length,
        solved: tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 font-sans">
            <div className="max-w-[1600px] mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Support Center</h1>
                        <p className="text-slate-500 mt-1">Track and manage your support requests</p>
                    </div>
                    <button
                        onClick={() => navigate('/employee/tickets/raise')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm shadow-indigo-200 transition-all flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Raise Ticket
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-300 transition-colors">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Total Tickets</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Layers size={20} />
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-300 transition-colors">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Open Tickets</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.open}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <AlertCircle size={20} />
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-300 transition-colors">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">In Progress</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.pending}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Clock size={20} />
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-300 transition-colors">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Resolved</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.solved}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CheckCircle size={20} />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">

                    {/* Toolbar */}
                    <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by ID, subject, or category..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                                <Filter size={16} className="text-slate-400" />
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="bg-transparent text-sm text-slate-600 outline-none border-none cursor-pointer pr-2 focus:ring-0"
                                >
                                    <option value="All">All Status</option>
                                    <option value="Open">Open</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                    <th className="px-6 py-4">Ticket ID</th>
                                    <th className="px-6 py-4 w-1/3">Subject</th>
                                    <th className="px-6 py-4 text-center">Priority</th>
                                    <th className="px-6 py-4 text-center">Status</th>

                                    <th className="px-6 py-4 text-right">Date</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan="6" className="p-20 text-center text-slate-400">Loading tickets...</td></tr>
                                ) : filteredTickets.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                    <TicketIcon size={32} className="opacity-50" />
                                                </div>
                                                <p className="text-base font-medium text-slate-600">No tickets found</p>
                                                <p className="text-sm mt-1">Try adjusting your filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTickets.map((ticket) => (
                                        <tr
                                            key={ticket._id}
                                            onClick={() => navigate(`/employee/tickets/${ticket._id}`)}
                                            className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                    #{ticket.ticketId.slice(-6).toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">{ticket.title}</span>
                                                    <span className="text-xs text-slate-500 mt-0.5">{ticket.category}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityStyle(ticket.priority)}`}>
                                                    {ticket.priority}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(ticket.status)}`}>
                                                    {ticket.status}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-right text-xs text-slate-500">
                                                {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={(e) => handleDelete(ticket._id, e)}
                                                    className="p-1.5 hover:bg-red-50 rounded-md text-slate-400 hover:text-red-600 transition-colors"
                                                    title="Delete Ticket"
                                                >
                                                    <Trash2 size={16} />
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

export default TicketList;
