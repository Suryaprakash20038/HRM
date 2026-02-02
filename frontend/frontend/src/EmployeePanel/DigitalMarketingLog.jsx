import React, { useState, useEffect } from "react";
import socialMediaService from "../services/socialMediaService";
import { useAuth } from "../context/AuthContext";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter, FaYoutube, FaGlobe } from "react-icons/fa";
import { EMP_THEME } from "./theme";

const glass = {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(10px)",
    border: `1px solid ${EMP_THEME.softViolet}40`,
    borderRadius: "16px",
    boxShadow: `0 4px 30px ${EMP_THEME.royalAmethyst}20`,
    padding: "24px",
    color: EMP_THEME.midnightPlum
};

const DigitalMarketingLog = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [form, setForm] = useState({
        platform: "Facebook",
        postLink: "",
        description: "",
        postImage: null
    });

    const fetchLogs = async () => {
        try {
            const data = await socialMediaService.getMyLogs();
            setLogs(data);
        } catch (error) {
            console.error("Failed to fetch logs", error);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await socialMediaService.createLog(form);
            alert("Log submitted successfully!");
            setForm({ platform: "Facebook", postLink: "", description: "", postImage: null });
            fetchLogs();
        } catch (error) {
            console.error("Failed to submit log", error);
            alert("Failed to submit log");
        }
    };

    const getIcon = (platform) => {
        switch (platform) {
            case "Facebook": return <FaFacebook style={{ color: '#1877F2' }} />;
            case "Instagram": return <FaInstagram style={{ color: '#E1306C' }} />;
            case "LinkedIn": return <FaLinkedin style={{ color: '#0077B5' }} />;
            case "Twitter": return <FaTwitter style={{ color: '#1DA1F2' }} />;
            case "YouTube": return <FaYoutube style={{ color: '#FF0000' }} />;
            default: return <FaGlobe style={{ color: EMP_THEME.softViolet }} />;
        }
    };

    return (
        <div className="container-fluid p-4" style={{ backgroundColor: EMP_THEME.lilacMist, minHeight: '100vh' }}>
            <h2 className="mb-4" style={{ color: EMP_THEME.midnightPlum }}>Social Media Activity Log</h2>

            <div className="row g-4">
                <div className="col-md-4">
                    <div style={glass}>
                        <h5 className="mb-3" style={{ color: EMP_THEME.midnightPlum }}>New Post Log</h5>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label small text-muted">Platform</label>
                                <select
                                    className="form-select"
                                    value={form.platform}
                                    onChange={(e) => setForm({ ...form, platform: e.target.value })}
                                >
                                    <option>Facebook</option>
                                    <option>Instagram</option>
                                    <option>LinkedIn</option>
                                    <option>Twitter</option>
                                    <option>YouTube</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label small text-muted">Post Link</label>
                                <input
                                    type="url"
                                    className="form-control"
                                    required
                                    value={form.postLink}
                                    onChange={(e) => setForm({ ...form, postLink: e.target.value })}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label small text-muted">Description</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="mb-3">
                                <label className="form-label small text-muted">Screenshot/Image</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    onChange={(e) => setForm({ ...form, postImage: e.target.files[0] })}
                                />
                            </div>
                            <button type="submit" className="btn w-100" style={{ backgroundColor: EMP_THEME.royalAmethyst, color: 'white' }}>Submit Log</button>
                        </form>
                    </div>
                </div>

                <div className="col-md-8">
                    <div style={glass}>
                        <h5 className="mb-3">Recent Logs</h5>
                        <div className="table-responsive">
                            <table className="table table-hover mb-0" style={{ background: "transparent" }}>
                                <thead>
                                    <tr>
                                        <th style={{ color: EMP_THEME.midnightPlum }}>Date</th>
                                        <th style={{ color: EMP_THEME.midnightPlum }}>Platform</th>
                                        <th style={{ color: EMP_THEME.midnightPlum }}>Link</th>
                                        <th style={{ color: EMP_THEME.midnightPlum }}>Description</th>
                                        <th style={{ color: EMP_THEME.midnightPlum }}>Image</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map(log => (
                                        <tr key={log._id}>
                                            <td style={{ color: EMP_THEME.midnightPlum }}>{new Date(log.date).toLocaleDateString()}</td>
                                            <td style={{ color: EMP_THEME.midnightPlum }}><span className="me-2">{getIcon(log.platform)}</span> {log.platform}</td>
                                            <td><a href={log.postLink} target="_blank" rel="noreferrer" style={{ color: EMP_THEME.royalAmethyst }}>View Post</a></td>
                                            <td style={{ color: EMP_THEME.softViolet }}>{log.description}</td>
                                            <td>
                                                {log.postImage && (
                                                    <a href={`http://localhost:5000/${log.postImage}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary">
                                                        View
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {logs.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="text-center text-muted py-4">No logs found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DigitalMarketingLog;
