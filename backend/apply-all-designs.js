const mongoose = require('mongoose');
require('dotenv').config();

const LetterTemplate = require('./src/models/Recruitment/LetterTemplate');

// --- 1. SHARED STYLES & WRAPPER (The "Gold Standard" Design) ---
const getStyledTemplate = (title, subtitle, specificBodyContent) => `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page { margin: 0; size: A4; }
        body { margin: 0; padding: 0; font-family: 'Arial', 'Helvetica', sans-serif; color: #333; position: relative; }
        
        /* Header */
        .header { position: relative; height: 100px; background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); overflow: hidden; }
        .header-shape-1 { position: absolute; right: 0; top: 0; width: 0; height: 0; border-style: solid; border-width: 0 180px 100px 0; border-color: transparent #fbbf24 transparent transparent; }
        .header-shape-2 { position: absolute; right: 180px; top: 0; width: 0; height: 0; border-style: solid; border-width: 0 90px 100px 0; border-color: transparent #f59e0b transparent transparent; }
        .logo-section { position: absolute; left: 60px; top: 20px; z-index: 20; background: white; padding: 8px 15px; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .logo-img { height: 45px; max-width: 200px; object-fit: contain; display: block; }
        
        /* Content */
        .content { padding: 40px 60px 100px 60px; min-height: 800px; display: flex; flex-direction: column; }
        
        .body-letter-title { margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; }
        .body-letter-title h1 { color: #1e3a8a; font-size: 28px; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
        .body-letter-title p { color: #64748b; margin: 5px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; }
        
        .date-section { text-align: right; color: #64748b; font-size: 12px; margin-bottom: 20px; font-weight: 500; }
        
        .letter-body { font-size: 14px; line-height: 1.9; color: #334155; text-align: justify; flex-grow: 1; display: flex; flex-direction: column; }
        .letter-body h3 { color: #1e3a8a; border-bottom: 3px solid #fbbf24; padding-bottom: 10px; margin-top: 35px; margin-bottom: 20px; font-size: 18px; }
        
        /* Tables */
        .letter-body table { width: 100%; margin: 25px 0; border-collapse: collapse; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .letter-body table tr { border-bottom: 1px solid #e2e8f0; }
        .letter-body table td { padding: 14px 16px; }
        .letter-body table td:first-child { font-weight: 600; color: #1e3a8a; width: 200px; }
        .letter-body table tr:nth-child(even) { background: #f8fafc; }
        
        .highlight-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 4px; }
        
        /* Signature */
        .signature-section { margin-top: auto; padding-top: 40px; page-break-inside: avoid; }
        
        /* Footer */
        .footer { position: fixed; bottom: 0; left: 0; right: 0; height: 80px; background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); overflow: hidden; z-index: 100; }
        .footer-shape-1 { position: absolute; right: 0; bottom: 0; width: 0; height: 0; border-style: solid; border-width: 80px 180px 0 0; border-color: #fbbf24 transparent transparent transparent; }
        .footer-shape-2 { position: absolute; right: 180px; bottom: 0; width: 0; height: 0; border-style: solid; border-width: 80px 90px 0 0; border-color: #f59e0b transparent transparent transparent; }
        .footer-content { position: relative; z-index: 10; padding: 20px 60px; color: white; font-size: 10px; line-height: 1.6; }
        .footer-item { display: inline-block; margin-right: 30px; margin-bottom: 3px; }
        .footer-icon { color: #fbbf24; margin-right: 6px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-shape-1"></div>
        <div class="header-shape-2"></div>
        <div class="logo-section">
            {{#if company_logo}}<img src="{{company_logo}}" class="logo-img" alt="Company Logo" />{{else}}<h2 style="margin: 10px 0; color: #1e3a8a;">{{company_name}}</h2>{{/if}}
        </div>
    </div>
    
    <div class="content">
        <div class="body-letter-title">
            <h1>${title}</h1>
            <p>${subtitle}</p>
        </div>

        <div class="date-section">Date: {{current_date}}</div>
        
        <div class="letter-body">
            <p>Dear <strong style="color: #1e3a8a;">{{candidate_name}}</strong>,</p>
            ${specificBodyContent}
            
            <div class="signature-section">
                 <p>Sincerely,</p>
                 {{#if company_signature}}<img src="{{company_signature}}" style="height: 60px; margin-top: 10px;" />{{/if}}
                 <p><strong>HR Signature</strong><br>{{company_name}}</p>
            </div>
        </div>
    </div>
    
    <div class="footer">
        <div class="footer-shape-1"></div>
        <div class="footer-shape-2"></div>
        <div class="footer-content">
             {{#if processed_phone_str}}<div class="footer-item"><span class="footer-icon">📞</span> {{processed_phone_str}}</div><br>{{/if}}
             {{#if processed_email_str}}<div class="footer-item"><span class="footer-icon">✉️</span> {{processed_email_str}}</div><br>{{/if}}
             {{#if processed_address_str}}<div class="footer-item"><span class="footer-icon">📍</span> {{processed_address_str}}</div>{{/if}}
        </div>
    </div>
</body>
</html>`;

// --- 2. SPECIFIC CONTENT DEFINITIONS ---

