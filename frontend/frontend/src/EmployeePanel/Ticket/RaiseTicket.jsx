import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Upload, X, Check, Search, AlertCircle, FileText, Briefcase, Users, Tag, Paperclip, ChevronLeft, Send, HelpCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const MultiSelect = ({ options, selected, onChange, label, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const toggleOption = (id) => {
        const newSelected = selected.includes(id)
            ? selected.filter(item => item !== id)
            : [...selected, id];
        onChange(newSelected);
    };

    const filteredOptions = options.filter(opt =>
        opt.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opt.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative group">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">{label}</label>
            <div
                className={`w-full bg-white border border-slate-200 rounded-xl p-3 min-h-[56px] cursor-pointer transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 ${isOpen ? 'ring-2 ring-blue-500/20 border-blue-500' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {selected.length === 0 ? (
                    <span className="text-slate-400 flex items-center gap-2 text-sm mt-1.5 ml-1">
                        <Users size={16} />
                        {placeholder}
                    </span>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {selected.map(id => {
                            const opt = options.find(o => o._id === id);
                            return opt ? (
                                <span key={id} className="bg-blue-50 border border-blue-100 text-blue-700 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-2 animate-in fade-in zoom-in-95 font-medium">
                                    {opt.profileImage ? (
                                        <img src={`http://localhost:5000/${opt.profileImage}`} className="w-4 h-4 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center text-[10px] text-blue-700 font-bold">{opt.firstName[0]}</div>
                                    )}
                                    {opt.firstName} {opt.lastName}
                                    <X size={12} className="cursor-pointer hover:text-blue-900 transition-colors" onClick={(e) => {
                                        e.stopPropagation();
                                        toggleOption(id);
                                    }} />
                                </span>
                            ) : null;
                        })}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute z-30 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
                        >
                            <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex items-center bg-white rounded-lg px-3 border border-slate-200 focus-within:border-blue-500/50 transition-colors">
                                    <Search size={14} className="text-slate-400" />
                                    <input
                                        type="text"
                                        className="bg-transparent border-none text-slate-900 text-sm w-full p-2.5 focus:ring-0 placeholder-slate-400 outline-none"
                                        placeholder="Search colleagues..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map(opt => (
                                        <div
                                            key={opt._id}
                                            className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${selected.includes(opt._id) ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleOption(opt._id);
                                            }}
                                        >
                                            <div className={`w-5 h-5 border rounded-md mr-3 flex items-center justify-center transition-all ${selected.includes(opt._id) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                                                {selected.includes(opt._id) && <Check size={12} className="text-white" />}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {opt.profileImage ? (
                                                    <img src={`http://localhost:5000/${opt.profileImage}`} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                        {opt.firstName[0]}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-slate-700">{opt.firstName} {opt.lastName}</div>
                                                    <div className="text-xs text-slate-400">{opt.department || 'Employee'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                                        <Users size={24} className="opacity-20" />
                                        No colleagues found
                                    </div>
                                )}
                            </div>
                        </motion.div>
                        <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)}></div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

const InputField = ({ label, icon: Icon, type = "text", ...props }) => (
    <div className="group">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1 transition-colors group-focus-within:text-blue-600">{label}</label>
        <div className="relative">
            {Icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Icon size={18} />
                </div>
            )}
            <input
                type={type}
                className={`w-full bg-white border border-slate-200 rounded-xl py-3.5 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300 hover:border-slate-300 ${Icon ? 'pl-11' : 'pl-4'}`}
                {...props}
            />
        </div>
    </div>
);

const SelectField = ({ label, icon: Icon, options, ...props }) => (
    <div className="group">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1 transition-colors group-focus-within:text-blue-600">{label}</label>
        <div className="relative">
            {Icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Icon size={18} />
                </div>
            )}
            <select
                className={`w-full bg-white border border-slate-200 rounded-xl py-3.5 text-slate-900 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300 appearance-none cursor-pointer hover:border-slate-300 ${Icon ? 'pl-11' : 'pl-4'}`}
                {...props}
            >
                {options}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
    </div>
);

