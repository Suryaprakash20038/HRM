const mongoose = require('mongoose');
require('dotenv').config();

const LetterTemplate = require('./src/models/Recruitment/LetterTemplate');

// ==================== TEMPLATE FACTORY ====================
const createTemplate = (title, subtitle, bodyContent, colorScheme) => {
    // Colors configuration
    const colors = {
        classic: { primary: '#2c3e50', secondary: '#7f8c8d', accent: '#34495e', bg: '#ffffff', text: '#2c3e50' },
        modern: { primary: '#2563eb', secondary: '#64748b', accent: '#3b82f6', bg: '#f8fafc', text: '#334155' },
        professional: { primary: '#1e3a8a', secondary: '#475569', accent: '#fbbf24', bg: '#ffffff', text: '#1e293b' },
        creative: { primary: '#7c3aed', secondary: '#db2777', accent: '#8b5cf6', bg: '#fff5f9', text: '#4c1d95' },
        minimal: { primary: '#000000', secondary: '#666666', accent: '#333333', bg: '#ffffff', text: '#171717' },
        executive: { primary: '#78350f', secondary: '#92400e', accent: '#d97706', bg: '#fffbeb', text: '#451a03' },
        elegant: { primary: '#4c1d95', secondary: '#7c3aed', accent: '#c4b5fd', bg: '#faf5ff', text: '#2e1065' },
        corporate: { primary: '#0f172a', secondary: '#334155', accent: '#0ea5e9', bg: '#f0f9ff', text: '#0f172a' },
        vibrant: { primary: '#be123c', secondary: '#e11d48', accent: '#fb7185', bg: '#fff1f2', text: '#881337' },
        fresh: { primary: '#047857', secondary: '#059669', accent: '#34d399', bg: '#ecfdf5', text: '#064e3b' },
        sunset: { primary: '#c2410c', secondary: '#ea580c', accent: '#fbbf24', bg: '#fff7ed', text: '#7c2d12' }
    };

    const c = colors[colorScheme] || colors.classic;

    // Common Base CSS
    const baseCSS = `
        @page { margin: 0; size: A4; }
        body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; width: 210mm; min-height: 297mm; }
        .page { position: relative; width: 100%; height: 100%; box-sizing: border-box; page-break-after: always; }
        .content-container { position: relative; z-index: 10; }
        .logo-img { max-height: 60px; max-width: 200px; object-fit: contain; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
        td:first-child { font-weight: bold; color: ${c.primary}; width: 35%; }
        a { color: ${c.accent}; text-decoration: none; }
        .highlight-box { background: ${c.bg}; border-left: 4px solid ${c.primary}; padding: 15px; margin: 20px 0; border-radius: 4px; }
    `;

    // Signature Logic
    const signatureHTML = `
        <div class="signature-section" style="margin-top: 50px; page-break-inside: avoid;">
            <p>Sincerely,</p>
            {{#if company_signature}}<img src="{{company_signature}}" style="height: 50px; margin: 10px 0;" />{{/if}}
            <p style="margin: 5px 0 0; font-weight: bold;">{{company_name}}</p>
            <p style="margin: 0; font-size: 12px; color: ${c.secondary};">HR Department</p>
        </div>
    `;

    // Footer Logic (Phone, Email, Address)
    const footerInfoHTML = `
        <div style="font-size: 10px; display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
             {{#if processed_phone_str}}<span>📞 {{processed_phone_str}}</span>{{/if}}
             {{#if processed_email_str}}<span>✉️ {{processed_email_str}}</span>{{/if}}
             {{#if processed_address_str}}<span>📍 {{processed_address_str}}</span>{{/if}}
        </div>
    `;

    // Body Content Wrapper
    const getBody = (customStyles = "") => `
        <div style="font-size: 14px; line-height: 1.6; color: ${c.text}; ${customStyles}">
            <p style="text-align: right; margin-bottom: 30px; font-size: 12px; color: ${c.secondary};">Date: {{current_date}}</p>
            <p>Dear <strong style="color: ${c.primary};">{{candidate_name}}</strong>,</p>
            ${bodyContent}
            ${signatureHTML}
        </div>
    `;

    let htmlStructure = '';

    // === GENERATE HTML BASED ON STYLE ===
    switch (colorScheme) {
        case 'modern':
            htmlStructure = `
            <!DOCTYPE html><html><head><style>
                ${baseCSS}
                body { font-family: 'Segoe UI', Tahoma, sans-serif; background: white; }
                .border-top { height: 15px; background: linear-gradient(90deg, ${c.primary}, ${c.accent}); }
                .main { padding: 50px; }
                .header { border-bottom: 2px solid ${c.bg}; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
                .title { font-size: 32px; color: ${c.primary}; font-weight: 800; text-transform: uppercase; margin: 0; line-height: 1; }
                .subtitle { font-size: 14px; color: ${c.secondary}; letter-spacing: 3px; margin: 5px 0 0; text-transform: uppercase; }
                .footer { position: fixed; bottom: 0; left: 0; right: 0; background: ${c.bg}; padding: 15px; text-align: center; color: ${c.secondary}; border-top: 1px solid ${c.accent}33; }
            </style></head><body>
                <div class="page">
                    <div class="border-top"></div>
                    <div class="main">
                        <div class="header">
                            <div><h1 class="title">${title}</h1><p class="subtitle">${subtitle}</p></div>
                            {{#if company_logo}}<img src="{{company_logo}}" class="logo-img" />{{else}}<h2>{{company_name}}</h2>{{/if}}
                        </div>
                        ${getBody()}
                    </div>
                    <div class="footer">${footerInfoHTML}</div>
                </div>
            </body></html>`;
            break;

        case 'professional':
            htmlStructure = `
            <!DOCTYPE html><html><head><style>
                ${baseCSS}
                body { font-family: 'Verdana', sans-serif; background: white; }
                .page { display: flex; flex-direction: row; }
                .sidebar { width: 50px; background: ${c.primary}; height: 100vh; position: fixed; left: 0; top: 0; bottom: 0; }
                .main { margin-left: 50px; padding: 60px; flex: 1; }
                .header { border-bottom: 3px solid ${c.accent}; padding-bottom: 10px; margin-bottom: 40px; }
                .title { font-size: 28px; color: ${c.primary}; margin: 0; font-weight: bold; }
                .footer { position: fixed; bottom: 0; left: 50px; right: 0; padding: 20px 60px; border-top: 1px solid #eee; background: white; }
            </style></head><body>
                <div class="page">
                    <div class="sidebar"></div>
                    <div class="main">
                        <div class="header">
                            <div style="display:flex; justify-content:space-between; align-items:end;">
                                <h1 class="title">${title.toUpperCase()}</h1>
                                {{#if company_logo}}<img src="{{company_logo}}" class="logo-img" />{{/if}}
                            </div>
                            <p style="color:${c.secondary}; margin-top:5px;">${subtitle}</p>
                        </div>
                        ${getBody()}
                    </div>
                    <div class="footer">${footerInfoHTML}</div>
                </div>
            </body></html>`;
            break;

        case 'creative':
            htmlStructure = `
            <!DOCTYPE html><html><head><style>
                ${baseCSS}
                body { font-family: 'Poppins', sans-serif; }
                .blob1 { position: absolute; top: -100px; right: -100px; width: 300px; height: 300px; background: ${c.accent}; opacity: 0.1; border-radius: 50%; z-index: 0; }
                .blob2 { position: absolute; bottom: -50px; left: -50px; width: 200px; height: 200px; background: ${c.secondary}; opacity: 0.1; border-radius: 50%; z-index: 0; }
                .main { padding: 60px; position: relative; z-index: 10; }
                .title { font-size: 36px; color: ${c.primary}; margin-bottom: 5px; font-weight: 900; }
                .subtitle { color: ${c.secondary}; font-size: 14px;letter-spacing: 1px; text-transform: uppercase; border-left: 3px solid ${c.primary}; padding-left: 10px; }
                .footer { text-align: center; padding: 20px; font-size: 11px; color: ${c.secondary}; border-top: 1px dashed ${c.accent}; margin-top: 40px; }
            </style></head><body>
                <div class="page">
                    <div class="blob1"></div><div class="blob2"></div>
                    <div class="main">
                        <div style="margin-bottom: 50px;">
                            {{#if company_logo}}<img src="{{company_logo}}" class="logo-img" style="margin-bottom:20px;" />{{/if}}
                            <h1 class="title">${title}</h1>
                            <div class="subtitle">${subtitle}</div>
                        </div>
                        ${getBody()}
                        <div class="footer">${footerInfoHTML}</div>
                    </div>
                </div>
            </body></html>`;
            break;

        case 'minimal':
            htmlStructure = `
            <!DOCTYPE html><html><head><style>
                ${baseCSS}
                body { font-family: 'Helvetica', 'Arial', sans-serif; }
                .main { padding: 80px 100px; text-align: left; }
                .header { text-align: center; margin-bottom: 60px; }
                .title { font-size: 24px; color: #000; letter-spacing: 2px; font-weight: 300; text-transform: uppercase; margin-bottom: 10px; }
                .logo-img { filter: grayscale(100%); opacity: 0.8; height: 40px; margin-bottom: 20px; }
                .divider { width: 50px; height: 1px; background: #000; margin: 20px auto; }
                .footer { position: fixed; bottom: 30px; left: 0; right: 0; text-align: center; font-size: 10px; color: #888; letter-spacing: 1px; }
            </style></head><body>
                <div class="page">
                    <div class="main">
                        <div class="header">
                            {{#if company_logo}}<img src="{{company_logo}}" class="logo-img" />{{/if}}
                            <h1 class="title">${title}</h1>
                            <div class="divider"></div>
                            <p style="font-size: 11px; color: #666; text-transform: uppercase;">${subtitle}</p>
                        </div>
                        ${getBody()}
                    </div>
                    <div class="footer">${footerInfoHTML}</div>
                </div>
            </body></html>`;
            break;

        case 'executive':
            htmlStructure = `
            <!DOCTYPE html><html><head><style>
                ${baseCSS}
                body { font-family: 'Times New Roman', serif; padding: 40px; }
                .border-container { border: 2px solid ${c.primary}; padding: 40px; height: 900px; position: relative; }
                .inner-line { border-bottom: 1px solid ${c.secondary}; margin: 10px 0 30px; width: 100%; }
                .header { text-align: center; margin-bottom: 40px; }
                .title { font-size: 34px; color: ${c.primary}; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
                .logo-wrapper { margin-bottom: 15px; }
                .footer { position: absolute; bottom: 20px; left: 0; right: 0; text-align: center; font-size: 11px; color: ${c.primary}; }
            </style></head><body>
                <div class="page">
                    <div class="border-container">
                        <div class="header">
                            <div class="logo-wrapper">{{#if company_logo}}<img src="{{company_logo}}" class="logo-img" />{{else}}<h2>{{company_name}}</h2>{{/if}}</div>
                            <h1 class="title">${title}</h1>
                            <div class="inner-line"></div>
                            <p style="font-style: italic; color: ${c.secondary};">${subtitle}</p>
                        </div>
                        ${getBody("font-size: 15px; text-align: justify;")}
                        <div class="footer">${footerInfoHTML}</div>
                    </div>
                </div>
            </body></html>`;
            break;

        case 'elegant':
            htmlStructure = `
            <!DOCTYPE html><html><head><style>
                ${baseCSS}
                body { font-family: 'Georgia', serif; background: ${c.bg}; }
                .main { padding: 60px 80px; }
                .header { text-align: center; border-bottom: 3px double ${c.accent}; padding-bottom: 30px; margin-bottom: 40px; }
                .title { font-size: 30px; color: ${c.primary}; font-style: italic; margin: 0 0 10px 0; }
                .params { display: flex; justify-content: center; gap: 20px; color: ${c.secondary}; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
                .footer { position: fixed; bottom: 0; width: 100%; text-align: center; padding: 20px; background: ${c.primary}; color: white; }
                .footer span { color: white !important; }
            </style></head><body>
                <div class="page">
                    <div class="main">
                        <div class="header">
                             {{#if company_logo}}<img src="{{company_logo}}" class="logo-img" style="margin-bottom: 15px;" />{{/if}}
                             <h1 class="title">${title}</h1>
                             <div class="params"><span>${subtitle}</span> &bull; <span>Official</span> &bull; <span>Confidential</span></div>
                        </div>
                        ${getBody()}
                    </div>
                    <div class="footer">${footerInfoHTML}</div>
                </div>
            </body></html>`;
            break;

        case 'corporate':
            htmlStructure = `
            <!DOCTYPE html><html><head><style>
                ${baseCSS}
                body { font-family: 'Arial', sans-serif; background: #fff; }
                .header-block { background: ${c.primary}; padding: 40px 60px; color: white; display: flex; justify-content: space-between; align-items: center; }
                .title { font-size: 26px; margin: 0; }
                .subtitle { color: ${c.accent}; font-size: 12px; text-transform: uppercase; margin-top: 5px; }
                .main { padding: 50px 60px; }
                .footer-block { background: #f1f5f9; padding: 20px 60px; position: fixed; bottom: 0; left: 0; right: 0; font-size: 11px; color: #64748b; border-top: 2px solid ${c.primary}; }
                .logo-img { filter: brightness(0) invert(1); } 
            </style></head><body>
                <div class="page">
                    <div class="header-block">
                        <div>
                            <h1 class="title">${title}</h1>
                            <div class="subtitle">${subtitle}</div>
                        </div>
                        {{#if company_logo}}<img src="{{company_logo}}" class="logo-img" />{{/if}}
                    </div>
                    <div class="main">
                        ${getBody()}
                    </div>
                    <div class="footer-block">${footerInfoHTML}</div>
                </div>
            </body></html>`;
            break;

        case 'vibrant':
            htmlStructure = `
            <!DOCTYPE html><html><head><style>
                ${baseCSS}
                body { font-family: 'Trebuchet MS', sans-serif; }
                .container { display: flex; height: 100%; }
                .side-bar { width: 15px; background: ${c.primary}; height: 100vh; position: fixed; left: 0;top: 0; }
                .content { margin-left: 15px; padding: 50px; flex: 1; }
                .header { display: flex; align-items: center; gap: 20px; border-bottom: 2px solid ${c.accent}; padding-bottom: 20px; margin-bottom: 40px; }
                .title { font-size: 38px; color: ${c.primary}; font-weight: 900; line-height: 1; margin: 0; }
                .logo-img { height: 60px; }
                .footer { padding-top: 40px; border-top: 1px dotted ${c.primary}; margin-top: 50px; text-align: center; font-weight: bold; color: ${c.primary}; }
            </style></head><body>
                <div class="page">
                    <div class="side-bar"></div>
                    <div class="content">
                        <div class="header">
                            {{#if company_logo}}<img src="{{company_logo}}" class="logo-img" />{{/if}}
                            <div>
                                <h1 class="title">${title}</h1>
                                <span style="background: ${c.primary}; color: white; padding: 2px 8px; font-size: 10px; border-radius: 4px; text-transform: uppercase;">${subtitle}</span>
                            </div>
                        </div>
                        ${getBody()}
                        <div class="footer">${footerInfoHTML}</div>
                    </div>
                </div>
            </body></html>`;
            break;

        case 'fresh':
            htmlStructure = `
            <!DOCTYPE html><html><head><style>
                ${baseCSS}
                body { font-family: 'Segoe UI', sans-serif; padding: 40px; }
                .outer-border { border: 2px solid ${c.primary}; border-radius: 20px; min-height: 900px; padding: 40px; position: relative; overflow: hidden; }
                .corner-accent { position: absolute; top: 0; left: 0; width: 150px; height: 150px; background: ${c.bg}; transform: translate(-50%, -50%) rotate(45deg); z-index: 0; box-shadow: 2px 2px 10px rgba(0,0,0,0.05); }
                .header { text-align: right; margin-bottom: 40px; position: relative; z-index: 10; }
                .title { font-size: 28px; color: ${c.primary}; margin: 0; }
                .subtitle { color: ${c.secondary}; }
                .footer { text-align: center; font-size: 12px; color: ${c.secondary}; margin-top: 60px; border-top: 1px dashed ${c.accent}; padding-top: 20px; }
            </style></head><body>
                <div class="page">
                    <div class="outer-border">
                        <div class="corner-accent"></div>
                        <div class="header">
                             {{#if company_logo}}<img src="{{company_logo}}" class="logo-img" style="float: left;" />{{/if}}
                             <h1 class="title">${title}</h1>
                             <div class="subtitle">${subtitle}</div>
                             <div style="clear: both;"></div>
                        </div>
                        ${getBody()}
                        <div class="footer">${footerInfoHTML}</div>
                    </div>
                </div>
            </body></html>`;
            break;

        case 'sunset':
            htmlStructure = `
            <!DOCTYPE html><html><head><style>
                ${baseCSS}
                body { font-family: 'Verdana', sans-serif; background: #fff; }
                .top-bar { height: 10px; background: linear-gradient(90deg, ${c.primary}, ${c.accent}); }
                .header { background: ${c.bg}; padding: 40px 60px; border-bottom: 1px solid ${c.accent}; }
                .title { color: ${c.primary}; font-size: 26px; margin: 0; }
                .main { padding: 50px 60px; }
                .footer { position: fixed; bottom: 0; left: 0; right: 0; background: ${c.bg}; padding: 20px; border-top: 2px solid ${c.primary}; text-align: center; }
            </style></head><body>
                <div class="page">
                    <div class="top-bar"></div>
                    <div class="header">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                             <h1 class="title">${title}</h1>
                             {{#if company_logo}}<img src="{{company_logo}}" class="logo-img" />{{/if}}
                        </div>
                        <p style="color: ${c.secondary}; margin: 5px 0 0;">${subtitle}</p>
                    </div>
                    <div class="main">
                        ${getBody()}
                    </div>
                    <div class="footer">${footerInfoHTML}</div>
                </div>
            </body></html>`;
            break;

        default: // Classic
            htmlStructure = `
            <!DOCTYPE html><html><head><style>
                ${baseCSS}
                body { font-family: 'Georgia', serif; color: ${c.text}; padding: 50px; }
                .header { text-align: center; border-bottom: 2px solid ${c.secondary}; padding-bottom: 20px; margin-bottom: 40px; }
                .title { font-size: 28px; color: ${c.primary}; margin: 0; text-transform: capitalize; }
                .subtitle { font-size: 14px; font-style: italic; color: ${c.secondary}; margin-top: 5px; }
                .footer { position: fixed; bottom: 40px; left: 0; right: 0; text-align: center; font-size: 11px; color: ${c.secondary}; }
            </style></head><body>
                <div class="page">
                    <div class="header">
                        {{#if company_logo}}<img src="{{company_logo}}" class="logo-img" style="margin-bottom: 10px;" />{{/if}}
                        <h1 class="title">${title}</h1>
                        <p class="subtitle">${subtitle}</p>
                    </div>
                    ${getBody()}
                    <div class="footer">${footerInfoHTML}</div>
                </div>
            </body></html>`;
    }

    return htmlStructure;
};

