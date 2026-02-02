import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    Settings,
    Palette,
    FileText,
    RotateCcw,
    Save,
    Search,
    CheckCircle2,
    AlertCircle,
    FileBox,
    Layout,
    Type,
    Briefcase,
    UserCheck,
    TrendingUp,
    Phone,
    ArrowRightCircle,
    Award,
    LogOut,
    UploadCloud,
    X
} from "lucide-react";
import DesignSelection from "../../components/Recruitment/DesignSelection";

const RecruitmentSettings = () => {
    const [activeTab, setActiveTab] = useState("general");

    // General Settings State
    const [settings, setSettings] = useState({
        googleSpreadsheetId: "",
        syncFrequencyMinutes: 60,
        isAutoSyncEnabled: true,
    });

    // Branding Settings State
    const [branding, setBranding] = useState({
        companyName: "",
        companyAddress: "",
        logo: { url: "" },
        signature: { url: "" },
        headerContent: '<div style="text-align: center;"><h1>My Company</h1></div>',
        footerContent: '<div style="text-align: center;"><p>Address, City, Country</p></div>'
    });
    const [logoFile, setLogoFile] = useState(null);
    const [signatureFile, setSignatureFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [signaturePreview, setSignaturePreview] = useState(null);
    const [letterPadFile, setLetterPadFile] = useState(null);
    const [letterPadPreview, setLetterPadPreview] = useState(null);

    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        fetchSettings();
        if (activeTab === 'branding') {
            fetchBranding();
        }
    }, [activeTab]);

    // Fetch General Settings
    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/recruitment-settings`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                setSettings(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    };

    // Fetch Branding Settings
    const fetchBranding = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/recruitment-settings/branding`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                setBranding(response.data.data);
                // Set initial previews
                if (response.data.data.logo?.url) setLogoPreview(response.data.data.logo.url);
                if (response.data.data.signature?.url) setSignaturePreview(response.data.data.signature.url);
                if (response.data.data.letterPad?.url) setLetterPadPreview(response.data.data.letterPad.url);
            }
        } catch (error) {
            console.error("Error fetching branding:", error);
            toast.error("Failed to load branding settings.");
        }
    };

    // General Settings Handlers
    const handleSettingsChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings({
            ...settings,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/recruitment-settings`,
                settings,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) toast.success("Settings updated successfully!");
            else toast.error(response.data.message);
        } catch (error) {
            toast.error("Failed to update settings.");
        } finally {
            setLoading(false);
        }
    };

    const handleManualSync = async () => {
        setSyncing(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/recruitment-settings/sync`,
                { googleSpreadsheetId: settings.googleSpreadsheetId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) toast.success(`Sync Complete: ${response.data.data.message}`);
            else toast.error(response.data.message);
        } catch (error) {
            toast.error("Manual sync failed.");
        } finally {
            setSyncing(false);
        }
    };

    // Branding Handlers
    const handleBrandingChange = (e) => {
        const { name, value } = e.target;
        setBranding({ ...branding, [name]: value });
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }

            if (type === 'logo') {
                setLogoFile(file);
                setLogoPreview(URL.createObjectURL(file));
            } else if (type === 'signature') {
                setSignatureFile(file);
                setSignaturePreview(URL.createObjectURL(file));
            } else if (type === 'letterpad') {
                setLetterPadFile(file);
                setLetterPadPreview(URL.createObjectURL(file));
                toast.success('Letter pad image selected. Click Save to upload.');
            }
        }
    };

    // Helper to format preview content (replace placeholders)
    const getFormattedPreview = (content) => {
        if (!content) return '';
        let processed = content;
        // Replace {{company_address}}
        processed = processed.replace(/{{company_address}}/g, branding.companyAddress || 'Address, City, Country');
        // Legacy fallback: Replace static string if user has set a company address
        if (branding.companyAddress && processed.includes('Address, City, Country')) {
            processed = processed.replace('Address, City, Country', branding.companyAddress);
        }
        return processed;
    };

    const handleSaveBranding = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append('companyName', branding.companyName);
            formData.append('companyAddress', branding.companyAddress); // Fixed: Ensure address is sent
            formData.append('headerContent', branding.headerContent);
            formData.append('footerContent', branding.footerContent);
            if (logoFile) formData.append('logo', logoFile);
            if (signatureFile) formData.append('signature', signatureFile);
            if (letterPadFile) formData.append('letterPad', letterPadFile);

            const response = await axios.put(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/recruitment-settings/branding`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                toast.success("Branding updated successfully!");
                setBranding(response.data.data);
            }
        } catch (error) {
            console.error("Error updating branding:", error);
            toast.error("Failed to update branding.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid p-8" style={{ backgroundColor: "#fdfbff", minHeight: "100vh" }}>
            <div className="mb-6">
                <Link to="/recruitment" className="d-inline-flex align-items-center gap-2 text-[#663399] fw-bold text-decoration-none hover:translate-x-[-4px] transition-transform">
                    <ArrowLeft size={18} /> Back to Command
                </Link>
            </div>

            <div className="card shadow-[0_15px_40px_-10px_rgba(102,51,153,0.1)] border-0 rounded-[32px] overflow-hidden" style={{ border: '1px solid #E6C7E6' }}>
                <div className="card-header bg-white border-0 pt-8 pb-4 px-8">
                    <div className="d-flex align-items-center gap-3">
                        <div style={{ width: 4, height: 24, backgroundColor: '#663399', borderRadius: 4 }}></div>
                        <h4 className="mb-0 fw-black text-[#2E1A47] tracking-tight" style={{ fontWeight: 900 }}>
                            Protocol Calibration
                        </h4>
                    </div>
                </div>

                {/* Tabs */}
                <div className="card-header bg-white border-bottom border-light pt-0">
                    <ul className="nav nav-pills card-header-tabs gap-2">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'general' ? 'active' : ''}`}
                                onClick={() => setActiveTab('general')}
                                style={{
                                    backgroundColor: activeTab === 'general' ? '#663399' : 'transparent',
                                    color: activeTab === 'general' ? '#ffffff' : '#663399',
                                    fontWeight: '600',
                                    borderRadius: '8px',
                                    border: activeTab === 'general' ? 'none' : '1px solid #E6C7E6',
                                    padding: '8px 20px',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                General Settings
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'branding' ? 'active' : ''}`}
                                onClick={() => setActiveTab('branding')}
                                style={{
                                    backgroundColor: activeTab === 'branding' ? '#663399' : 'transparent',
                                    color: activeTab === 'branding' ? '#ffffff' : '#663399',
                                    fontWeight: '600',
                                    borderRadius: '8px',
                                    border: activeTab === 'branding' ? 'none' : '1px solid #E6C7E6',
                                    padding: '8px 20px',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Company Branding
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'templates' ? 'active' : ''}`}
                                onClick={() => setActiveTab('templates')}
                                style={{
                                    backgroundColor: activeTab === 'templates' ? '#663399' : 'transparent',
                                    color: activeTab === 'templates' ? '#ffffff' : '#663399',
                                    fontWeight: '600',
                                    borderRadius: '8px',
                                    border: activeTab === 'templates' ? 'none' : '1px solid #E6C7E6',
                                    padding: '8px 20px',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Letter Templates
                            </button>
                        </li>
                    </ul>
                </div>

                <div className="card-body p-4">
                    {/* General Settings Tab */}
                    {activeTab === 'general' && (
                        <form onSubmit={handleSaveSettings}>
                            <div className="mb-4">
                                <label className="form-label fw-semibold">Google Spreadsheet ID</label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    name="googleSpreadsheetId"
                                    value={settings.googleSpreadsheetId}
                                    onChange={handleSettingsChange}
                                    placeholder="Enter the ID from your Google Sheet URL"
                                />
                                <div className="form-text" style={{ color: '#A3779D' }}>
                                    Extract this from the URL: https://docs.google.com/spreadsheets/d/<b>SPREADSHEET_ID</b>/edit
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-4">
                                    <label className="form-label fw-semibold">Sync Frequency (Minutes)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="syncFrequencyMinutes"
                                        value={settings.syncFrequencyMinutes}
                                        onChange={handleSettingsChange}
                                        min="0.5"
                                        step="0.5"
                                    />
                                </div>
                                <div className="col-md-6 mb-4 d-flex align-items-center">
                                    <div className="form-check form-switch mt-4">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="isAutoSyncEnabled"
                                            checked={settings.isAutoSyncEnabled}
                                            onChange={handleSettingsChange}
                                            style={{ width: "3em", height: "1.5em", backgroundColor: settings.isAutoSyncEnabled ? '#663399' : '#E6C7E6', borderColor: '#663399' }}
                                        />
                                        <label className="form-check-label ms-2 fw-semibold" style={{ color: '#2E1A47' }}>Enable Auto-Sync</label>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mt-4 border-top pt-4">
                                <button type="button" className="btn btn-outline-purple btn-lg" style={{ borderColor: '#663399', color: '#663399' }} onClick={handleManualSync} disabled={syncing || !settings.googleSpreadsheetId}>
                                    {syncing ? "Syncing..." : "Sync Now"}
                                </button>
                                <button type="submit" className="btn btn-lg px-5" style={{ backgroundColor: '#663399', color: 'white' }} disabled={loading}>
                                    {loading ? "Saving..." : "Save Settings"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Branding Settings Tab */}
                    {activeTab === 'branding' && (
                        <div className="row">
                            <div className="col-lg-6">
                                <form onSubmit={handleSaveBranding}>
                                    <h5 className="mb-3 text-secondary">Company Details</h5>
                                    <div className="mb-3">
                                        <label className="form-label">Company Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="companyName"
                                            value={branding.companyName}
                                            onChange={handleBrandingChange}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Footer Text / Company Address</label>
                                        <textarea
                                            className="form-control"
                                            name="companyAddress"
                                            rows="3"
                                            value={branding.companyAddress || ''}
                                            onChange={handleBrandingChange}
                                            placeholder="Enter address OR contact info like: 🌐 www.site.com | ✉️ email@domain.com | 📞 +91 9876543210"
                                        />
                                        <small className="text-muted">This text will appear at the bottom of the PDF. Supports emojis!</small>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Company Logo</label>
                                        <input type="file" className="form-control" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
                                        <small className="text-muted">Recommended: PNG with transparent background.</small>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Authorized Signature</label>
                                        <input type="file" className="form-control" accept="image/*" onChange={(e) => handleFileChange(e, 'signature')} />
                                        <small className="text-muted">Upload the e-signature of the signing authority.</small>
                                    </div>





                                    <div className="text-end mt-4">
                                        <button type="submit" className="btn px-4" style={{ backgroundColor: '#663399', color: 'white' }} disabled={loading}>
                                            {loading ? "Saving..." : "Save Branding"}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="col-lg-6">
                                <h5 className="mb-3 text-secondary">Live Preview (Letterhead)</h5>
                                <div className="border rounded bg-white shadow-sm p-0 position-relative" style={{
                                    minHeight: '600px',
                                    width: '100%',
                                    overflow: 'hidden',
                                    backgroundImage: letterPadPreview ? `url(${letterPadPreview})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}>

                                    {/* Header Preview */}
                                    <div className={`p-4 ${letterPadPreview ? '' : 'border-bottom bg-light'}`} style={{ backgroundColor: letterPadPreview ? 'rgba(255,255,255,0.7)' : '' }}>
                                        {logoPreview && (
                                            <div className="mb-2 text-center">
                                                <img src={logoPreview} alt="Company Logo" style={{ maxHeight: '60px' }} crossOrigin="anonymous" />
                                            </div>
                                        )}
                                        <div dangerouslySetInnerHTML={{ __html: getFormattedPreview(branding.headerContent) }} />
                                    </div>

                                    {/* Body Preview */}
                                    <div className="p-5">
                                        <p className="text-muted">Ref: {branding.companyName || 'CMP'}/OFFER/2026/001</p>
                                        <p className="mt-4"><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                                        <p className="mt-4">Dear Candidate,</p>
                                        <p>This is a preview of how the body content will appear on your generated letters. The header and footer you configure will wrap this content.</p>
                                        <p>We are pleased to offer you the position of...</p>
                                        <br />
                                        <br />
                                        <p>Sincerely,</p>
                                        {signaturePreview && (
                                            <div className="mb-2">
                                                <img src={signaturePreview} alt="Signature" style={{ maxHeight: '50px' }} />
                                            </div>
                                        )}
                                        <p><strong>HR Manager</strong><br />{branding.companyName}</p>
                                    </div>

                                    {/* Footer Preview */}
                                    <div className={`p-3 ${letterPadPreview ? '' : 'border-top bg-light'} position-absolute bottom-0 w-100 text-center text-muted small`} style={{ backgroundColor: letterPadPreview ? 'rgba(255,255,255,0.7)' : '' }}>
                                        <div dangerouslySetInnerHTML={{ __html: getFormattedPreview(branding.footerContent) }} />
                                    </div>

                                </div>
                            </div>
                        </div>
                    )}

                    {/* Letter Templates Tab */}
                    {activeTab === 'templates' && (
                        <LetterTemplatesTab />
                    )}
                </div>
            </div>

            <style>{`
                .back-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    text-decoration: none;
                    color: #64748b;
                    font-weight: 600;
                    background: white;
                    padding: 10px 20px;
                    border-radius: 50px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
                    transition: all 0.2s ease;
                }
                .back-btn:hover {
                    background: white;
                    color: #663399;
                    transform: translateX(-5px);
                    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.05);
                }
            `}</style>
        </div>
    );
};

// --- NEW: Employee Selection Modal ---
const EmployeeSelectionModal = ({ onSelect, onCancel }) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/employees?limit=1000`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    setEmployees(res.data.data.employees);
                }
            } catch (error) {
                console.error("Failed to load employees", error);
                toast.error("Could not load employees");
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    const filtered = employees.filter(e =>
        e.firstName.toLowerCase().includes(search.toLowerCase()) ||
        e.lastName.toLowerCase().includes(search.toLowerCase()) ||
        e.employeeId.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" style={{ color: '#663399' }}>Select Employee</h5>
                        <button type="button" className="btn-close" onClick={onCancel}></button>
                    </div>
                    <div className="modal-body">
                        <input
                            className="form-control mb-3"
                            placeholder="Search by name or ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            autoFocus
                        />
                        <div className="list-group" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {loading ? <p className="text-center p-3">Loading...</p> :
                                filtered.length === 0 ? <p className="text-center p-3">No employees found.</p> :
                                    filtered.map(emp => (
                                        <button
                                            key={emp._id}
                                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                            onClick={() => onSelect(emp)}
                                        >
                                            <div>
                                                <div className="fw-bold">{emp.firstName} {emp.lastName}</div>
                                                <small className="text-muted">{emp.position} • {emp.department}</small>
                                            </div>
                                            <span className="badge bg-secondary">{emp.employeeId}</span>
                                        </button>
                                    ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LetterTemplatesTab = () => {
    // ... EXISTING STATE ...
    const [templates, setTemplates] = useState([]);
    const [previewTemplate, setPreviewTemplate] = useState(null);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedTemplateIds, setSelectedTemplateIds] = useState([]);

    // ... NEW STATE FOR GENERATION ...
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [generationData, setGenerationData] = useState(null); // { designId, letterType }
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showContentForm, setShowContentForm] = useState(false);
    const [letterForm, setLetterForm] = useState({});

    // Retrieve import content from existing code
    // ... existing useEffect ...
    useEffect(() => {
        fetchTemplates();
    }, [refresh]);

    const fetchTemplates = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/recruitment-settings/templates`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) setTemplates(res.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this template?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/recruitment-settings/templates/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Template deleted');
            setRefresh(!refresh);
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleUploadTemplate = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const toastId = toast.loading('Uploading and extracting text...');

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/recruitment-settings/templates/upload`,
                formData,
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
            );

            if (res.data.success) {
                toast.dismiss(toastId);
                toast.success('Template uploaded from PDF!');
                setRefresh(!refresh);
            }
        } catch (error) {
            toast.dismiss(toastId);
            toast.error('Upload failed: ' + (error.response?.data?.message || error.message));
        }
    };

    // Categories for the card view
    const categories = [
        { id: 'Offer', label: 'Offer Letter', icon: Briefcase, color: '#663399', desc: 'Job offers and proposals' },
        { id: 'Appointment', label: 'Appointment Letter', icon: UserCheck, color: '#663399', desc: 'Confirmation of employment' },
        { id: 'Promotion', label: 'Promotion Letter', icon: TrendingUp, color: '#663399', desc: 'Employee promotions' },
        { id: 'Interview Call', label: 'Interview Call', icon: Phone, color: '#663399', desc: 'Interview invitations' },
        { id: 'Next Round', label: 'Next Round', icon: ArrowRightCircle, color: '#663399', desc: 'Follow-up interviews' },
        { id: 'Experience', label: 'Experience Letter', icon: Award, color: '#663399', desc: 'Service certificates' },
        { id: 'Relieving', label: 'Relieving Letter', icon: LogOut, color: '#663399', desc: 'Exit formalities' }
    ];

    const handleSelectTemplate = (id) => {
        if (selectedTemplateIds.includes(id)) {
            setSelectedTemplateIds(selectedTemplateIds.filter(tid => tid !== id));
        } else {
            setSelectedTemplateIds([...selectedTemplateIds, id]);
        }
    };

    const handleSelectAll = (e, list = templates) => {
        if (e.target.checked) {
            setSelectedTemplateIds(list.map(t => t._id));
        } else {
            setSelectedTemplateIds([]);
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedTemplateIds.length} templates?`)) return;

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            await Promise.all(selectedTemplateIds.map(id =>
                axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/recruitment-settings/templates/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ));

            toast.success("Templates deleted successfully");
            setRefresh(!refresh);
            setSelectedTemplateIds([]);
        } catch (error) {
            console.error("Bulk delete failed:", error);
            toast.error("Failed to delete some templates");
        } finally {
            setLoading(false);
        }
    };

    // --- NEW HANDLERS ---
    const [isDirectUpload, setIsDirectUpload] = useState(false);

    const handleManualUploadClick = () => {
        setIsDirectUpload(true);
        setShowEmployeeModal(true);
    };

    const handleManualFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!window.confirm(`Are you sure you want to send this PDF to ${selectedEmployee?.firstName}?`)) {
            e.target.value = null;
            return;
        }

        const toastId = toast.loading('Uploading and Sending...');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/recruitment-settings/templates/upload/direct`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
                    params: {
                        employeeId: selectedEmployee._id,
                        letterType: selectedCategory
                    }
                }
            );

            if (res.data.success) {
                toast.success('PDF Sent Successfully!');
            }
        } catch (err) {
            toast.error('Failed to send PDF');
            console.error(err);
        } finally {
            toast.dismiss(toastId);
            setIsDirectUpload(false);
            e.target.value = null;
        }
    };

    const initiateGeneration = (designId) => {
        setIsDirectUpload(false);
        // Find if it's a template or system design
        let template = templates.find(t => t._id === designId);
        let bodyContent = template ? template.bodyContent : '';

        setGenerationData({ designId, letterType: selectedCategory, bodyContent });
        setShowEmployeeModal(true);
    };

    const handleEmployeeSelect = (employee) => {
        setSelectedEmployee(employee);
        setShowEmployeeModal(false);

        if (isDirectUpload) {
            // Trigger Hidden File Upload
            document.getElementById('hidden-manual-upload')?.click();
            return;
        }

        // Pre-fill form
        setLetterForm({
            employeeName: `${employee.firstName} ${employee.lastName}`,
            designation: employee.position,
            joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toISOString().split('T')[0] : '',
            lastWorkingDay: '', // To be filled manually
            hrName: 'HR Manager', // Could be dynamic
            bodyContent: generationData.bodyContent || '',
            designId: generationData.designId,
            letterType: generationData.letterType
        });

        setShowContentForm(true);
    };

    const handleGenerateLetter = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Call Generate Endpoint
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/employees/${selectedEmployee._id}/generate-letter`,
                letterForm,
                {
                    headers: { Authorization: `Bearer ${token}` }
                    // Removed responseType: 'blob' as we now expect JSON
                }
            );

            if (response.data.success) {
                toast.success('Letter Generated & Sent Successfully!');
                setShowContentForm(false);
                setGenerationData(null);
                setSelectedEmployee(null);
            } else {
                toast.error('Failed to generate letter');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate letter');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* EDIT MODE */}
            {editingTemplate ? (
                <TemplateEditor
                    template={editingTemplate}
                    onCancel={() => setEditingTemplate(null)}
                    onSave={() => { setEditingTemplate(null); setRefresh(!refresh); }}
                />
            ) : showContentForm ? (
                // --- GENERATION FORM ---
                <div className="card shadow-sm">
                    <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Generate {selectedCategory} Letter</h5>
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowContentForm(false)}>Cancel</button>
                    </div>
                    <div className="card-body">
                        <h6 className="text-muted mb-4">Generating for: <strong className="text-dark">{selectedEmployee?.firstName} {selectedEmployee?.lastName}</strong></h6>
                        {/* Reusing ContentForm or inline form? Reuse ContentForm is cleaner if imported. */}
                        {/* Assuming ContentForm is available or mock it here since we are in same file context usually, but ContentForm is in components. We didn't import it in replaced code. Let's assume user wants simple form logic here or I inject it. */}
                        {/* I will use the IMPORTED ContentForm if variable is available. Let's check imports in original file. Original file line 1 has imports. */}
                        {/* Wait, I cannot see imports in this snippet. I will assume I need to add 'import ContentForm' or recreate the form simply here. */}
                        {/* To be safe, I will render a simple form here matching the logic. */}

                        <form onSubmit={handleGenerateLetter}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Employee Name</label>
                                    <input className="form-control" value={letterForm.employeeName} onChange={e => setLetterForm({ ...letterForm, employeeName: e.target.value })} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Designation</label>
                                    <input className="form-control" value={letterForm.designation} onChange={e => setLetterForm({ ...letterForm, designation: e.target.value })} required />
                                </div>
                                {(selectedCategory === 'Experience' || selectedCategory === 'Relieving') && (
                                    <>
                                        <div className="col-md-6">
                                            <label className="form-label">Joining Date</label>
                                            <input type="date" className="form-control" value={letterForm.joiningDate} onChange={e => setLetterForm({ ...letterForm, joiningDate: e.target.value })} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Last Working Day</label>
                                            <input type="date" className="form-control" value={letterForm.lastWorkingDay} onChange={e => setLetterForm({ ...letterForm, lastWorkingDay: e.target.value })} required />
                                        </div>
                                    </>
                                )}
                                <div className="col-12">
                                    <label className="form-label">HR Name</label>
                                    <input className="form-control" value={letterForm.hrName} onChange={e => setLetterForm({ ...letterForm, hrName: e.target.value })} required />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Body Content {selectedCategory === 'Experience' && <small className="text-muted">(Optional)</small>}</label>
                                    <textarea className="form-control" rows="5" value={letterForm.bodyContent} onChange={e => setLetterForm({ ...letterForm, bodyContent: e.target.value })}></textarea>
                                </div>
                            </div>
                            <div className="mt-4 text-end">
                                <button type="submit" className="btn" style={{ backgroundColor: '#663399', color: 'white' }} disabled={loading}>{loading ? 'Generating...' : 'Generate & Send PDF'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : (
                /* VIEW MODES */
                <>
                    {!selectedCategory ? (
                        // 1. CATEGORY GRID VIEW
                        <div>
                            <h5 className="mb-6 fw-black text-[#663399]" style={{ fontSize: '1.25rem', letterSpacing: '-0.5px' }}>Operational Letter Terminals</h5>
                            <div className="row g-6 mb-10">
                                {categories.map(cat => (
                                    <div className="col-md-6 col-lg-4" key={cat.id}>
                                        <div
                                            className="card h-100 shadow-[0_8px_25px_-5px_rgba(102,51,153,0.06)] border-0 text-center p-8"
                                            onClick={() => { setSelectedCategory(cat.id); setSelectedTemplateIds([]); }}
                                            style={{
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                borderRadius: '28px',
                                                border: '1px solid #E6C7E6',
                                                background: '#ffffff'
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.transform = 'translateY(-8px)';
                                                e.currentTarget.style.borderColor = '#663399';
                                                e.currentTarget.style.boxShadow = '0 15px 35px -10px rgba(102, 51, 153, 0.15)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.borderColor = '#E6C7E6';
                                                e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(102, 51, 153, 0.06)';
                                            }}
                                        >
                                            <div className="mb-4 d-inline-flex align-items-center justify-content-center mx-auto" style={{ width: 70, height: 70, borderRadius: '20px', background: '#f3e8ff', color: '#663399' }}>
                                                <cat.icon size={32} strokeWidth={2.5} />
                                            </div>
                                            <h5 className="fw-black text-[#2E1A47] mb-2">{cat.label}</h5>
                                            <p className="small mb-0 text-[#A3779D] fw-bold">{cat.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="d-flex justify-content-between align-items-center mb-6">
                                <h5 className="mb-0 fw-black text-[#2E1A47]">Template Repository</h5>
                                <div className="d-flex gap-3">
                                    {selectedTemplateIds.length > 0 && (
                                        <button className="btn d-flex align-items-center gap-2"
                                            style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '10px 20px', borderRadius: '14px', fontWeight: 800, fontSize: '0.8rem' }}
                                            onClick={handleBulkDelete} disabled={loading}>
                                            <RotateCcw size={16} /> Purge Selected ({selectedTemplateIds.length})
                                        </button>
                                    )}
                                    <button className="btn d-flex align-items-center gap-2"
                                        style={{ background: '#663399', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '16px', fontWeight: 800, fontSize: '0.85rem', boxShadow: '0 8px 20px -5px rgba(102, 51, 153, 0.4)' }}
                                        onClick={() => setEditingTemplate({})}>
                                        <FileBox size={18} /> Initialize New Prototype
                                    </button>
                                </div>
                            </div>

                            <div className="table-responsive bg-white rounded shadow-sm">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th style={{ width: '40px' }} className="ps-4">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    onChange={(e) => handleSelectAll(e)}
                                                    checked={templates.length > 0 && selectedTemplateIds.length === templates.length}
                                                />
                                            </th>
                                            <th>Template Name</th>
                                            <th>Type</th>
                                            <th>Subject</th>
                                            <th className="text-end pe-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {templates.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="text-center py-5 text-muted">
                                                    No custom templates found. Create one to get started.
                                                </td>
                                            </tr>
                                        ) : (
                                            templates.map(t => (
                                                <tr key={t._id}>
                                                    <td className="ps-4">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            checked={selectedTemplateIds.includes(t._id)}
                                                            onChange={() => handleSelectTemplate(t._id)}
                                                        />
                                                    </td>
                                                    <td className="fw-bold fs-6">{t.name}</td>
                                                    <td>
                                                        <span className={`badge bg-${categories.find(c => c.id === t.type)?.color || 'secondary'}-subtle text-${categories.find(c => c.id === t.type)?.color || 'secondary'} border border-${categories.find(c => c.id === t.type)?.color || 'secondary'}-subtle`}>
                                                            {t.type}
                                                        </span>
                                                    </td>
                                                    <td className="text-truncate text-muted" style={{ maxWidth: '300px' }}>{t.subject}</td>
                                                    <td className="text-end pe-4">
                                                        <button className="btn btn-sm border-0 me-2" style={{ color: '#663399' }} onClick={() => setEditingTemplate(t)} title="Edit">
                                                            <PencilLine size={18} />
                                                        </button>
                                                        <button className="btn btn-sm border-0" style={{ color: '#dc2626' }} onClick={() => handleDelete(t._id)} title="Delete">
                                                            <RotateCcw size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        // 2. TEMPLATE DETAILS VIEW
                        <div>
                            <div className="d-flex align-items-center mb-4 justify-content-between">
                                <div className="d-flex align-items-center">
                                    <button className="btn d-flex align-items-center gap-2 mb-4"
                                        style={{ background: '#f3e8ff', color: '#663399', border: 'none', padding: '10px 20px', borderRadius: '14px', fontWeight: 800, fontSize: '0.8rem' }}
                                        onClick={() => { setSelectedCategory(null); setSelectedTemplateIds([]); }}>
                                        <ArrowLeft size={16} /> Return to Intelligence
                                    </button>
                                </div>
                                <h4 className="mb-4 fw-black text-[#2E1A47]">{categories.find(c => c.id === selectedCategory)?.label} Repositories</h4>
                            </div>

                            {/* System Designs (Visual) */}
                            <div className="mb-5">
                                {/* Hidden Input for Manual Upload */}
                                <input
                                    type="file"
                                    id="hidden-manual-upload"
                                    style={{ display: 'none' }}
                                    accept="application/pdf"
                                    onChange={handleManualFileSelect}
                                />

                                <DesignSelection
                                    selectedDesign={null}
                                    onSelectDesign={(id) => initiateGeneration(id)} // TRIGGER GENERATION
                                    letterType={selectedCategory}
                                    customTemplates={templates}
                                    onUploadTemplate={handleUploadTemplate}
                                    onManualUpload={
                                        (selectedCategory === 'Experience' || selectedCategory === 'Relieving' || selectedCategory === 'Promotion')
                                            ? handleManualUploadClick
                                            : null
                                    }
                                />
                                <div className="text-center mt-6 text-[#A3779D] fw-bold small d-flex align-items-center justify-content-center gap-2">
                                    <AlertCircle size={14} /> Design selection triggers immediate tactical generation for the active agent.
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {showEmployeeModal && (
                <EmployeeSelectionModal
                    onSelect={handleEmployeeSelect}
                    onCancel={() => setShowEmployeeModal(false)}
                />
            )}

            {/* Template Editor Render (Simplified for this snippet, assumes it's defined above or outside) */}
        </div>
    );
};

const TemplateEditor = ({ template, onCancel, onSave }) => {
    const [formData, setFormData] = useState({ ...template });
    const [loading, setLoading] = useState(false);

    const placeholders = ['{{candidate_name}}', '{{job_role}}', '{{interview_date}}', '{{interview_time}}', '{{interview_mode}}', '{{hr_name}}', '{{company_name}}', '{{joining_date}}', '{{salary}}', '{{last_working_day}}'];

    const insertPlaceholder = (ph) => {
        setFormData(prev => ({ ...prev, bodyContent: prev.bodyContent + ph }));
    };

    const save = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/recruitment-settings/templates`;

            if (template._id) {
                // Update
                await axios.put(`${url}/${template._id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
                toast.success('Template updated');
            } else {
                // Create
                await axios.post(url, formData, { headers: { Authorization: `Bearer ${token}` } });
                toast.success('Template created');
            }
            onSave();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={save}>
            <div className="d-flex justify-content-between mb-4">
                <h5 className="text-primary">{template._id ? 'Edit Template' : 'New Template'}</h5>
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onCancel}>Cancel</button>
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Template Name</label>
                    <input className="form-control" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Senior Dev Offer" />
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Type</label>
                    <select className="form-select" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                        <option>Offer</option>
                        <option>Appointment</option>
                        <option>Interview Call</option>
                        <option>Next Round</option>
                        <option>Experience</option>
                        <option>Relieving</option>
                        <option>Rejection</option>
                    </select>
                </div>
                <div className="col-12 mb-3">
                    <label className="form-label">Email Subject</label>
                    <input className="form-control" required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} />
                </div>

                <div className="col-12 mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label">Body Content (HTML Supported)</label>
                        <div className="dropdown">
                            <button className="btn btn-sm btn-outline-info dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                Insert Variable
                            </button>
                            <ul className="dropdown-menu">
                                {placeholders.map(p => (
                                    <li key={p}><button type="button" className="dropdown-item" onClick={() => insertPlaceholder(p)}>{p}</button></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <textarea
                        className="form-control font-monospace"
                        rows="15"
                        required
                        value={formData.bodyContent}
                        onChange={e => setFormData({ ...formData, bodyContent: e.target.value })}
                        placeholder="<html> ... </html> or plain text"
                    ></textarea>
                    <div className="form-text">
                        Tip: You can use HTML tags like &lt;b&gt;, &lt;p&gt;, &lt;br&gt; for formatting.
                        For System Designs (Classic, Modern, etc.), the body content is inserted into the design.
                    </div>
                </div>
            </div>

            <div className="text-end">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Template'}
                </button>
            </div>
        </form>
    );
};

export default RecruitmentSettings;
