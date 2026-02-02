require('dotenv').config();
const mongoose = require('mongoose');
const LetterTemplate = require('./src/models/Recruitment/LetterTemplate');

// Color schemes for the 5 new templates
const colors = {
    elegant: { primary: '#4c1d95', accent: '#c4b5fd', secondary: '#a78bfa' },
    corporate: { primary: '#0c4a6e', accent: '#38bdf8', secondary: '#0284c7' },
    vibrant: { primary: '#be123c', accent: '#fb7185', secondary: '#f43f5e' },
    fresh: { primary: '#065f46', accent: '#6ee7b7', secondary: '#10b981' },
    sunset: { primary: '#ea580c', accent: '#fdba74', secondary: '#fb923c' }
};

// Template factory function
const createTemplate = (title, subtitle, bodyContent, colorScheme) => {
    const c = colors[colorScheme] || colors.elegant;

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page { margin: 0; size: A4; }
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; }
        
        .header { 
            background: linear-gradient(135deg, ${c.primary} 0%, ${c.accent} 100%); 
            padding: 40px 60px; 
            color: white; 
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 400px;
            height: 400px;
            background: ${c.secondary};
            opacity: 0.1;
            border-radius: 50%;
        }
        
        .logo-section { position: relative; z-index: 10; }
        .logo-img { height: 50px; max-width: 250px; object-fit: contain; filter: brightness(0) invert(1); }
        
        .content { 
            padding: 50px 60px 100px; 
            min-height: 700px;
            display: flex;
            flex-direction: column;
        }
        
        .letter-title { 
            color: ${c.primary}; 
            font-size: 32px; 
            font-weight: 700; 
            margin: 0 0 10px 0;
            letter-spacing: -0.5px;
        }
        
        .letter-subtitle { 
            color: ${c.secondary}; 
            font-size: 14px; 
            text-transform: uppercase; 
            letter-spacing: 2px;
            margin: 0 0 30px 0;
        }
        
        .date-section { 
            text-align: right; 
            color: #64748b; 
            font-size: 13px; 
            margin-bottom: 30px; 
        }
        
        .letter-body { 
            font-size: 15px; 
            line-height: 1.8; 
            color: #334155; 
            flex-grow: 1;
            display: flex;
            flex-direction: column;
        }
        
        .letter-body h3 { 
            color: ${c.primary}; 
            border-left: 4px solid ${c.accent}; 
            padding-left: 15px; 
            margin: 30px 0 20px 0; 
            font-size: 20px; 
        }
        
        table { 
            width: 100%; 
            margin: 25px 0; 
            border-collapse: separate;
            border-spacing: 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        
        table tr { border-bottom: 1px solid #e2e8f0; }
        table tr:last-child { border-bottom: none; }
        table td { padding: 16px 20px; }
        table td:first-child { 
            font-weight: 600; 
            color: ${c.primary}; 
            width: 200px;
            background: #f8fafc;
        }
        table tr:hover { background: #f1f5f9; }
        
        .highlight-box { 
            background: linear-gradient(135deg, ${c.accent}15 0%, ${c.secondary}15 100%); 
            border-left: 4px solid ${c.accent}; 
            padding: 25px; 
            margin: 25px 0; 
            border-radius: 6px; 
        }
        
        .signature-section { 
            margin-top: auto; 
            padding-top: 50px; 
            page-break-inside: avoid; 
        }
        
        .footer { 
            position: fixed; 
            bottom: 0; 
            left: 0; 
            right: 0; 
            background: ${c.primary}; 
            color: white; 
            padding: 20px 60px; 
            font-size: 11px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .footer-item { margin-right: 20px; }
        .footer-icon { color: ${c.accent}; margin-right: 6px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo-section">
            {{#if company_logo}}
                <img src="{{company_logo}}" class="logo-img" alt="{{company_name}}" />
            {{else}}
                <h2 style="margin: 0; color: white; font-size: 28px;">{{company_name}}</h2>
            {{/if}}
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

// Content for different letter types
const interviewContent = `<div class="highlight-box">
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

const offerContent = `<div class="highlight-box">
    <strong style="font-size: 18px;">🎉 CONGRATULATIONS!</strong><br/>
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

const nextRoundContent = `<div class="highlight-box">
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

const rejectionContent = `<p>Thank you for your interest in the position of <strong>{{job_role}}</strong> at {{company_name}}.</p>

<div style="background: #f8fafc; padding: 25px; border-left: 4px solid #94a3b8; margin: 25px 0; border-radius: 6px;">
    <p style="margin: 0;">After careful review of all applications, we have decided to move forward with other candidates whose qualifications more closely match our current requirements.</p>
</div>

<p>We appreciate the time and effort you invested in the application process. Your resume will be kept on file for future opportunities.</p>
<p>We wish you the very best in your career endeavors.</p>
`;

// Subject map for different letter types
const subjectMap = {
    'Interview Call': 'Interview Invitation - {{job_role}} at {{company_name}}',
    'Offer': 'Job Offer - {{job_role}} at {{company_name}}',
    'Next Round': 'Next Round Interview - {{job_role}} at {{company_name}}',
    'Rejection': 'Application Status - {{job_role}} at {{company_name}}'
};

// Define the 5 new templates for each type
const templates = [
    // INTERVIEW CALL TEMPLATES
    { name: 'Elegant Interview Call', type: 'Interview Call', colorScheme: 'elegant', title: 'Interview Invitation', subtitle: 'Career Opportunity', content: interviewContent },
    { name: 'Corporate Interview Call', type: 'Interview Call', colorScheme: 'corporate', title: 'Interview Call', subtitle: 'Professional Engagement', content: interviewContent },
    { name: 'Vibrant Interview Call', type: 'Interview Call', colorScheme: 'vibrant', title: 'Interview Invitation', subtitle: 'Join Our Journey', content: interviewContent },
    { name: 'Fresh Interview Call', type: 'Interview Call', colorScheme: 'fresh', title: 'Interview Call', subtitle: 'New Opportunities', content: interviewContent },
    { name: 'Sunset Interview Call', type: 'Interview Call', colorScheme: 'sunset', title: 'Interview Invitation', subtitle: 'Career Growth', content: interviewContent },

    // OFFER LETTER TEMPLATES
    { name: 'Elegant Offer Letter', type: 'Offer', colorScheme: 'elegant', title: 'Offer Letter', subtitle: 'Welcome to the Team', content: offerContent },
    { name: 'Corporate Offer Letter', type: 'Offer', colorScheme: 'corporate', title: 'Employment Offer', subtitle: 'Career Opportunity', content: offerContent },
    { name: 'Vibrant Offer Letter', type: 'Offer', colorScheme: 'vibrant', title: 'Job Offer', subtitle: 'Join Our Team', content: offerContent },
    { name: 'Fresh Offer Letter', type: 'Offer', colorScheme: 'fresh', title: 'Offer Letter', subtitle: 'New Beginning', content: offerContent },
    { name: 'Sunset Offer Letter', type: 'Offer', colorScheme: 'sunset', title: 'Employment Offer', subtitle: 'Welcome Aboard', content: offerContent },

    // NEXT ROUND TEMPLATES
    { name: 'Elegant Next Round', type: 'Next Round', colorScheme: 'elegant', title: 'Next Round', subtitle: 'Progress Update', content: nextRoundContent },
    { name: 'Corporate Next Round', type: 'Next Round', colorScheme: 'corporate', title: 'Next Round Invitation', subtitle: 'Recruitment Advancement', content: nextRoundContent },
    { name: 'Vibrant Next Round', type: 'Next Round', colorScheme: 'vibrant', title: 'Next Round', subtitle: 'Exciting Progress', content: nextRoundContent },
    { name: 'Fresh Next Round', type: 'Next Round', colorScheme: 'fresh', title: 'Next Round', subtitle: 'Continued Journey', content: nextRoundContent },
    { name: 'Sunset Next Round', type: 'Next Round', colorScheme: 'sunset', title: 'Next Round', subtitle: 'Interview Progression', content: nextRoundContent },

    // REJECTION LETTER TEMPLATES
    { name: 'Elegant Rejection Letter', type: 'Rejection', colorScheme: 'elegant', title: 'Application Status', subtitle: 'Human Resources', content: rejectionContent },
    { name: 'Corporate Rejection Letter', type: 'Rejection', colorScheme: 'corporate', title: 'Application Update', subtitle: 'Recruitment Team', content: rejectionContent },
    { name: 'Vibrant Rejection Letter', type: 'Rejection', colorScheme: 'vibrant', title: 'Application Status', subtitle: 'Hiring Team', content: rejectionContent },
    { name: 'Fresh Rejection Letter', type: 'Rejection', colorScheme: 'fresh', title: 'Application Update', subtitle: 'Talent Team', content: rejectionContent },
    { name: 'Sunset Rejection Letter', type: 'Rejection', colorScheme: 'sunset', title: 'Application Status', subtitle: 'HR Communication', content: rejectionContent },
];

async function addNew5Templates() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        let addedCount = 0;
        let updatedCount = 0;

        for (const template of templates) {
            const html = createTemplate(template.title, template.subtitle, template.content, template.colorScheme);
            const subject = subjectMap[template.type] || `Letter from {{company_name}}`;

            const existing = await LetterTemplate.findOne({ name: template.name, type: template.type });

            if (existing) {
                existing.bodyContent = html;
                existing.subject = subject;
                await existing.save();
                console.log(`🔄 Updated: ${template.name}`);
                updatedCount++;
            } else {
                await LetterTemplate.create({
                    name: template.name,
                    type: template.type,
                    subject: subject,
                    bodyContent: html,
                    variables: ['candidate_name', 'job_role', 'interview_date', 'interview_time', 'company_name'],
                    isActive: true,
                    isLocked: false,
                    isFixedPdf: false
                });
                console.log(`✅ Added: ${template.name}`);
                addedCount++;
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`   ✅ Added: ${addedCount} templates`);
        console.log(`   🔄 Updated: ${updatedCount} templates`);
        console.log(`   📝 Total processed: ${templates.length} templates`);

        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addNew5Templates();