// ==================== CONTENT DEFINITIONS ====================

const interviewContent = `
<div class="highlight-box">
    <strong style="font-size: 18px;">📅 Interview Invitation</strong><br/>
    We are pleased to invite you for an interview for the position of <strong>{{job_role}}</strong>.
</div>

<h3>Interview Details</h3>
<table>
    <tr><td>Date</td><td>{{interview_date}}</td></tr>
    <tr><td>Time</td><td>{{interview_time}}</td></tr>
    <tr><td>Mode</td><td>{{interview_mode}}</td></tr>
    {{#if isOffline}}<tr><td>📍 Venue</td><td>{{interview_location}}</td></tr>{{/if}}
    {{#if isOnline}}<tr><td>🔗 Meeting Link</td><td><a href="{{interview_link}}" style="color: #2563eb;">Join Interview</a></td></tr>{{/if}}
</table>

<p>Please confirm your availability and ensure you are prepared for the interview.</p>
`;

const offerContent = `
<div class="highlight-box">
    <strong style="font-size: 18px;">🎉 Congratulations!</strong><br/>
    We are delighted to offer you the position of <strong>{{job_role}}</strong> at {{company_name}}.
</div>

<p>After careful consideration, we believe you will be an excellent addition to our team.</p>

<h3>Offer Details</h3>
<table>
    <tr><td>Position</td><td>{{job_role}}</td></tr>
    <tr><td>Joining Date</td><td>{{joining_date}}</td></tr>
    <tr><td>Annual CTC</td><td>₹{{ctc}}</td></tr>
</table>

<p>Please sign and return this letter by {{expiry_date}} to confirm your acceptance.</p>
<p style="text-align: center; font-weight: 600; margin-top: 40px;">Welcome to the team!</p>
`;

