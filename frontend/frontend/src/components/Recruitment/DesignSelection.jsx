import React, { useState } from 'react';
import './DesignSelection.css';

// Component to render the mini layout thumbnail
const LayoutThumbnail = ({ type }) => {
    // Extract style name from ID (e.g., 'offer-classic' -> 'classic')
    const style = type.split('-')[1] || 'classic';
    const className = `layout-thumb thumb-${style}`;

    return (
        <div className={className}>
            <div className="sk-header"></div>
            <div className="sk-line medium"></div>
            <div className="sk-line"></div>
            <div className="sk-line"></div>
            <div className="sk-line short"></div>
            <div className="sk-line"></div>
            <div className="sk-footer"></div>
        </div>
    );
};

// Component to render the full preview paper (simplified mock)
const FullPreviewPaper = ({ design }) => {
    const style = design.id.split('-')[1] || 'classic';

    // Base mock content wrapper
    const MockContent = () => (
        <div style={{ position: 'relative', zIndex: 10 }}>
            <p style={{ marginBottom: '15px' }}><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
            <p style={{ marginBottom: '15px' }}><strong>To:</strong> [Candidate Name]</p>

            <div style={{ margin: '30px 0' }}>
                <h3 style={{ marginBottom: '15px' }}>Subject: {design.category} Letter</h3>
                <p style={{ marginBottom: '10px' }}>Dear Candidate,</p>
                <p style={{ marginBottom: '10px' }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.</p>
                <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.</p>
            </div>

            <div style={{ marginTop: '50px' }}>
                <div style={{ height: '40px', width: '150px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', marginBottom: '10px' }}>[Signature]</div>
                <p style={{ fontWeight: 'bold' }}>[HR Name]</p>
                <p>HR Manager</p>
            </div>
        </div>
    );

    // Design configurations
    const getDesignLayout = () => {
        switch (style) {
            case 'modern':
                return (
                    <div className="preview-paper" style={{ padding: '0', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>
                        <div style={{ height: '15px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}></div>
                        <div style={{ padding: '40px' }}>
                            <h1 style={{ color: '#1e293b', fontSize: '24px', marginBottom: '10px' }}>{design.category}</h1>
                            <div style={{ height: '4px', width: '40px', background: '#3b82f6', marginBottom: '30px', borderRadius: '2px' }}></div>
                            <MockContent />
                        </div>
                        <div style={{ height: '10px', background: '#f1f5f9', position: 'absolute', bottom: 0, width: '100%' }}></div>
                    </div>
                );
            case 'professional':
                return (
                    <div className="preview-paper" style={{ padding: '0', display: 'flex', fontFamily: "'Segoe UI', sans-serif" }}>
                        <div style={{ width: '40px', background: '#1e40af', minHeight: '100%' }}></div>
                        <div style={{ padding: '40px', flex: 1 }}>
                            <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '20px', marginBottom: '30px' }}>
                                <h1 style={{ color: '#1e40af', fontSize: '26px', margin: 0 }}>{design.category.toUpperCase()}</h1>
                            </div>
                            <MockContent />
                        </div>
                    </div>
                );
            case 'creative':
                return (
                    <div className="preview-paper" style={{ padding: '40px', fontFamily: "'Poppins', sans-serif", position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: '#8b5cf6', borderRadius: '50%', opacity: 0.1 }}></div>
                        <div style={{ position: 'absolute', bottom: '20px', left: '-20px', width: '100px', height: '100px', background: '#ec4899', borderRadius: '50%', opacity: 0.1 }}></div>
                        <h1 style={{ color: '#7c3aed', fontSize: '28px', marginBottom: '5px' }}>{design.category}</h1>
                        <p style={{ color: '#db2777', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '40px' }}>Official Communication</p>
                        <MockContent />
                    </div>
                );
            case 'minimal':
                return (
                    <div className="preview-paper" style={{ padding: '60px', fontFamily: "'Helvetica Neue', sans-serif" }}>
                        <h1 style={{ color: '#000', fontSize: '22px', fontWeight: '300', letterSpacing: '1px', marginBottom: '60px', textAlign: 'center' }}>{design.category.toUpperCase()}</h1>
                        <MockContent />
                    </div>
                );
            case 'executive':
                return (
                    <div className="preview-paper" style={{ padding: '3mm', background: '#fff', boxShadow: 'none' }}>
                        <div style={{ border: '2px solid #92400e', height: '100%', padding: '35px', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '20px', left: '0', right: '0', height: '1px', background: '#92400e', width: '80%', margin: '0 auto' }}></div>
                            <h1 style={{ color: '#92400e', fontFamily: "'Times New Roman', serif", fontSize: '32px', textAlign: 'center', margin: '30px 0 40px' }}>{design.category}</h1>
                            <div style={{ fontFamily: "'Georgia', serif", fontSize: '11px' }}>
                                <MockContent />
                            </div>
                            <div style={{ position: 'absolute', bottom: '20px', left: '0', right: '0', height: '1px', background: '#92400e', width: '80%', margin: '0 auto' }}></div>
                        </div>
                    </div>
                );
            case 'elegant':
                return (
                    <div className="preview-paper" style={{ padding: '40px', fontFamily: "'Playfair Display', serif" }}>
                        <div style={{ borderTop: '3px double #7c3aed', borderBottom: '3px double #7c3aed', padding: '20px 0', marginBottom: '40px', textAlign: 'center' }}>
                            <h1 style={{ color: '#5b21b6', margin: 0, fontSize: '28px', fontStyle: 'italic' }}>{design.category} Letter</h1>
                        </div>
                        <MockContent />
                    </div>
                );
            case 'corporate':
                return (
                    <div className="preview-paper" style={{ padding: '0', fontFamily: "'Arial', sans-serif" }}>
                        <div style={{ background: '#0f172a', padding: '30px 40px', color: 'white' }}>
                            <h1 style={{ margin: 0, fontSize: '24px', letterSpacing: '1px' }}>{design.category}</h1>
                            <p style={{ margin: '5px 0 0', opacity: 0.7, fontSize: '11px' }}>OFFICIAL DOCUMENT</p>
                        </div>
                        <div style={{ padding: '40px', background: '#f8fafc', minHeight: '500px' }}>
                            <div style={{ background: 'white', padding: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                <MockContent />
                            </div>
                        </div>
                    </div>
                );
            case 'vibrant':
                return (
                    <div className="preview-paper" style={{ padding: '35px', fontFamily: "'Verdana', sans-serif', border: 'none" }}>
                        <div style={{ borderLeft: '8px solid #be123c', paddingLeft: '30px', height: '100%' }}>
                            <h1 style={{ color: '#be123c', fontSize: '36px', fontWeight: '900', marginBottom: '10px' }}>{design.category}</h1>
                            <div style={{ width: '100%', height: '2px', background: 'linear-gradient(90deg, #be123c, transparent)', marginBottom: '30px' }}></div>
                            <MockContent />
                        </div>
                    </div>
                );
            case 'fresh':
                return (
                    <div className="preview-paper" style={{ padding: '40px', fontFamily: "'Lato', sans-serif" }}>
                        <div style={{ border: '2px solid #059669', borderRadius: '16px', padding: '30px', height: '100%', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '-15px', left: '30px', background: 'white', padding: '0 15px', color: '#059669', fontWeight: 'bold', fontSize: '18px' }}>
                                {design.category}
                            </div>
                            <MockContent />
                        </div>
                    </div>
                );
            case 'sunset':
                return (
                    <div className="preview-paper" style={{ padding: '0', background: 'white' }}>
                        <div style={{ height: '8px', background: 'linear-gradient(90deg, #ea580c, #fbbf24)' }}></div>
                        <div style={{ padding: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
                                <div style={{ width: '40px', height: '40px', background: '#fff7ed', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c', fontWeight: 'bold', marginRight: '15px' }}>HR</div>
                                <h1 style={{ color: '#c2410c', margin: 0, fontSize: '22px' }}>{design.category}</h1>
                            </div>
                            <MockContent />
                        </div>
                        <div style={{ height: '8px', background: 'linear-gradient(90deg, #fbbf24, #ea580c)', position: 'absolute', bottom: 0, width: '100%' }}></div>
                    </div>
                );
            default: // Classic
                return (
                    <div className="preview-paper" style={{ padding: '40px', border: '1px solid #e2e8f0', fontFamily: "'Georgia', serif" }}>
                        <div style={{ textAlign: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '20px', marginBottom: '30px' }}>
                            <h1 style={{ color: '#334155', fontSize: '24px', margin: 0 }}>{design.category} Letter</h1>
                            <p style={{ color: '#64748b', fontSize: '12px', marginTop: '5px' }}>CONFIDENTIAL</p>
                        </div>
                        <MockContent />
                    </div>
                );
        }
    };

    return getDesignLayout();
};

const DesignSelection = ({ selectedDesign, onSelectDesign, letterType = 'Offer', customTemplates = [], onUploadTemplate, onManualUpload }) => {
    const [previewDesign, setPreviewDesign] = useState(null);
    const fileInputRef = React.useRef(null);

    const handleUploadClick = () => {
        if (onManualUpload) {
            onManualUpload();
        } else {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && onUploadTemplate) {
            onUploadTemplate(file);
        }
        e.target.value = null; // Reset input to allow re-selection
    };

    const designs = [
        // --- OFFER LETTERS ---
        { id: 'offer-classic', name: 'Classic', category: 'Offer', description: 'Traditional formal design', preview: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)', icon: '📜' },
        { id: 'offer-modern', name: 'Modern', category: 'Offer', description: 'Contemporary design', preview: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', icon: '✨' },
        { id: 'offer-professional', name: 'Professional', category: 'Offer', description: 'Corporate polished design', preview: 'linear-gradient(135deg, #2b6cb0 0%, #4299e1 100%)', icon: '💼' },
        { id: 'offer-creative', name: 'Creative', category: 'Offer', description: 'Bold and innovative', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: '🎨' },
        { id: 'offer-minimal', name: 'Minimal', category: 'Offer', description: 'Clean and simple', preview: 'linear-gradient(135deg, #000000 0%, #434343 100%)', icon: '⚪' },
        { id: 'offer-executive', name: 'Executive', category: 'Offer', description: 'Premium for senior roles', preview: 'linear-gradient(135deg, #d4af37 0%, #f4e4a6 100%)', icon: '👔' },
        { id: 'offer-elegant', name: 'Elegant', category: 'Offer', description: 'Sophisticated and refined', preview: 'linear-gradient(135deg, #4c1d95 0%, #c4b5fd 100%)', icon: '💎' },
        { id: 'offer-corporate', name: 'Corporate', category: 'Offer', description: 'Professional business style', preview: 'linear-gradient(135deg, #0c4a6e 0%, #38bdf8 100%)', icon: '🏢' },
        { id: 'offer-vibrant', name: 'Vibrant', category: 'Offer', description: 'Energetic and dynamic', preview: 'linear-gradient(135deg, #be123c 0%, #fb7185 100%)', icon: '⚡' },
        { id: 'offer-fresh', name: 'Fresh', category: 'Offer', description: 'Modern and clean', preview: 'linear-gradient(135deg, #065f46 0%, #6ee7b7 100%)', icon: '🌿' },
        { id: 'offer-sunset', name: 'Sunset', category: 'Offer', description: 'Warm and inviting', preview: 'linear-gradient(135deg, #ea580c 0%, #fdba74 100%)', icon: '🌅' },

        // --- APPOINTMENT LETTERS ---
        { id: 'appointment-classic', name: 'Classic', category: 'Appointment', description: 'Formal appointment letter', preview: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)', icon: '📜' },
        { id: 'appointment-modern', name: 'Modern', category: 'Appointment', description: 'Modern appointment style', preview: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)', icon: '✨' },
        { id: 'appointment-professional', name: 'Professional', category: 'Appointment', description: 'Corporate polished design', preview: 'linear-gradient(135deg, #2b6cb0 0%, #4299e1 100%)', icon: '💼' },
        { id: 'appointment-creative', name: 'Creative', category: 'Appointment', description: 'Bold and innovative', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: '🎨' },
        { id: 'appointment-minimal', name: 'Minimal', category: 'Appointment', description: 'Clean and simple', preview: 'linear-gradient(135deg, #000000 0%, #434343 100%)', icon: '⚪' },
        { id: 'appointment-executive', name: 'Executive', category: 'Appointment', description: 'Premium for senior roles', preview: 'linear-gradient(135deg, #d4af37 0%, #f4e4a6 100%)', icon: '👔' },
        { id: 'appointment-elegant', name: 'Elegant', category: 'Appointment', description: 'Sophisticated and refined', preview: 'linear-gradient(135deg, #4c1d95 0%, #c4b5fd 100%)', icon: '💎' },
        { id: 'appointment-corporate', name: 'Corporate', category: 'Appointment', description: 'Professional business style', preview: 'linear-gradient(135deg, #0c4a6e 0%, #38bdf8 100%)', icon: '🏢' },
        { id: 'appointment-vibrant', name: 'Vibrant', category: 'Appointment', description: 'Energetic and dynamic', preview: 'linear-gradient(135deg, #be123c 0%, #fb7185 100%)', icon: '⚡' },
        { id: 'appointment-fresh', name: 'Fresh', category: 'Appointment', description: 'Modern and clean', preview: 'linear-gradient(135deg, #065f46 0%, #6ee7b7 100%)', icon: '🌿' },
        { id: 'appointment-sunset', name: 'Sunset', category: 'Appointment', description: 'Warm and inviting', preview: 'linear-gradient(135deg, #ea580c 0%, #fdba74 100%)', icon: '🌅' },

        // --- PROMOTION LETTERS ---
        { id: 'promotion-classic', name: 'Classic', category: 'Promotion', description: 'Traditional formal promotion', preview: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)', icon: '📜' },
        { id: 'promotion-modern', name: 'Modern', category: 'Promotion', description: 'Contemporary promotion style', preview: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', icon: '✨' },
        { id: 'promotion-professional', name: 'Professional', category: 'Promotion', description: 'Corporate polished design', preview: 'linear-gradient(135deg, #2b6cb0 0%, #4299e1 100%)', icon: '💼' },
        { id: 'promotion-creative', name: 'Creative', category: 'Promotion', description: 'Bold and innovative', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: '🎨' },
        { id: 'promotion-minimal', name: 'Minimal', category: 'Promotion', description: 'Clean and simple', preview: 'linear-gradient(135deg, #000000 0%, #434343 100%)', icon: '⚪' },
        { id: 'promotion-executive', name: 'Executive', category: 'Promotion', description: 'Premium for senior roles', preview: 'linear-gradient(135deg, #d4af37 0%, #f4e4a6 100%)', icon: '👔' },
        { id: 'promotion-elegant', name: 'Elegant', category: 'Promotion', description: 'Sophisticated and refined', preview: 'linear-gradient(135deg, #4c1d95 0%, #c4b5fd 100%)', icon: '💎' },
        { id: 'promotion-corporate', name: 'Corporate', category: 'Promotion', description: 'Professional business style', preview: 'linear-gradient(135deg, #0c4a6e 0%, #38bdf8 100%)', icon: '🏢' },
        { id: 'promotion-vibrant', name: 'Vibrant', category: 'Promotion', description: 'Energetic and dynamic', preview: 'linear-gradient(135deg, #be123c 0%, #fb7185 100%)', icon: '⚡' },
        { id: 'promotion-fresh', name: 'Fresh', category: 'Promotion', description: 'Modern and clean', preview: 'linear-gradient(135deg, #065f46 0%, #6ee7b7 100%)', icon: '🌿' },
        { id: 'promotion-sunset', name: 'Sunset', category: 'Promotion', description: 'Warm and inviting', preview: 'linear-gradient(135deg, #ea580c 0%, #fdba74 100%)', icon: '🌅' },

        // --- INTERVIEW LETTERS ---
        { id: 'interview-classic', name: 'Classic', category: 'Interview', description: 'Formal interview invitation', preview: 'linear-gradient(135deg, #f3f4f6 0%, #d1d5db 100%)', icon: '📅' },
        { id: 'interview-modern', name: 'Modern', category: 'Interview', description: 'Modern interview invite', preview: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)', icon: '🚀' },
        { id: 'interview-professional', name: 'Professional', category: 'Interview', description: 'Corporate polished design', preview: 'linear-gradient(135deg, #2b6cb0 0%, #4299e1 100%)', icon: '💼' },
        { id: 'interview-creative', name: 'Creative', category: 'Interview', description: 'Bold and innovative', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: '🎨' },
        { id: 'interview-minimal', name: 'Minimal', category: 'Interview', description: 'Clean and simple', preview: 'linear-gradient(135deg, #000000 0%, #434343 100%)', icon: '⚪' },
        { id: 'interview-executive', name: 'Executive', category: 'Interview', description: 'Premium for senior roles', preview: 'linear-gradient(135deg, #d4af37 0%, #f4e4a6 100%)', icon: '👔' },
        { id: 'interview-elegant', name: 'Elegant', category: 'Interview', description: 'Sophisticated and refined', preview: 'linear-gradient(135deg, #4c1d95 0%, #c4b5fd 100%)', icon: '💎' },
        { id: 'interview-corporate', name: 'Corporate', category: 'Interview', description: 'Professional business style', preview: 'linear-gradient(135deg, #0c4a6e 0%, #38bdf8 100%)', icon: '🏢' },
        { id: 'interview-vibrant', name: 'Vibrant', category: 'Interview', description: 'Energetic and dynamic', preview: 'linear-gradient(135deg, #be123c 0%, #fb7185 100%)', icon: '⚡' },
        { id: 'interview-fresh', name: 'Fresh', category: 'Interview', description: 'Modern and clean', preview: 'linear-gradient(135deg, #065f46 0%, #6ee7b7 100%)', icon: '🌿' },
        { id: 'interview-sunset', name: 'Sunset', category: 'Interview', description: 'Warm and inviting', preview: 'linear-gradient(135deg, #ea580c 0%, #fdba74 100%)', icon: '🌅' },

        // --- EXPERIENCE LETTERS ---
        { id: 'experience-classic', name: 'Classic', category: 'Experience', description: 'Formal experience certificate', preview: 'linear-gradient(135deg, #fffbeb 0%, #fcd34d 100%)', icon: '🏆' },
        { id: 'experience-modern', name: 'Modern', category: 'Experience', description: 'Modern experience style', preview: 'linear-gradient(135deg, #fde68a 0%, #fbbf24 100%)', icon: '✨' },
        { id: 'experience-professional', name: 'Professional', category: 'Experience', description: 'Corporate polished design', preview: 'linear-gradient(135deg, #2b6cb0 0%, #4299e1 100%)', icon: '💼' },
        { id: 'experience-creative', name: 'Creative', category: 'Experience', description: 'Bold and innovative', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: '🎨' },
        { id: 'experience-minimal', name: 'Minimal', category: 'Experience', description: 'Clean and simple', preview: 'linear-gradient(135deg, #000000 0%, #434343 100%)', icon: '⚪' },
        { id: 'experience-executive', name: 'Executive', category: 'Experience', description: 'Premium for senior roles', preview: 'linear-gradient(135deg, #d4af37 0%, #f4e4a6 100%)', icon: '👔' },
        { id: 'experience-elegant', name: 'Elegant', category: 'Experience', description: 'Sophisticated and refined', preview: 'linear-gradient(135deg, #4c1d95 0%, #c4b5fd 100%)', icon: '💎' },
        { id: 'experience-corporate', name: 'Corporate', category: 'Experience', description: 'Professional business style', preview: 'linear-gradient(135deg, #0c4a6e 0%, #38bdf8 100%)', icon: '🏢' },
        { id: 'experience-vibrant', name: 'Vibrant', category: 'Experience', description: 'Energetic and dynamic', preview: 'linear-gradient(135deg, #be123c 0%, #fb7185 100%)', icon: '⚡' },
        { id: 'experience-fresh', name: 'Fresh', category: 'Experience', description: 'Modern and clean', preview: 'linear-gradient(135deg, #065f46 0%, #6ee7b7 100%)', icon: '🌿' },
        { id: 'experience-sunset', name: 'Sunset', category: 'Experience', description: 'Warm and inviting', preview: 'linear-gradient(135deg, #ea580c 0%, #fdba74 100%)', icon: '🌅' },

        // --- RELIEVING LETTERS ---
        { id: 'relieving-classic', name: 'Classic', category: 'Relieving', description: 'Formal relieving order', preview: 'linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)', icon: '👋' },
        { id: 'relieving-modern', name: 'Modern', category: 'Relieving', description: 'Modern relieving style', preview: 'linear-gradient(135deg, #fecaca 0%, #ef4444 100%)', icon: '✨' },
        { id: 'relieving-professional', name: 'Professional', category: 'Relieving', description: 'Corporate polished design', preview: 'linear-gradient(135deg, #2b6cb0 0%, #4299e1 100%)', icon: '💼' },
        { id: 'relieving-creative', name: 'Creative', category: 'Relieving', description: 'Bold and innovative', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: '🎨' },
        { id: 'relieving-minimal', name: 'Minimal', category: 'Relieving', description: 'Clean and simple', preview: 'linear-gradient(135deg, #000000 0%, #434343 100%)', icon: '⚪' },
        { id: 'relieving-executive', name: 'Executive', category: 'Relieving', description: 'Premium for senior roles', preview: 'linear-gradient(135deg, #d4af37 0%, #f4e4a6 100%)', icon: '👔' },
        { id: 'relieving-elegant', name: 'Elegant', category: 'Relieving', description: 'Sophisticated and refined', preview: 'linear-gradient(135deg, #4c1d95 0%, #c4b5fd 100%)', icon: '💎' },
        { id: 'relieving-corporate', name: 'Corporate', category: 'Relieving', description: 'Professional business style', preview: 'linear-gradient(135deg, #0c4a6e 0%, #38bdf8 100%)', icon: '🏢' },
        { id: 'relieving-vibrant', name: 'Vibrant', category: 'Relieving', description: 'Energetic and dynamic', preview: 'linear-gradient(135deg, #be123c 0%, #fb7185 100%)', icon: '⚡' },
        { id: 'relieving-fresh', name: 'Fresh', category: 'Relieving', description: 'Modern and clean', preview: 'linear-gradient(135deg, #065f46 0%, #6ee7b7 100%)', icon: '🌿' },
        { id: 'relieving-sunset', name: 'Sunset', category: 'Relieving', description: 'Warm and inviting', preview: 'linear-gradient(135deg, #ea580c 0%, #fdba74 100%)', icon: '🌅' },

        // --- REJECTION LETTERS ---
        { id: 'rejection-classic', name: 'Classic', category: 'Rejection', description: 'Formal rejection letter', preview: 'linear-gradient(135deg, #f3f4f6 0%, #d1d5db 100%)', icon: '📝' },
        { id: 'rejection-modern', name: 'Modern', category: 'Rejection', description: 'Modern rejection style', preview: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)', icon: '✨' },
        { id: 'rejection-professional', name: 'Professional', category: 'Rejection', description: 'Corporate polished design', preview: 'linear-gradient(135deg, #2b6cb0 0%, #4299e1 100%)', icon: '💼' },
        { id: 'rejection-creative', name: 'Creative', category: 'Rejection', description: 'Bold and innovative', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: '🎨' },
        { id: 'rejection-minimal', name: 'Minimal', category: 'Rejection', description: 'Clean and simple', preview: 'linear-gradient(135deg, #000000 0%, #434343 100%)', icon: '⚪' },
        { id: 'rejection-executive', name: 'Executive', category: 'Rejection', description: 'Premium for senior roles', preview: 'linear-gradient(135deg, #d4af37 0%, #f4e4a6 100%)', icon: '👔' },
        { id: 'rejection-elegant', name: 'Elegant', category: 'Rejection', description: 'Sophisticated and refined', preview: 'linear-gradient(135deg, #4c1d95 0%, #c4b5fd 100%)', icon: '💎' },
        { id: 'rejection-corporate', name: 'Corporate', category: 'Rejection', description: 'Professional business style', preview: 'linear-gradient(135deg, #0c4a6e 0%, #38bdf8 100%)', icon: '🏢' },
        { id: 'rejection-vibrant', name: 'Vibrant', category: 'Rejection', description: 'Energetic and dynamic', preview: 'linear-gradient(135deg, #be123c 0%, #fb7185 100%)', icon: '⚡' },
        { id: 'rejection-fresh', name: 'Fresh', category: 'Rejection', description: 'Modern and clean', preview: 'linear-gradient(135deg, #065f46 0%, #6ee7b7 100%)', icon: '🌿' },
        { id: 'rejection-sunset', name: 'Sunset', category: 'Rejection', description: 'Warm and inviting', preview: 'linear-gradient(135deg, #ea580c 0%, #fdba74 100%)', icon: '🌅' },
    ];

    // Filter designs based on the selected letter type
    const filteredDesigns = designs.filter(d => {
        // Map 'Next Round' and 'Interview Call' to 'Interview' category
        if (letterType === 'Next Round' || letterType === 'Interview Call') {
            return d.category === 'Interview';
        }
        return letterType.includes(d.category);
    });

    const filteredTemplates = customTemplates.filter(t => t.type === letterType || t.type === 'Universal');

    const handleDoubleClick = (designId) => {
        const design = designs.find(d => d.id === designId);
        if (design) {
            setPreviewDesign(design);
        }
    };

    return (
        <div className="design-selection">
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="application/pdf"
                onChange={handleFileChange}
            />

            {(filteredTemplates.length > 0 || onUploadTemplate || onManualUpload) && (
                <>
                    <h5 className="text-secondary fw-bold mb-3 small text-uppercase ls-1">Your Templates</h5>
                    <div className="design-grid mb-5">
                        {/* Upload Card */}
                        <div
                            className="design-card"
                            style={{ borderStyle: 'dashed', borderColor: '#3b82f6', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '180px' }}
                            onClick={handleUploadClick}
                        >
                            <div style={{ fontSize: '2.5rem', color: '#3b82f6', marginBottom: '10px' }}>
                                <i className={`bi ${onManualUpload ? 'bi-send-fill' : 'bi-cloud-arrow-up-fill'}`}></i>
                            </div>
                            <h5 className="design-name text-primary">{onManualUpload ? 'Upload & Send' : 'Upload Template'}</h5>
                            <p className="design-description text-center">{onManualUpload ? 'Send PDF to Employee' : 'Auto-convert PDF to\nFixed Template'}</p>
                        </div>

                        {filteredTemplates.map((t) => (
                            <div
                                key={t._id}
                                className={`design-card ${selectedDesign === t._id ? 'selected' : ''}`}
                                onClick={() => onSelectDesign(t._id)}
                            >
                                <div className="design-preview" style={{ background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f1f5f9' }}>
                                    <i className="bi bi-file-earmark-pdf-fill" style={{ fontSize: '3rem', color: '#dc2626' }}></i>
                                </div>
                                <div className="design-info">
                                    <h4 className="design-name">{t.name}</h4>
                                    <p className="design-description text-truncate">{t.subject}</p>
                                </div>
                                <div className="design-selector">
                                    {selectedDesign === t._id ? <i className="bi bi-check-circle-fill selected-icon"></i> : <i className="bi bi-circle"></i>}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <h5 className="text-secondary fw-bold mb-3 small text-uppercase ls-1">System Designs</h5>
            <div className="design-grid">
                {filteredDesigns.map((design) => (
                    <div
                        key={design.id}
                        className={`design-card ${selectedDesign === design.id ? 'selected' : ''}`}
                        onClick={() => onSelectDesign(design.id)}
                        onDoubleClick={() => handleDoubleClick(design.id)}
                        title="Double click to preview"
                    >
                        <div className="design-preview" style={{ background: design.preview }}>
                            <LayoutThumbnail type={design.id} />
                        </div>
                        <div className="design-info">
                            <h4 className="design-name">{design.name}</h4>
                            <p className="design-description">{design.description}</p>
                        </div>
                        <div className="design-selector">
                            {selectedDesign === design.id ? (
                                <i className="bi bi-check-circle-fill selected-icon"></i>
                            ) : (
                                <i className="bi bi-circle"></i>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredDesigns.length === 0 && filteredTemplates.length === 0 && (
                <div className="alert alert-info">
                    No designs available for this letter type yet.
                </div>
            )}

            {selectedDesign && (
                <div className="design-locked-notice">
                    <i className="bi bi-lock-fill"></i>
                    <span>Design locked: <strong>{designs.find(d => d.id === selectedDesign)?.name || filteredTemplates.find(t => t._id === selectedDesign)?.name}</strong></span>
                </div>
            )}

            {previewDesign && (
                <div className="preview-overlay" onClick={() => setPreviewDesign(null)}>
                    <div className="preview-modal" onClick={e => e.stopPropagation()}>
                        <div className="preview-header">
                            <h4 style={{ margin: 0 }}>{previewDesign.name} Preview</h4>
                            <button className="btn btn-sm btn-light" onClick={() => setPreviewDesign(null)}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <div className="preview-body">
                            <FullPreviewPaper design={previewDesign} />
                        </div>
                        <div className="preview-footer">
                            <button className="btn btn-primary" onClick={() => {
                                onSelectDesign(previewDesign.id);
                                setPreviewDesign(null);
                            }}>
                                Use This Design
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DesignSelection;
