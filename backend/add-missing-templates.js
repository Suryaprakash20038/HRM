require('dotenv').config();
const mongoose = require('mongoose');
const LetterTemplate = require('./src/models/Recruitment/LetterTemplate');

// Color schemes
const colors = {
    elegant: { primary: '#4c1d95', accent: '#c4b5fd', secondary: '#a78bfa' },
    corporate: { primary: '#0c4a6e', accent: '#38bdf8', secondary: '#0284c7' },
    vibrant: { primary: '#be123c', accent: '#fb7185', secondary: '#f43f5e' },
    fresh: { primary: '#065f46', accent: '#6ee7b7', secondary: '#10b981' },
    sunset: { primary: '#ea580c', accent: '#fdba74', secondary: '#fb923c' }
};

// Template factory (Reuse from previous)
const createTemplate = (title, subtitle, bodyContent, colorScheme) => {
    const c = colors[colorScheme] || colors.elegant;
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page { margin: 0; size: A4; }
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; }
        .header { background: linear-gradient(135deg, ${c.primary} 0%, ${c.accent} 100%); padding: 40px 60px; color: white; position: relative; overflow: hidden; }
        .header::before { content: ''; position: absolute; top: -50%; right: -10%; width: 400px; height: 400px; background: ${c.secondary}; opacity: 0.1; border-radius: 50%; }
        .logo-section { position: relative; z-index: 10; }
        .logo-img { height: 50px; max-width: 250px; object-fit: contain; filter: brightness(0) invert(1); }
        .content { padding: 50px 60px 100px; min-height: 700px; display: flex; flex-direction: column; }
        .letter-title { color: ${c.primary}; font-size: 32px; font-weight: 700; margin: 0 0 10px 0; letter-spacing: -0.5px; }
        .letter-subtitle { color: ${c.secondary}; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 30px 0; }
        .date-section { text-align: right; color: #64748b; font-size: 13px; margin-bottom: 30px; }
        .letter-body { font-size: 15px; line-height: 1.8; color: #334155; flex-grow: 1; display: flex; flex-direction: column; }
        .letter-body h3 { color: ${c.primary}; border-left: 4px solid ${c.accent}; padding-left: 15px; margin: 30px 0 20px 0; font-size: 20px; }
        table { width: 100%; margin: 25px 0; border-collapse: separate; border-spacing: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; }
        table tr { border-bottom: 1px solid #e2e8f0; }
        table tr:last-child { border-bottom: none; }
        table td { padding: 16px 20px; }
        table td:first-child { font-weight: 600; color: ${c.primary}; width: 200px; background: #f8fafc; }
        .highlight-box { background: linear-gradient(135deg, ${c.accent}15 0%, ${c.secondary}15 100%); border-left: 4px solid ${c.accent}; padding: 25px; margin: 25px 0; border-radius: 6px; }
        .signature-section { margin-top: auto; padding-top: 50px; page-break-inside: avoid; }
        .footer { position: fixed; bottom: 0; left: 0; right: 0; background: ${c.primary}; color: white; padding: 20px 60px; font-size: 11px; display: flex; justify-content: space-between; align-items: center; }
        .footer-item { margin-right: 20px; }
        .footer-icon { color: ${c.accent}; margin-right: 6px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo-section">
            {{#if company_logo}}<img src="{{company_logo}}" class="logo-img" alt="{{company_name}}" />{{else}}<h2 style="margin: 0; color: white; font-size: 28px;">{{company_name}}</h2>{{/if}}
        </div>
    </div>
    <div class="content">
        <h1 class="letter-title">${title}</h1>
        <p class="letter-subtitle">${subtitle}</p>
        <div class="date-section">Date: {{current_date}}</div>
        <div class="letter-body">
            <p>Dear <strong style="color: ${c.primary};">{{candidate_name}}</strong>,</p>
            ${bodyContent}
            <div class="signature-section">
                <p>Sincerely,</p>
                {{#if company_signature}}<img src="{{company_signature}}" style="height: 60px; margin: 15px 0;" />{{/if}}
                <p><strong>HR Department</strong><br>{{company_name}}</p>
            </div>
        </div>
    </div>
    <div class="footer">
        <div>
            {{#if processed_phone_str}}<span class="footer-item"><span class="footer-icon">📞</span>{{processed_phone_str}}</span>{{/if}}
            {{#if processed_email_str}}<span class="footer-item"><span class="footer-icon">✉️</span>{{processed_email_str}}</span>{{/if}}
        </div>
        <div>{{#if processed_address_str}}<span class="footer-icon">📍</span>{{processed_address_str}}{{/if}}</div>
    </div>
</body>
</html>`;
};

// Content definitions
const appointmentContent = `<div class="highlight-box">
    <strong style="font-size: 18px;">📋 Appointment Confirmation</strong><br/>
    We are pleased to appoint you as <strong>{{job_role}}</strong> at <strong>{{company_name}}</strong>.
</div>
<p>This letter confirms your employment starting from <strong>{{joining_date}}</strong>.</p>
<h3>Employment Details</h3>
<table>
    <tr><td>Role</td><td>{{job_role}}</td></tr>
    <tr><td>Date of Keeping</td><td>{{joining_date}}</td></tr>
    <tr><td>Compensation</td><td>₹{{ctc}} per annum</td></tr>
    <tr><td>Reporting To</td><td>{{manager_name}}</td></tr>
</table>
<p>We welcome you to our organization and look forward to a fruitful association.</p>`;

const experienceContent = `<p>This is to certify that <strong>{{candidate_name}}</strong> was employed with <strong>{{company_name}}</strong> from <strong>{{joining_date}}</strong> to <strong>{{last_working_day}}</strong>.</p>
<div class="highlight-box">
    <strong>Designation:</strong> {{job_role}}
</div>
<p>During their tenure, we found them to be sincere, hardworking, and dedicated to their duties. They have shown excellent professional skills and character.</p>
<p>We wish them all the best in their future endeavors.</p>`;

const relievingContent = `<p>This has reference to your resignation letter dated <strong>{{resignation_date}}</strong>.</p>
<div class="highlight-box">
    We hereby accept your resignation and relieve you from your duties as <strong>{{job_role}}</strong> with effect from close of business hours on <strong>{{last_working_day}}</strong>.
</div>
<p>We certify that you have cleared all dues and handed over all company assets.</p>
<p>We thank you for your contributions to <strong>{{company_name}}</strong> and wish you success in your future career.</p>`;

const subjectMap = {
    'Appointment': 'Appointment Letter - {{job_role}}',
    'Experience': 'Experience Certificate - {{candidate_name}}',
    'Relieving': 'Relieving Letter - {{candidate_name}}'
};

const templates = [
    // APPOINTMENT
    { name: 'Elegant Appointment Letter', type: 'Appointment', colorScheme: 'elegant', title: 'Appointment Letter', subtitle: 'Employment Confirmation', content: appointmentContent },
    { name: 'Corporate Appointment Letter', type: 'Appointment', colorScheme: 'corporate', title: 'Appointment Order', subtitle: 'Official Appointment', content: appointmentContent },
    { name: 'Vibrant Appointment Letter', type: 'Appointment', colorScheme: 'vibrant', title: 'Welcome Aboard', subtitle: 'Appointment Details', content: appointmentContent },
    { name: 'Fresh Appointment Letter', type: 'Appointment', colorScheme: 'fresh', title: 'Appointment Letter', subtitle: 'New Beginning', content: appointmentContent },
    { name: 'Sunset Appointment Letter', type: 'Appointment', colorScheme: 'sunset', title: 'Appointment Letter', subtitle: 'Career Journey', content: appointmentContent },

    // EXPERIENCE
    { name: 'Elegant Experience Letter', type: 'Experience', colorScheme: 'elegant', title: 'Experience Certificate', subtitle: 'Service Record', content: experienceContent },
    { name: 'Corporate Experience Letter', type: 'Experience', colorScheme: 'corporate', title: 'Service Certificate', subtitle: 'Professional Record', content: experienceContent },
    { name: 'Vibrant Experience Letter', type: 'Experience', colorScheme: 'vibrant', title: 'Experience Letter', subtitle: 'Career Milestone', content: experienceContent },
    { name: 'Fresh Experience Letter', type: 'Experience', colorScheme: 'fresh', title: 'Experience Certificate', subtitle: 'Work History', content: experienceContent },
    { name: 'Sunset Experience Letter', type: 'Experience', colorScheme: 'sunset', title: 'Service Letter', subtitle: 'Employment Record', content: experienceContent },

    // RELIEVING
    { name: 'Elegant Relieving Letter', type: 'Relieving', colorScheme: 'elegant', title: 'Relieving Letter', subtitle: 'Exit Formalities', content: relievingContent },
    { name: 'Corporate Relieving Letter', type: 'Relieving', colorScheme: 'corporate', title: 'Relieving Order', subtitle: 'Official Release', content: relievingContent },
    { name: 'Vibrant Relieving Letter', type: 'Relieving', colorScheme: 'vibrant', title: 'Relieving Letter', subtitle: 'Next Chapter', content: relievingContent },
    { name: 'Fresh Relieving Letter', type: 'Relieving', colorScheme: 'fresh', title: 'Relieving Letter', subtitle: 'Exit Process', content: relievingContent },
    { name: 'Sunset Relieving Letter', type: 'Relieving', colorScheme: 'sunset', title: 'Relieving Order', subtitle: 'Moving Forward', content: relievingContent },
];

async function addMissingTemplates() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        let count = 0;
        for (const t of templates) {
            const subject = subjectMap[t.type] || `Letter from {{company_name}}`;
            await LetterTemplate.findOneAndUpdate(
                { name: t.name, type: t.type },
                {
                    name: t.name,
                    type: t.type,
                    subject: subject,
                    bodyContent: createTemplate(t.title, t.subtitle, t.content, t.colorScheme),
                    variables: ['candidate_name', 'job_role', 'company_name', 'joining_date'],
                    isActive: true,
                    isLocked: false,
                    isFixedPdf: false
                },
                { upsert: true, new: true }
            );
            console.log(`✅ Processed: ${t.name}`);
            count++;
        }
        console.log(`\n🎉 Added/Updated ${count} templates.`);
        await mongoose.connection.close();
    } catch (e) { console.error(e); }
}

addMissingTemplates();