const nextRoundContent = `
<div class="highlight-box">
    <strong style="font-size: 18px;">✨ Congratulations!</strong><br/>
    You have successfully cleared the previous round for the position of <strong>{{job_role}}</strong>.
</div>

<h3>Next Round Schedule</h3>
<table>
    <tr><td>Date</td><td>{{interview_date}}</td></tr>
    <tr><td>Time</td><td>{{interview_time}}</td></tr>
    <tr><td>Round</td><td>{{round_name}}</td></tr>
    <tr><td>Mode</td><td>{{interview_mode}}</td></tr>
    {{#if isOffline}}<tr><td>📍 Venue</td><td>{{interview_location}}</td></tr>{{/if}}
    {{#if isOnline}}<tr><td>🔗 Link</td><td><a href="{{interview_link}}">Join Meeting</a></td></tr>{{/if}}
</table>

<p>Keep up the excellent work and prepare well for the next round.</p>
`;

const rejectionContent = `
<p>Thank you for your interest in the position of <strong>{{job_role}}</strong> at {{company_name}}.</p>

<div style="background: #f8fafc; padding: 25px; border-left: 4px solid #94a3b8; margin: 25px 0; border-radius: 6px;">
    <p style="margin: 0;">After careful review of all applications, we have decided to move forward with other candidates whose qualifications more closely match our current requirements.</p>
</div>

<p>We appreciate the time and effort you invested in the application process. Your resume will be kept on file for future opportunities.</p>
<p>We wish you the very best in your career endeavors.</p>
`;