const RaiseTicket = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [colleagues, setColleagues] = useState([]);
    const [projects, setProjects] = useState([]);

    const [formData, setFormData] = useState({
        category: '',
        customCategory: '',
        title: '',
        description: '',
        priority: 'Medium',
        relatedProject: '',
        mentionedEmployees: [],
        attachment: null
    });

    useEffect(() => {
        const fetchColleagues = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/tickets/colleagues', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    setColleagues(response.data.data.colleagues);
                }
            } catch (error) {
                console.error('Error fetching colleagues:', error);
            }
        };

        const fetchProjects = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/projects/my-projects', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data && response.data.data && response.data.data.projects) {
                    setProjects(response.data.data.projects);
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        };

        fetchColleagues();
        fetchProjects();
    }, []);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFormData(prev => ({ ...prev, attachment: e.target.files[0] }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'mentionedEmployees') {
                    if (formData.mentionedEmployees.length > 0) {
                        data.append(key, JSON.stringify(formData.mentionedEmployees));
                    }
                } else if (key === 'attachment') {
                    if (formData.attachment) data.append(key, formData.attachment);
                } else if (key === 'category') {
                    // Check if 'Other' is selected and append customCategory
                    if (formData.category === 'Other') {
                        data.append('category', formData.customCategory || 'Other');
                    } else {
                        data.append('category', formData.category);
                    }
                } else if (key === 'customCategory') {
                    // Skip customCategory as it's handled above
                } else if (formData[key]) {
                    data.append(key, formData[key]);
                }
            });

            const response = await axios.post('http://localhost:5000/api/tickets', data, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                toast.success('Ticket submitted successfully!');
                navigate('/employee/tickets');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit ticket');
        } finally {
            setLoading(false);
        }
    };

    const staticCategories = [
        'HR / Payroll',
        'Leave / Attendance',
        'IT / System / Access',
        'Project / Work',
        'Manager / Team',
        'General Support'
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans p-6 lg:p-12 relative overflow-hidden flex items-center justify-center">

            <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

                {/* Left Panel: Context */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => navigate('/employee/tickets')}
                        className="flex items-center gap-3 text-slate-500 hover:text-indigo-600 transition-colors group self-start"
                    >
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 group-hover:border-indigo-200 transition-colors shadow-sm">
                            <ArrowLeft size={18} />
                        </div>
                        <span className="font-medium">Back to Tickets</span>
                    </motion.button>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden"
                    >
                        {/* Decorative Circles */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/20">
                                <HelpCircle size={24} className="text-white" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4 tracking-tight">Need Help?</h2>
                            <p className="text-indigo-100 leading-relaxed mb-8 font-medium">
                                Describe your issue in detail so we can route it to the right team. We're here to support you.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                        <AlertCircle size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm">Response Time</div>
                                        <div className="text-xs text-indigo-200">Usually within 24 hours</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hidden lg:block"
                    >
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Submission Tips</h3>
                        <ul className="space-y-4">
                            {[
                                "Select the most relevant category",
                                "Provide a clear, descriptive title",
                                "Attach screenshots for errors",
                                "Tag only relevant colleagues"
                            ].map((item, i) => (
                                <li key={i} className="flex gap-3 text-slate-600 text-sm items-start">
                                    <div className="bg-emerald-50 p-1 rounded-full mt-0.5">
                                        <Check size={12} className="text-emerald-600" />
                                    </div>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* Right Panel: Form */}
                <div className="lg:col-span-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white border border-slate-200 rounded-[2rem] p-8 lg:p-10 shadow-xl shadow-slate-200/50 relative overflow-hidden"
                    >

                        <div className="mb-10">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Ticket</h1>
                            <p className="text-slate-500">Fill in the form below to submit a new support request.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Row 1 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <SelectField
                                        label="Category *"
                                        name="category"
                                        value={formData.category === 'Other' || !staticCategories.includes(formData.category) && formData.category !== '' && formData.category !== 'Other' ? 'Other' : formData.category}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                category: val,
                                                customCategory: val === 'Other' ? '' : prev.customCategory
                                            }));
                                        }}
                                        required
                                        icon={Tag}
                                        options={
                                            <>
                                                <option value="">Select Category</option>
                                                {staticCategories.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                                <option value="Other">Other</option>
                                            </>
                                        }
                                    />
                                    {formData.category === 'Other' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                        >
                                            <InputField
                                                label="Specify Category *"
                                                placeholder="Type your category..."
                                                value={formData.customCategory}
                                                onChange={(e) => setFormData(prev => ({ ...prev, customCategory: e.target.value }))}
                                                required
                                            />
                                        </motion.div>
                                    )}
                                </div>

                                <SelectField
                                    label="Priority"
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    icon={AlertCircle}
                                    options={
                                        <>
                                            <option value="Low">Low Priority</option>
                                            <option value="Medium">Medium Priority</option>
                                            <option value="High">High Priority</option>
                                        </>
                                    }
                                />
                            </div>

                            {/* Row 2 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <SelectField
                                    label="Related Project (Optional)"
                                    name="relatedProject"
                                    value={formData.relatedProject}
                                    onChange={handleChange}
                                    icon={Briefcase}
                                    options={
                                        <>
                                            <option value="">None / Not Applicable</option>
                                            {projects.map(p => (
                                                <option key={p._id} value={p._id}>{p.projectName}</option>
                                            ))}
                                        </>
                                    }
                                />
                                <InputField
                                    label="Subject *"
                                    placeholder="Brief summary of the issue (e.g., Salary Discrepancy)"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    icon={FileText}
                                />
                            </div>

                            {/* Description */}
                            <div className="group">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1 transition-colors group-focus-within:text-blue-600">Detailed Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    rows="6"
                                    placeholder="Please describe the issue in detail. Include any relevant steps to reproduce if technical..."
                                    className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300 resize-none leading-relaxed hover:border-slate-300"
                                ></textarea>
                            </div>

                            {/* Footer Section: Attachments & Tags */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                                <MultiSelect
                                    label="Tag Colleagues"
                                    placeholder="Select team members..."
                                    options={colleagues}
                                    selected={formData.mentionedEmployees}
                                    onChange={(vals) => setFormData(prev => ({ ...prev, mentionedEmployees: vals }))}
                                />

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">Attachments</label>
                                    <label className="flex flex-col items-center justify-center w-full h-[56px] bg-slate-50 border border-slate-200 border-dashed rounded-xl cursor-pointer hover:bg-slate-100 hover:border-blue-400 transition-all group relative overflow-hidden">

                                        {formData.attachment ? (
                                            <div className="flex items-center gap-3 text-blue-600 z-10 p-2">
                                                <div className="bg-blue-100 p-1.5 rounded-lg">
                                                    <FileText size={18} />
                                                </div>
                                                <span className="text-sm font-medium truncate max-w-[200px]">{formData.attachment.name}</span>
                                                <button
                                                    onClick={(e) => { e.preventDefault(); setFormData(prev => ({ ...prev, attachment: null })) }}
                                                    className="p-1 hover:bg-slate-200 rounded-full transition-colors ml-2"
                                                >
                                                    <X size={14} className="text-slate-500 hover:text-slate-700" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 text-slate-400 group-hover:text-blue-600 transition-colors z-10">
                                                <Paperclip size={18} />
                                                <span className="text-sm font-medium">Upload File or Screenshot</span>
                                            </div>
                                        )}

                                        <input type="file" className="hidden" onChange={handleFileChange} />
                                    </label>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="border-t border-slate-100 pt-8 mt-4 flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/employee/tickets')}
                                    className="px-6 py-3 rounded-xl text-slate-500 font-semibold hover:bg-slate-100 hover:text-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                            Processing...
                                        </span>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Submit Ticket
                                        </>
                                    )}
                                </motion.button>
                            </div>

                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default RaiseTicket;
