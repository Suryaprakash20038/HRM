import React, { useState } from 'react';
import mediaService from '../../services/mediaService';
import { FiX, FiLink, FiType, FiMonitor, FiImage } from 'react-icons/fi';

const AddPostModal = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState({
        platform: 'Facebook',
        postLink: '',
        description: '',
        image: null // New state for image file
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setForm({ ...form, image: e.target.files[0] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await mediaService.createPost(form);
            onSuccess();
        } catch (err) {
            console.error('Failed to create post:', err);
            setError('Failed to create post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="modal fade show"
            style={{ display: 'block', backgroundColor: 'rgba(46, 26, 71, 0.4)', backdropFilter: 'blur(8px)', zIndex: 1060 }}
            tabIndex="-1"
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-[0_30px_60px_-15px_rgba(102,51,153,0.3)]" style={{ borderRadius: '32px', background: '#ffffff', border: '1px solid #E6C7E6' }}>
                    <div className="modal-header border-bottom-0 pt-8 px-8 d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                            <div style={{ width: 4, height: 24, backgroundColor: '#663399', borderRadius: 4 }}></div>
                            <h5 className="modal-title fw-black text-[#2E1A47] tracking-tight" style={{ fontWeight: 900 }}>Dispatch New Intelligence</h5>
                        </div>
                        <button
                            type="button"
                            className="btn-close shadow-none"
                            onClick={onClose}
                            aria-label="Close"
                        ></button>
                    </div>

                    <div className="modal-body p-8">
                        {error && (
                            <div className="alert border-0 py-3 mb-6" style={{ backgroundColor: '#fff1f2', color: '#e11d48', borderRadius: '16px', fontWeight: 700, fontSize: '0.85rem' }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="form-label text-[#663399] fw-black small text-uppercase tracking-widest mb-2">
                                    <FiMonitor className="me-2" /> Deployment Platform
                                </label>
                                <select
                                    className="form-select border-2"
                                    style={{ borderRadius: '14px', padding: '12px', border: '2px solid #f1f5f9', fontWeight: 600, color: '#2E1A47' }}
                                    value={form.platform}
                                    onChange={e => setForm({ ...form, platform: e.target.value })}
                                    required
                                >
                                    <option value="Facebook">Facebook</option>
                                    <option value="Instagram">Instagram</option>
                                    <option value="LinkedIn">LinkedIn</option>
                                    <option value="Twitter">Twitter</option>
                                    <option value="YouTube">YouTube</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="form-label text-[#663399] fw-black small text-uppercase tracking-widest mb-2">
                                    <FiLink className="me-2" /> Strategic Link
                                </label>
                                <input
                                    type="url"
                                    className="form-control border-2"
                                    style={{ borderRadius: '14px', padding: '12px', border: '2px solid #f1f5f9', fontWeight: 600, color: '#2E1A47' }}
                                    placeholder="https://terminal.secure.link"
                                    value={form.postLink}
                                    onChange={e => setForm({ ...form, postLink: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="form-label text-[#663399] fw-black small text-uppercase tracking-widest mb-2">
                                    <FiImage className="me-2" /> Visual Asset (Optional)
                                </label>
                                <input
                                    type="file"
                                    className="form-control border-2"
                                    style={{ borderRadius: '14px', padding: '10px', border: '2px solid #f1f5f9', fontWeight: 600, color: '#2E1A47' }}
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>

                            <div className="mb-10">
                                <label className="form-label text-[#663399] fw-black small text-uppercase tracking-widest mb-2">
                                    <FiType className="me-2" /> Strategic Briefing (Optional)
                                </label>
                                <textarea
                                    className="form-control border-2"
                                    style={{ borderRadius: '14px', padding: '12px', border: '2px solid #f1f5f9', fontWeight: 600, color: '#2E1A47', resize: 'none' }}
                                    rows="3"
                                    placeholder="Brief operational summary..."
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="d-flex gap-3">
                                <button
                                    type="submit"
                                    className="btn w-75 py-3 fw-black text-uppercase tracking-widest"
                                    disabled={loading}
                                    style={{
                                        borderRadius: '16px',
                                        backgroundColor: '#663399',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        border: 'none',
                                        boxShadow: '0 8px 20px -5px rgba(102, 51, 153, 0.4)'
                                    }}
                                >
                                    {loading ? 'Transmitting...' : 'Authorize Dispatch'}
                                </button>
                                <button
                                    type="button"
                                    className="btn w-25 py-3 fw-black text-uppercase tracking-widest"
                                    onClick={onClose}
                                    style={{
                                        borderRadius: '16px',
                                        backgroundColor: 'white',
                                        color: '#A3779D',
                                        fontSize: '0.75rem',
                                        border: '2px solid #f1f5f9'
                                    }}
                                >
                                    Abort
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddPostModal;