// A. INTERVIEW CALL
const interviewContent = `
<div class="highlight-box">
    <strong style="color: #92400e; font-size: 16px;">INVITATION TO INTERVIEW</strong><br/>
    We have reviewed your profile and are impressed with your qualifications. We would like to invite you for an interview for the position of <strong>{{job_role}}</strong>.
</div>

<h3>Interview Schedule</h3>
<table>
    <tr><td>Date</td><td>{{interview_date}}</td></tr>
    <tr><td>Time</td><td>{{interview_time}}</td></tr>
    <tr><td>Mode</td><td>{{interview_mode}}</td></tr>
    {{#if isOffline}}
    <tr style="background: #fef3c7 !important;"><td style="color: #92400e !important;">📍 Venue</td><td style="color: #92400e !important;">{{interview_location}}</td></tr>
    {{/if}}
    {{#if isOnline}}
    <tr style="background: #dbeafe !important;"><td style="color: #1e40af !important;">🔗 Link</td><td><a href="{{interview_link}}" style="color: #2563eb;">Join Meeting</a></td></tr>
    {{/if}}
</table>

<p>Please ensure you are available at the scheduled time. We look forward to meeting you.</p>
`;

// B. OFFER LETTER
const offerContent = `
<div class="highlight-box">
    <strong style="color: #92400e; font-size: 16px;">🎉 CONGRATULATIONS!</strong><br/>
    We are pleased to offer you the position of <strong>{{job_role}}</strong> at <strong>{{company_name}}</strong>.
</div>

<p>We were impressed by your skills and believe you will be a great addition to our team.</p>

<h3>Offer Details</h3>
<table>
    <tr><td>Position</td><td>{{job_role}}</td></tr>
    <tr><td>Joining Date</td><td>{{joining_date}}</td></tr>
    <tr><td>Annual CTC</td><td>₹{{ctc}}</td></tr>
    <tr><td>Location</td><td>{{company_address}}</td></tr>
</table>

<p>Please sign and return the attached duplicate copy of this letter as a token of your acceptance.</p>
<p style="text-align: center; font-weight: bold; margin-top: 30px;">We look forward to welcoming you to the team!</p>
`;

// C. REJECTION LETTER
const rejectionContent = `
<p>Thank you for giving us the opportunity to consider your application for the position of <strong>{{job_role}}</strong>.</p>

<div style="background: #f1f5f9; padding: 20px; border-left: 4px solid #64748b; margin: 25px 0;">
    <p style="margin: 0;">We appreciate the time you took to meet with us. However, after careful consideration, we have decided to move forward with other candidates who more closely match our current requirements.</p>
</div>

<p>We will keep your resume on file for future openings that may align with your skills.</p>
<p>We wish you the very best in your job search and future professional endeavors.</p>
`;


async function applyAllDesigns() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Update INTERVIEW CALL
        await LetterTemplate.findOneAndUpdate(
            { type: 'Interview Call' },
            {
                bodyContent: getStyledTemplate('INTERVIEW CALL', 'Empowering Careers', interviewContent),
                name: 'Professional Interview Call',
                isActive: true
            },
            { upsert: true }
        );
        console.log('✅ Updated Interview Call Template');

        // 2. Update OFFER LETTER
        await LetterTemplate.findOneAndUpdate(
            { type: 'Offer' },
            {
                bodyContent: getStyledTemplate('OFFER LETTER', 'Welcome Aboard', offerContent),
                name: 'Professional Offer Letter',
                isActive: true
            },
            { upsert: true }
        );
        console.log('✅ Updated Offer Letter Template');

        // 3. Update REJECTION LETTER
        await LetterTemplate.findOneAndUpdate(
            { type: 'Rejection' },
            {
                bodyContent: getStyledTemplate('APPLICATION STATUS', 'HR Department', rejectionContent),
                name: 'Standard Rejection Letter',
                isActive: true
            },
            { upsert: true }
        );
        console.log('✅ Updated Rejection Letter Template');

        // 4. Update NEXT ROUND (Just in case, ensuring consistency)
        const nextRoundContent = `
         <div class="highlight-box">
            <strong style="color: #92400e; font-size: 16px;">🎉 Congratulations!</strong><br/>
            We are pleased to inform you that you have successfully cleared the previous round and have been shortlisted for the next round of interview for the position of <strong>{{job_role}}</strong>.
        </div>
        <p>We were impressed by your performance and believe you will continue to excel in the upcoming round.</p>
        <h3>Next Round Details</h3>
        <table>
            <tr><td>Interview Date</td><td>{{interview_date}}</td></tr>
            <tr><td>Interview Time</td><td>{{interview_time}}</td></tr>
            <tr><td>Round</td><td>{{round_name}}</td></tr>
            <tr><td>Interview Mode</td><td>{{interview_mode}}</td></tr>
            {{#if isOffline}}<tr style="background: #fef3c7 !important;"><td style="color: #92400e !important;">📍 Venue</td><td style="color: #92400e !important;">{{interview_location}}</td></tr>{{/if}}
            {{#if isOnline}}<tr style="background: #dbeafe !important;"><td style="color: #1e40af !important;">🔗 Link</td><td><a href="{{interview_link}}" style="color: #2563eb;">Join Meeting</a></td></tr>{{/if}}
        </table>
        <p>Keep up the good work and prepare well for the next round.</p>`;

        await LetterTemplate.findOneAndUpdate(
            { type: 'Next Round' },
            {
                bodyContent: getStyledTemplate('NEXT ROUND', 'Empowering Careers', nextRoundContent),
                name: 'Professional Next Round',
                isActive: true
            },
            { upsert: true }
        );
        console.log('✅ Updated Next Round Template');

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

applyAllDesigns();
