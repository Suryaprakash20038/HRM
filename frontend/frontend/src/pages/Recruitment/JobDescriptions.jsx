import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    PlusCircle,
    PencilLine,
    Trash2,
    FileText,
    Target,
    Layers,
    CheckCircle2
} from "lucide-react";
import "../../css/Candidate.css"; // Reusing Candidate CSS for consistency
import jobDescriptionService from "../../services/jobDescriptionService";

export default function JobDescriptions() {
    const [jds, setJds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [form, setForm] = useState({
        id: null,
        title: "",
        role: "",
        requiredSkills: "", // Comma separated for input
        experience: "",
        status: "Active"
    });

    useEffect(() => {
        loadJds();
    }, []);

    const loadJds = async () => {
        try {
            setIsLoading(true);
            const data = await jobDescriptionService.getAllJobDescriptions();
            setJds(data);
        } catch (error) {
            console.error("Failed to load JDs", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const payload = {
                ...form,
                requiredSkills: form.requiredSkills.split(',').map(s => s.trim()).filter(s => s)
            };

            if (isEditing) {
                await jobDescriptionService.updateJobDescription(form.id, payload);
            } else {
                await jobDescriptionService.createJobDescription(payload);
            }

            alert(`Job Description ${isEditing ? 'updated' : 'created'} successfully!`);
            resetForm();
            loadJds();
        } catch (error) {
            console.error("Save error:", error);
            alert("Failed to save: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (jd) => {
        setForm({
            id: jd._id,
            title: jd.title,
            role: jd.role,
            requiredSkills: jd.requiredSkills.join(', '),
            experience: jd.experience,
            status: jd.status
        });
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this Job Description?")) {
            try {
                await jobDescriptionService.deleteJobDescription(id);
                setJds(prev => prev.filter(jd => jd._id !== id));
            } catch (error) {
                console.error("Delete error:", error);
            }
        }
    };

    const resetForm = () => {
        setForm({
            id: null, title: "", role: "", requiredSkills: "", experience: "", status: "Active"
        });
        setIsEditing(false);
    };

    return (
        <div className="candidate-page" style={{ background: '#fdfbff', minHeight: '100vh' }}>
            <div className="container py-8">

                {/* BACK BUTTON */}
                <div className="mb-6">
                    <Link to="/recruitment" className="d-inline-flex align-items-center gap-2 text-[#663399] fw-bold text-decoration-none hover:translate-x-[-4px] transition-transform">
                        <ArrowLeft size={18} /> Back to Command
                    </Link>
                </div>

                <div className="mb-10">
                    <div className="d-flex align-items-center gap-3 mb-2">
                        <div style={{ width: 4, height: 28, backgroundColor: '#663399', borderRadius: 4 }}></div>
                        <h2 className="mb-0 fw-black text-[#2E1A47] tracking-tight" style={{ fontSize: '2.5rem', fontWeight: 900 }}>Mission Role Specifications</h2>
                    </div>
                    <p className="text-[#A3779D] fw-bold" style={{ fontSize: '1.1rem' }}>Define mission requirements and skill parameters for ATS clearance</p>
                </div>

                {/* FORM */}
                <form className="form-card" onSubmit={handleSubmit}>
                    <h4 className="form-title">{isEditing ? "Edit JD" : "Create New JD"}</h4>
                    <div className="form-grid">
                        <div className="form-item">
                            <label className="label">Job Title</label>
                            <input className="control" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Senior Backend Engineer" required />
                        </div>

                        <div className="form-item">
                            <label className="label">Role Key (Matches 'Applied Role')</label>
                            <input className="control" name="role" value={form.role} onChange={handleChange} placeholder="e.g. Backend Developer" required />
                        </div>

                        <div className="form-item full-width">
                            <label className="label">Required Skills (Comma Separated)</label>
                            <input className="control" name="requiredSkills" value={form.requiredSkills} onChange={handleChange} placeholder="e.g. Node.js, MongoDB, AWS, Docker" required />
                        </div>

                        <div className="form-item">
                            <label className="label">Experience (Years)</label>
                            <input className="control" type="text" name="experience" value={form.experience} onChange={handleChange} placeholder="e.g. 1-3" />
                        </div>

                        <div className="form-item">
                            <label className="label">Status</label>
                            <select className="control" name="status" value={form.status} onChange={handleChange}>
                                <option>Active</option>
                                <option>Inactive</option>
                                <option>Draft</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button className="btn primary" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save JD'}</button>
                        <button type="button" className="btn reset" onClick={resetForm}>Cancel</button>
                    </div>
                </form>

                {/* LIST */}
                <div className="list-section">
                    <div className="list-header">
                        <h3 className="list-title">Defined Roles</h3>
                    </div>
                    <div className="table-responsive">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Role Match Key</th>
                                    <th>Skills</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jds.map(jd => (
                                    <tr key={jd._id}>
                                        <td>{jd.title}</td>
                                        <td>{jd.role}</td>
                                        <td>
                                            <div style={{ maxWidth: '300px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                {jd.requiredSkills.slice(0, 5).map(s => (
                                                    <span key={s} style={{ fontSize: '0.7rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px' }}>{s}</span>
                                                ))}
                                                {jd.requiredSkills.length > 5 && <span style={{ fontSize: '0.7rem', color: '#64748b' }}>+{jd.requiredSkills.length - 5} more</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${jd.status === 'Active' ? 'badge-success' : 'badge-default'}`}>
                                                {jd.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <button className="btn p-2 border-0" style={{ color: '#663399', background: '#f3e8ff', borderRadius: '10px' }} onClick={() => handleEdit(jd)}>
                                                    <PencilLine size={18} />
                                                </button>
                                                <button className="btn p-2 border-0" style={{ color: '#dc2626', background: '#fee2e2', borderRadius: '10px' }} onClick={() => handleDelete(jd._id)}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {jds.length === 0 && <tr><td colSpan="5" className="empty-state">No Job Descriptions defined.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
