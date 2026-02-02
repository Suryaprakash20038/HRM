const mongoose = require('mongoose');
require('dotenv').config();

const LetterTemplate = require('./src/models/Recruitment/LetterTemplate');

// Updated Professional Design with Letter Title & Compact Address
const getBaseTemplate = (letterTitle, bodyContent) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            margin: 0;
            size: A4;
        }
        
        body {
            margin: 0;
            padding: 0;
            font-family: 'Arial', 'Helvetica', sans-serif;
            color: #333;
            position: relative;
        }
        
        /* Header Design with Geometric Shapes */
        .header {
            position: relative;
            height: 100px;
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            overflow: hidden;
        }
        
        .header-shape-1 {
            position: absolute;
            right: 0;
            top: 0;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 0 180px 100px 0;
            border-color: transparent #fbbf24 transparent transparent;
        }
        
        .header-shape-2 {
            position: absolute;
            right: 180px;
            top: 0;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 0 90px 100px 0;
            border-color: transparent #f59e0b transparent transparent;
        }
        
        .letter-title-section {
            position: absolute;
            left: 60px;
            top: 30px;
            color: white;
            z-index: 10;
        }
        
        .letter-title {
            font-size: 24px;
            font-weight: bold;
            color: #fbbf24;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        .letter-subtitle {
            font-size: 9px;
            color: rgba(255, 255, 255, 0.9);
            margin: 5px 0 0 0;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        
        /* Content Area */
        .content {
            padding: 40px 60px 120px 60px;
            min-height: 600px;
        }
        
        .sender-info {
            margin-bottom: 30px;
            font-size: 11px;
            line-height: 1.6;
        }
        
        .sender-name {
            font-weight: bold;
            color: #1e3a8a;
            font-size: 13px;
            margin-bottom: 6px;
        }
        
        .sender-detail {
            color: #64748b;
            margin: 2px 0;
            font-size: 11px;
        }
        
        .date-section {
            text-align: right;
            color: #64748b;
            font-size: 12px;
            margin-bottom: 30px;
            font-weight: 500;
        }
        
        .letter-body {
            font-size: 14px;
            line-height: 1.9;
            color: #334155;
            text-align: justify;
        }
        
        .letter-body h3 {
            color: #1e3a8a;
            border-bottom: 3px solid #fbbf24;
            padding-bottom: 10px;
            margin-top: 35px;
            margin-bottom: 20px;
            font-size: 18px;
        }
        
        .letter-body table {
            width: 100%;
            margin: 25px 0;
            border-collapse: collapse;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        
        .letter-body table tr {
            border-bottom: 1px solid #e2e8f0;
        }
        
        .letter-body table td {
            padding: 14px 16px;
        }
        
        .letter-body table td:first-child {
            font-weight: 600;
            color: #1e3a8a;
            width: 200px;
        }
        
        .letter-body table tr:nth-child(even) {
            background: #f8fafc;
        }
        
        .highlight-box {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }
        
        .signature-section {
            margin-top: 60px;
        }
        
        .signature-line {
            margin-top: 70px;
            border-top: 3px solid #1e3a8a;
            width: 220px;
        }
        
        .signer-name {
            font-weight: bold;
            color: #1e3a8a;
            margin-top: 12px;
            font-size: 15px;
        }
        
        .signer-title {
            color: #64748b;
            font-size: 13px;
            margin-top: 3px;
        }
        
        /* Footer Design with Geometric Shapes */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 80px;
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            overflow: hidden;
        }
        
        .footer-shape-1 {
            position: absolute;
            right: 0;
            bottom: 0;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 80px 180px 0 0;
            border-color: #fbbf24 transparent transparent transparent;
        }
        
        .footer-shape-2 {
            position: absolute;
            right: 180px;
            bottom: 0;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 80px 90px 0 0;
            border-color: #f59e0b transparent transparent transparent;
        }
        
        .footer-content {
            position: relative;
            z-index: 10;
            padding: 20px 60px;
            color: white;
            font-size: 10px;
            line-height: 1.6;
        }
        
        .footer-item {
            display: inline-block;
            margin-right: 30px;
            margin-bottom: 3px;
        }
        
        .footer-icon {
            color: #fbbf24;
            margin-right: 6px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <!-- Header with Letter Title -->
    <div class="header">
        <div class="header-shape-1"></div>
        <div class="header-shape-2"></div>
        <div class="letter-title-section">
            <h1 class="letter-title">${letterTitle}</h1>
            <p class="letter-subtitle">EMPOWERING CAREERS, ENHANCING LIVES</p>
        </div>
    </div>
    
    <!-- Main Content -->
    <div class="content">
        <!-- Compact Sender Information -->
        <div class="sender-info">
            <div class="sender-name">Jon Smith Taylor</div>
            <div class="sender-detail">📍 {{company_address}}</div>
            <div class="sender-detail">📞 +00 0000 000 | ✉️ example@mail.com</div>
        </div>
        
        <!-- Date -->
        <div class="date-section">
            Date: {{current_date}}
        </div>
        
        <!-- Letter Body Content -->
        <div class="letter-body">
            ${bodyContent}
        </div>
        
        <!-- Signature Section -->
        <div class="signature-section">
            <p style="margin-bottom: 10px;">Sincerely,</p>
            <div class="signature-line"></div>
            <div class="signer-name">Jon Smith Taylor</div>
            <div class="signer-title">HR Manager</div>
            <div class="signer-title">Infofocus</div>
        </div>
    </div>
    
    <!-- Footer with Contact Details -->
    <div class="footer">
        <div class="footer-shape-1"></div>
        <div class="footer-shape-2"></div>
        <div class="footer-content">
            <div class="footer-item">
                <span class="footer-icon">🌐</span> www.your-website.com
            </div>
            <div class="footer-item">
                <span class="footer-icon">✉️</span> yourcompany@mail.com
            </div>
            <div class="footer-item">
                <span class="footer-icon">📞</span> +00 0000 000 000
            </div>
        </div>
    </div>
</body>
</html>
`;

// Interview Call Body Content (same as before)
const interviewCallBody = `
<p>Dear <strong style="color: #1e3a8a;">{{candidate_name}}</strong>,</p>

<p>Thank you for applying for the position of <strong>{{job_role}}</strong> at our organization. 
We are impressed with your profile and would like to invite you for an interview.</p>

<h3>Interview Details</h3>

<table>
    <tr>
        <td>Position</td>
        <td>{{job_role}}</td>
    </tr>
    <tr>
        <td>Interview Date</td>
        <td>{{interview_date}}</td>
    </tr>
    <tr>
        <td>Interview Time</td>
        <td>{{interview_time}}</td>
    </tr>
    <tr>
        <td>Round</td>
        <td>{{round_name}}</td>
    </tr>
    <tr>
        <td>Interview Mode</td>
        <td>{{interview_mode}}</td>
    </tr>
    {{#if isOffline}}
    <tr style="background: #fef3c7 !important;">
        <td style="color: #92400e !important; font-weight: bold;">📍 Venue</td>
        <td style="color: #92400e !important; font-weight: bold;">{{interview_location}}</td>
    </tr>
    {{/if}}
    {{#if isOnline}}
    <tr style="background: #dbeafe !important;">
        <td style="color: #1e40af !important; font-weight: bold;">🔗 Meeting Link</td>
        <td><a href="{{interview_link}}" style="color: #2563eb; text-decoration: underline;">Click here to join</a></td>
    </tr>
    {{/if}}
</table>

<div class="highlight-box">
    <strong style="color: #92400e;">💡 Preparation Tips:</strong><br/>
    Please bring a copy of your resume and any relevant certificates. 
    Be prepared to discuss your experience, skills, and career goals.
</div>

<p>Please confirm your attendance by replying to this email. If you need to reschedule, 
please inform us at least 24 hours in advance.</p>

<p>We look forward to meeting you!</p>
`;

// Next Round Body Content (same as before)
const nextRoundBody = `
<p>Dear <strong style="color: #1e3a8a;">{{candidate_name}}</strong>,</p>

<div class="highlight-box">
    <strong style="color: #92400e; font-size: 16px;">🎉 Congratulations!</strong><br/>
    We are pleased to inform you that you have successfully cleared the previous round 
    and have been shortlisted for the next round of interview for the position of <strong>{{job_role}}</strong>.
</div>

<p>We were impressed by your performance and believe you will continue to excel in the upcoming round.</p>

<h3>Next Round Details</h3>

<table>
    <tr>
        <td>Interview Date</td>
        <td>{{interview_date}}</td>
    </tr>
    <tr>
        <td>Interview Time</td>
        <td>{{interview_time}}</td>
    </tr>
    <tr>
        <td>Round</td>
        <td>{{round_name}}</td>
    </tr>
    <tr>
        <td>Interview Mode</td>
        <td>{{interview_mode}}</td>
    </tr>
    {{#if isOffline}}
    <tr style="background: #fef3c7 !important;">
        <td style="color: #92400e !important; font-weight: bold;">📍 Venue</td>
        <td style="color: #92400e !important; font-weight: bold;">{{interview_location}}</td>
    </tr>
    {{/if}}
    {{#if isOnline}}
    <tr style="background: #dbeafe !important;">
        <td style="color: #1e40af !important; font-weight: bold;">🔗 Meeting Link</td>
        <td><a href="{{interview_link}}" style="color: #2563eb; text-decoration: underline;">Click here to join</a></td>
    </tr>
    {{/if}}
</table>

<p>Keep up the good work and prepare well for the next round. 
Please ensure you are available at the scheduled time.</p>

<p>We wish you all the best!</p>
`;

// Offer Letter Body Content (same as before)
const offerLetterBody = `
<p style="margin-bottom: 10px;">Date: {{current_date}}</p>
<p style="margin-bottom: 25px; color: #64748b;">Ref: OFFER/{{current_date}}/{{candidate_name}}</p>

<p>Dear <strong style="color: #1e3a8a;">{{candidate_name}}</strong>,</p>

<p>We are delighted to extend an offer of employment to you for the position of 
<strong>{{job_role}}</strong> at our organization.</p>

<p>After careful consideration of your qualifications, experience, and performance during the interview process, 
we believe you will be a valuable addition to our team.</p>

<h3>Offer Details</h3>

<table>
    <tr>
        <td>Position</td>
        <td>{{job_role}}</td>
    </tr>
    <tr style="background: #ecfdf5 !important;">
        <td style="color: #065f46 !important; font-weight: bold;">💰 Annual CTC</td>
        <td style="color: #065f46 !important; font-weight: bold; font-size: 18px;">₹ {{ctc}}</td>
    </tr>
    <tr>
        <td>Joining Date</td>
        <td>{{joining_date}}</td>
    </tr>
    <tr>
        <td>Offer Valid Until</td>
        <td>{{expiry_date}}</td>
    </tr>
    <tr>
        <td>Employment Type</td>
        <td>Full-time</td>
    </tr>
</table>

<h3>Terms & Conditions</h3>

<ul style="line-height: 2; color: #475569;">
    <li>This offer is contingent upon successful completion of background verification and reference checks.</li>
    <li>You will be subject to a probation period of <strong>3 months</strong> from your date of joining.</li>
    <li>You will be entitled to benefits as per company policy, including health insurance, paid leave, and other perks.</li>
    <li>Your employment will be governed by the terms and conditions outlined in the employment contract.</li>
</ul>

<div class="highlight-box">
    <strong style="color: #92400e;">⏰ Action Required:</strong><br/>
    Please sign and return the duplicate copy of this offer letter by <strong>{{expiry_date}}</strong> to confirm your acceptance.
</div>

<p>We are excited to have you join our team and look forward to a long and mutually beneficial association.</p>

<p>If you have any questions regarding this offer, please feel free to contact our HR department.</p>
`;

async function updateAllTemplatesWithTitles() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Update Interview Call Template
        await LetterTemplate.findOneAndUpdate(
            { type: 'Interview Call' },
            {
                name: 'PROFESSIONAL INTERVIEW CALL',
                type: 'Interview Call',
                subject: 'Interview Invitation - {{job_role}}',
                bodyContent: getBaseTemplate('INTERVIEW CALL', interviewCallBody),
                variables: ['candidate_name', 'job_role', 'current_date', 'interview_date', 'interview_time', 'interview_mode', 'interview_location', 'interview_link', 'round_name', 'company_address'],
                isActive: true
            },
            { upsert: true, new: true }
        );
        console.log('✅ Interview Call template updated with title!');

        // Update Next Round Template
        await LetterTemplate.findOneAndUpdate(
            { type: 'Next Round' },
            {
                name: 'PROFESSIONAL NEXT ROUND',
                type: 'Next Round',
                subject: 'Next Round Interview - {{job_role}}',
                bodyContent: getBaseTemplate('NEXT ROUND', nextRoundBody),
                variables: ['candidate_name', 'job_role', 'current_date', 'interview_date', 'interview_time', 'interview_mode', 'interview_location', 'interview_link', 'round_name', 'company_address'],
                isActive: true
            },
            { upsert: true, new: true }
        );
        console.log('✅ Next Round template updated with title!');

        // Update Offer Letter Template
        await LetterTemplate.findOneAndUpdate(
            { type: 'Offer' },
            {
                name: 'PROFESSIONAL OFFER LETTER',
                type: 'Offer',
                subject: 'Job Offer - {{job_role}}',
                bodyContent: getBaseTemplate('OFFER LETTER', offerLetterBody),
                variables: ['candidate_name', 'job_role', 'current_date', 'ctc', 'joining_date', 'expiry_date', 'company_address'],
                isActive: true
            },
            { upsert: true, new: true }
        );
        console.log('✅ Offer Letter template updated with title!');

        console.log('\n🎨 Updates Applied:');
        console.log('  ✅ Letter titles in header (INTERVIEW CALL, NEXT ROUND, OFFER LETTER)');
        console.log('  ✅ Compact address section (smaller font, single line contact)');
        console.log('  ✅ Company address field added ({{company_address}})');
        console.log('  ✅ Reduced header height (100px from 120px)');
        console.log('  ✅ Reduced footer height (80px from 90px)');
        console.log('\n📝 All templates updated successfully!');

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

updateAllTemplatesWithTitles();