// ==================== TEMPLATE DEFINITIONS ====================

const templates = [
    // INTERVIEW CALL TEMPLATES
    { name: 'Classic Interview Call', type: 'Interview Call', colorScheme: 'classic', title: 'Interview Invitation', subtitle: 'Candidate Assessment', content: interviewContent },
    { name: 'Modern Interview Call', type: 'Interview Call', colorScheme: 'modern', title: 'Interview Call', subtitle: 'Join Our Team', content: interviewContent },
    { name: 'Professional Interview Call', type: 'Interview Call', colorScheme: 'professional', title: 'Interview Invitation', subtitle: 'Talent Acquisition', content: interviewContent },
    { name: 'Creative Interview Call', type: 'Interview Call', colorScheme: 'creative', title: 'Let\'s Connect', subtitle: 'Interview Invitation', content: interviewContent },
    { name: 'Minimal Interview Call', type: 'Interview Call', colorScheme: 'minimal', title: 'Interview Schedule', subtitle: 'Recruitment Process', content: interviewContent },
    { name: 'Executive Interview Call', type: 'Interview Call', colorScheme: 'executive', title: 'Executive Interview', subtitle: 'Leadership Assessment', content: interviewContent },
    { name: 'Elegant Interview Call', type: 'Interview Call', colorScheme: 'elegant', title: 'Interview Invitation', subtitle: 'Career Opportunity', content: interviewContent },
    { name: 'Corporate Interview Call', type: 'Interview Call', colorScheme: 'corporate', title: 'Interview Call', subtitle: 'Professional Engagement', content: interviewContent },
    { name: 'Vibrant Interview Call', type: 'Interview Call', colorScheme: 'vibrant', title: 'Interview Invitation', subtitle: 'Join Our Journey', content: interviewContent },
    { name: 'Fresh Interview Call', type: 'Interview Call', colorScheme: 'fresh', title: 'Interview Call', subtitle: 'New Opportunities', content: interviewContent },
    { name: 'Sunset Interview Call', type: 'Interview Call', colorScheme: 'sunset', title: 'Interview Invitation', subtitle: 'Career Growth', content: interviewContent },

    // OFFER LETTER TEMPLATES
    { name: 'Classic Offer Letter', type: 'Offer', colorScheme: 'classic', title: 'Offer Letter', subtitle: 'Employment Proposal', content: offerContent },
    { name: 'Modern Offer Letter', type: 'Offer', colorScheme: 'modern', title: 'Job Offer', subtitle: 'Welcome Aboard', content: offerContent },
    { name: 'Professional Offer Letter', type: 'Offer', colorScheme: 'professional', title: 'Offer of Employment', subtitle: 'Career Opportunity', content: offerContent },
    { name: 'Creative Offer Letter', type: 'Offer', colorScheme: 'creative', title: 'Welcome to the Team', subtitle: 'Job Offer', content: offerContent },
    { name: 'Minimal Offer Letter', type: 'Offer', colorScheme: 'minimal', title: 'Employment Offer', subtitle: 'Position Confirmation', content: offerContent },
    { name: 'Executive Offer Letter', type: 'Offer', colorScheme: 'executive', title: 'Executive Offer', subtitle: 'Leadership Position', content: offerContent },
    { name: 'Elegant Offer Letter', type: 'Offer', colorScheme: 'elegant', title: 'Offer Letter', subtitle: 'Join Our Organization', content: offerContent },
    { name: 'Corporate Offer Letter', type: 'Offer', colorScheme: 'corporate', title: 'Employment Offer', subtitle: 'Professional Opportunity', content: offerContent },
    { name: 'Vibrant Offer Letter', type: 'Offer', colorScheme: 'vibrant', title: 'Job Offer', subtitle: 'Exciting Opportunity', content: offerContent },
    { name: 'Fresh Offer Letter', type: 'Offer', colorScheme: 'fresh', title: 'Offer of Employment', subtitle: 'New Beginning', content: offerContent },
    { name: 'Sunset Offer Letter', type: 'Offer', colorScheme: 'sunset', title: 'Job Offer', subtitle: 'Career Advancement', content: offerContent },

    // NEXT ROUND TEMPLATES
    { name: 'Classic Next Round', type: 'Next Round', colorScheme: 'classic', title: 'Next Round', subtitle: 'Interview Process', content: nextRoundContent },
    { name: 'Modern Next Round', type: 'Next Round', colorScheme: 'modern', title: 'Next Round Invitation', subtitle: 'Continued Assessment', content: nextRoundContent },
    { name: 'Professional Next Round', type: 'Next Round', colorScheme: 'professional', title: 'Next Round', subtitle: 'Selection Process', content: nextRoundContent },
    { name: 'Creative Next Round', type: 'Next Round', colorScheme: 'creative', title: 'Moving Forward', subtitle: 'Next Interview', content: nextRoundContent },
    { name: 'Minimal Next Round', type: 'Next Round', colorScheme: 'minimal', title: 'Next Round', subtitle: 'Interview Continuation', content: nextRoundContent },
    { name: 'Executive Next Round', type: 'Next Round', colorScheme: 'executive', title: 'Executive Round', subtitle: 'Advanced Assessment', content: nextRoundContent },
    { name: 'Elegant Next Round', type: 'Next Round', colorScheme: 'elegant', title: 'Next Round', subtitle: 'Progress Update', content: nextRoundContent },
    { name: 'Corporate Next Round', type: 'Next Round', colorScheme: 'corporate', title: 'Next Round Invitation', subtitle: 'Recruitment Advancement', content: nextRoundContent },
    { name: 'Vibrant Next Round', type: 'Next Round', colorScheme: 'vibrant', title: 'Next Round', subtitle: 'Exciting Progress', content: nextRoundContent },
    { name: 'Fresh Next Round', type: 'Next Round', colorScheme: 'fresh', title: 'Next Round', subtitle: 'Continued Journey', content: nextRoundContent },
    { name: 'Sunset Next Round', type: 'Next Round', colorScheme: 'sunset', title: 'Next Round', subtitle: 'Interview Progression', content: nextRoundContent },

    // REJECTION LETTER TEMPLATES
    { name: 'Classic Rejection Letter', type: 'Rejection', colorScheme: 'classic', title: 'Application Status', subtitle: 'Recruitment Update', content: rejectionContent },
    { name: 'Modern Rejection Letter', type: 'Rejection', colorScheme: 'modern', title: 'Application Update', subtitle: 'Recruitment Decision', content: rejectionContent },
    { name: 'Professional Rejection Letter', type: 'Rejection', colorScheme: 'professional', title: 'Application Status', subtitle: 'HR Department', content: rejectionContent },
    { name: 'Creative Rejection Letter', type: 'Rejection', colorScheme: 'creative', title: 'Application Update', subtitle: 'Talent Acquisition', content: rejectionContent },
    { name: 'Minimal Rejection Letter', type: 'Rejection', colorScheme: 'minimal', title: 'Application Status', subtitle: 'Recruitment Team', content: rejectionContent },
    { name: 'Executive Rejection Letter', type: 'Rejection', colorScheme: 'executive', title: 'Application Decision', subtitle: 'Executive Search', content: rejectionContent },
    { name: 'Elegant Rejection Letter', type: 'Rejection', colorScheme: 'elegant', title: 'Application Status', subtitle: 'Human Resources', content: rejectionContent },
    { name: 'Corporate Rejection Letter', type: 'Rejection', colorScheme: 'corporate', title: 'Application Update', subtitle: 'Recruitment Process', content: rejectionContent },
    { name: 'Vibrant Rejection Letter', type: 'Rejection', colorScheme: 'vibrant', title: 'Application Status', subtitle: 'Hiring Team', content: rejectionContent },
    { name: 'Fresh Rejection Letter', type: 'Rejection', colorScheme: 'fresh', title: 'Application Update', subtitle: 'Talent Team', content: rejectionContent },
    { name: 'Sunset Rejection Letter', type: 'Rejection', colorScheme: 'sunset', title: 'Application Status', subtitle: 'HR Communication', content: rejectionContent },
];

