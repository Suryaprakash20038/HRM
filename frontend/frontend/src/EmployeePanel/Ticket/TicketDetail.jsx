import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { ArrowLeft, Send, Paperclip, User as UserIcon, Clock, CheckCircle, MessageSquare, FileText, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const TicketDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reply, setReply] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchTicketDetails();
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [ticket?.conversations]);

    const fetchTicketDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/tickets/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setTicket(response.data.data.ticket);
            }
        } catch (error) {
            console.error('Error fetching ticket details:', error);
            toast.error('Failed to load ticket details');
            navigate('/employee/tickets');
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!reply.trim() && !attachment) return;

        setSending(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('message', reply);
            if (attachment) formData.append('attachment', attachment);

            const response = await axios.post(`http://localhost:5000/api/tickets/${id}/reply`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                const newConversation = response.data.data.ticket.conversations;
                setTicket(prev => ({ ...prev, conversations: newConversation }));
                setReply('');
                setAttachment(null);
                toast.success('Reply sent');
            }
        } catch (error) {
            console.error('Reply error:', error);
            toast.error('Failed to send reply');
        } finally {
            setSending(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': return 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
            case 'In Progress': return 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
            case 'Waiting': return 'bg-purple-500/20 text-purple-400 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
            case 'Resolved': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
            case 'Closed': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-slate-400 text-sm animate-pulse">Loading ticket details...</p>
            </div>
        </div>
    );

    if (!ticket) return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-400">
            Ticket not found
        </div>
    );

    const isClosed = ticket.status === 'Closed';

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans relative overflow-hidden flex flex-col">

            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[150px]" />
            </div>

            <div className="max-w-7xl mx-auto w-full h-[100vh] flex flex-col p-4 lg:p-6 relative z-10">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6"
                >
                    <button
                        onClick={() => navigate('/employee/tickets')}
                        className="p-2.5 hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-slate-700 group"
                    >
                        <ArrowLeft size={20} className="text-slate-400 group-hover:text-white" />
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-white tracking-tight">{ticket.title}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(ticket.status)}`}>
                                {ticket.status}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
                            <span className="flex items-center gap-2 bg-slate-900/50 px-2 py-1 rounded border border-slate-800">
                                <span className="font-mono text-xs opacity-70">ID:</span>
                                <span className="font-mono text-white">#{ticket.ticketId.slice(-6)}</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                                <span className="text-slate-500">Category:</span>
                                <span className="text-slate-200">{ticket.category}</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <Clock size={14} className="text-slate-500" />
                                <span>{format(new Date(ticket.createdAt), 'MMM dd, yyyy h:mm a')}</span>
                            </span>
                            {ticket.assignedTo && (
                                <span className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold border border-indigo-500/30">
                                        {ticket.assignedTo.firstName[0]}
                                    </div>
                                    <span className="text-indigo-300">{ticket.assignedTo.firstName} {ticket.assignedTo.lastName}</span>
                                </span>
                            )}
                        </div>
                    </div>
                </motion.div>

                <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">

                    {/* Main Chat/Timeline Area */}
                    <div className="flex-1 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
                        {/* Chat Header Background */}
                        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50"></div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                            {/* Original Ticket Description */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-5"
                            >
                                <div className="flex-shrink-0">
                                    {ticket.employeeId.profileImage ? (
                                        <img src={`http://localhost:5000/${ticket.employeeId.profileImage}`} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-800" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                            <UserIcon size={24} className="text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 max-w-3xl">
                                    <div className="flex items-baseline gap-3 mb-2">
                                        <span className="font-bold text-white text-lg">
                                            {ticket.employeeId.firstName} {ticket.employeeId.lastName}
                                        </span>
                                        <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">Owner</span>
                                        <span className="text-xs text-slate-500">
                                            {format(new Date(ticket.createdAt), 'MMM dd, h:mm a')}
                                        </span>
                                    </div>
                                    <div className="bg-slate-800/40 p-5 rounded-3xl rounded-tl-none border border-slate-700/50 text-slate-200 leading-relaxed whitespace-pre-wrap shadow-sm">
                                        {ticket.description}
                                    </div>
                                    {ticket.attachment && (
                                        <motion.div whileHover={{ scale: 1.01 }} className="mt-3">
                                            <a href={`http://localhost:5000/${ticket.attachment}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 p-3 bg-slate-950/50 rounded-xl border border-slate-800 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group">
                                                <div className="p-2 bg-slate-900 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                                    <FileText size={18} className="text-slate-400 group-hover:text-blue-400" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-slate-300 group-hover:text-blue-300 transition-colors">View Attachment</span>
                                                    <span className="text-[10px] text-slate-500">Click to open</span>
                                                </div>
                                                <ChevronRight size={16} className="text-slate-600 group-hover:text-blue-400 ml-2" />
                                            </a>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Separator */}
                            <div className="flex items-center gap-4 opacity-30">
                                <div className="h-px bg-slate-500 flex-1"></div>
                                <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Activity</span>
                                <div className="h-px bg-slate-500 flex-1"></div>
                            </div>

                            {/* Conversations */}
                            {ticket.conversations.map((msg, idx) => {
                                const isMe = msg.sender._id === user._id;
                                const senderName = msg.sender.firstName ? `${msg.sender.firstName} ${msg.sender.lastName}` : 'User';
                                const isStaff = msg.senderType !== 'Employee';

                                return (
                                    <motion.div
                                        key={msg._id || idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className={`flex gap-5 ${isMe ? 'flex-row-reverse' : ''}`}
                                    >
                                        <div className="flex-shrink-0">
                                            {msg.sender.profileImage ? (
                                                <img src={`http://localhost:5000/${msg.sender.profileImage}`} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-800" />
                                            ) : (
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${isStaff ? 'bg-gradient-to-br from-purple-600 to-purple-500 shadow-purple-500/20' : 'bg-gradient-to-br from-slate-600 to-slate-500'}`}>
                                                    <UserIcon size={16} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className={`flex-1 max-w-[75%] ${isMe ? 'items-end flex flex-col' : ''}`}>
                                            <div className={`flex items-baseline gap-2 mb-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                <span className={`font-bold text-sm ${isStaff ? 'text-purple-400' : 'text-blue-400'}`}>
                                                    {senderName}
                                                </span>
                                                {isStaff && <span className="text-[10px] font-bold bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20 uppercase tracking-wide">Support</span>}
                                                <span className="text-xs text-slate-600">
                                                    {format(new Date(msg.createdAt), 'h:mm a')}
                                                </span>
                                            </div>
                                            <div className={`p-4 rounded-2xl text-slate-100 leading-relaxed whitespace-pre-wrap shadow-md ${isMe ? 'bg-blue-600 rounded-tr-none text-white' : 'bg-slate-800 rounded-tl-none border border-slate-700'}`}>
                                                {msg.message}
                                            </div>
                                            {msg.attachment && (
                                                <div className="mt-2 text-right">
                                                    <a href={`http://localhost:5000/${msg.attachment}`} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-colors ${isMe ? 'bg-blue-700 text-blue-100 hover:bg-blue-800' : 'bg-slate-800 border border-slate-700 text-blue-400 hover:text-blue-300'}`}>
                                                        <Paperclip size={12} />
                                                        Attachment
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Reply Input */}
                        {!isClosed ? (
                            <div className="p-4 lg:p-6 bg-slate-900/80 border-t border-slate-800 backdrop-blur-md">
                                <form onSubmit={handleReplySubmit} className="flex gap-4 items-end">
                                    <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 transition-all shadow-inner">
                                        <textarea
                                            value={reply}
                                            onChange={(e) => setReply(e.target.value)}
                                            placeholder="Type your reply here..."
                                            className="w-full bg-transparent border-none text-slate-200 placeholder-slate-600 focus:ring-0 resize-none min-h-[40px] max-h-[120px] custom-scrollbar"
                                            rows="1"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleReplySubmit(e);
                                                }
                                            }}
                                        />
                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-800">
                                            <label className="cursor-pointer text-slate-500 hover:text-blue-400 transition-colors p-1 hover:bg-slate-900 rounded-lg flex items-center gap-2 text-xs font-medium group">
                                                <div className="p-1.5 bg-slate-900 rounded group-hover:bg-blue-500/20 text-slate-500 group-hover:text-blue-400 transition-colors">
                                                    <Paperclip size={16} />
                                                </div>
                                                <span className="hidden sm:inline">Attach File</span>
                                                <input type="file" className="hidden" onChange={(e) => setAttachment(e.target.files[0])} />
                                            </label>
                                            {attachment && (
                                                <div className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-medium border border-blue-500/20">
                                                    <Paperclip size={12} />
                                                    <span className="truncate max-w-[150px]">{attachment.name}</span>
                                                    <button type="button" onClick={() => setAttachment(null)} className="hover:text-red-400 ml-1 bg-blue-500/20 rounded-full p-0.5"><CheckCircle size={10} /></button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="submit"
                                        disabled={sending || (!reply.trim() && !attachment)}
                                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-blue-500/30"
                                    >
                                        {sending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Send size={22} className="ml-0.5" />}
                                    </motion.button>
                                </form>
                            </div>
                        ) : (
                            <div className="p-6 bg-slate-900/80 border-t border-slate-800 backdrop-blur-md">
                                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
                                    <div className="flex items-center justify-center gap-2 text-slate-400 mb-1">
                                        <CheckCircle size={18} />
                                        <span className="font-semibold">Ticket Closed</span>
                                    </div>
                                    <p className="text-xs text-slate-500">This conversation has been resolved and is closed for new replies.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="w-full lg:w-80 space-y-4"
                    >
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                                <FileText size={14} /> Ticket Info
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-slate-500 text-xs font-medium mb-1.5">Current Status</label>
                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold border ${getStatusColor(ticket.status)} capitalize w-full justify-center`}>
                                        {ticket.status}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-slate-500 text-xs font-medium mb-1.5">Priority Level</label>
                                    <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors
                                        ${ticket.priority === 'High' ? 'bg-red-500/5 border-red-500/20 text-red-400' :
                                            ticket.priority === 'Medium' ? 'bg-amber-500/5 border-amber-500/20 text-amber-400' :
                                                'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'}`}>
                                        <AlertCircle size={18} />
                                        <span className="font-semibold">{ticket.priority} Priority</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-slate-500 text-xs font-medium mb-1.5">Category</label>
                                    <div className="text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800 text-sm">{ticket.category}</div>
                                </div>
                                {ticket.relatedProject && (
                                    <div>
                                        <label className="block text-slate-500 text-xs font-medium mb-1.5">Project Context</label>
                                        <div className="text-blue-400 bg-blue-500/5 p-3 rounded-xl border border-blue-500/10 text-sm flex items-center gap-2">
                                            <Briefcase size={14} />
                                            {ticket.relatedProject.projectName}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {ticket.mentionedEmployees && ticket.mentionedEmployees.length > 0 && (
                            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <UserIcon size={14} /> Mentioned
                                </h3>
                                <div className="space-y-3">
                                    {ticket.mentionedEmployees.map(emp => (
                                        <div key={emp._id} className="flex items-center gap-3 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50">
                                            {emp.profileImage ? (
                                                <img src={`http://localhost:5000/${emp.profileImage}`} className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-800" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                                                    {emp.firstName[0]}
                                                </div>
                                            )}
                                            <div className="text-sm overflow-hidden">
                                                <div className="text-slate-200 font-medium truncate">{emp.firstName} {emp.lastName}</div>
                                                <div className="text-slate-500 text-xs truncate">{emp.department}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetail;