// ==================== DATABASE INSERTION ====================

async function addAllTemplates() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        let added = 0;
        let updated = 0;

        for (const template of templates) {
            const html = createTemplate(template.title, template.subtitle, template.content, template.colorScheme);

            // Generate subject line based on type
            const subjectMap = {
                'Interview Call': `Interview Invitation - {{job_role}} at {{company_name}}`,
                'Offer': `Job Offer - {{job_role}} at {{company_name}}`,
                'Next Round': `Next Round Interview - {{job_role}} at {{company_name}}`,
                'Rejection': `Application Status - {{job_role}} at {{company_name}}`
            };
            const subject = subjectMap[template.type] || `Letter from {{company_name}}`;

            const existing = await LetterTemplate.findOne({
                name: template.name,
                type: template.type
            });

            if (existing) {
                existing.bodyContent = html;
                existing.subject = subject;
                existing.isActive = true;
                await existing.save();
                updated++;
                console.log(`📝 Updated: ${template.name}`);
            } else {
                await LetterTemplate.create({
                    name: template.name,
                    type: template.type,
                    subject: subject,
                    bodyContent: html,
                    isActive: true,
                    variables: ['candidate_name', 'job_role', 'interview_date', 'interview_time', 'company_name']
                });
                added++;
                console.log(`✨ Created: ${template.name}`);
            }
        }

        console.log(`\n✅ Process Complete!`);
        console.log(`   📊 Added: ${added} templates`);
        console.log(`   📝 Updated: ${updated} templates`);
        console.log(`   📋 Total: ${templates.length} templates processed`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

addAllTemplates();
