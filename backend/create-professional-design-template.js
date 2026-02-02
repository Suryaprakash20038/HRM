const mongoose = require('mongoose');
require('dotenv').config();

const LetterTemplate = require('./src/models/Recruitment/LetterTemplate');

// Dark Blue & Yellow Professional Design
const professionalDesignTemplate = `
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
            font-family: 'Arial', sans-serif;
            color: #333;
            position: relative;
        }
        
        /* Header Design */
        .header {
            position: relative;
            height: 120px;
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            overflow: hidden;
        }
        
        .header-shape {
            position: absolute;
            right: 0;
            top: 0;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 0 200px 120px 0;
            border-color: transparent #fbbf24 transparent transparent;
        }
        
        .header-accent {
            position: absolute;
            right: 200px;
            top: 0;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 0 100px 120px 0;
            border-color: transparent #f59e0b transparent transparent;
        }
        
        .logo-section {
            position: absolute;
            left: 60px;
            top: 40px;
            color: white;
        }
        
        .logo-text {
            font-size: 24px;
            font-weight: bold;
            color: #fbbf24;
            margin: 0;
        }
        
        .logo-tagline {
            font-size: 11px;
            color: rgba(255, 255, 255, 0.8);
            margin: 5px 0 0 0;
            letter-spacing: 2px;
        }
        
        /* Content Area */
        .content {
            padding: 40px 60px;
            min-height: 600px;
        }
        
        .sender-info {
            margin-bottom: 30px;
            font-size: 13px;
            line-height: 1.8;
        }
        
        .sender-name {
            font-weight: bold;
            color: #1e3a8a;
            margin-bottom: 5px;
        }
        
        .sender-detail {
            color: #64748b;
            margin: 3px 0;
        }
        
        .sender-detail i {
            color: #fbbf24;
            margin-right: 8px;
        }
        
        .date-section {
            text-align: right;
            color: #64748b;
            font-size: 13px;
            margin-bottom: 30px;
        }
        
        .letter-body {
            font-size: 14px;
            line-height: 1.8;
            color: #334155;
            text-align: justify;
        }
        
        .signature-section {
            margin-top: 50px;
        }
        
        .signature-line {
            margin-top: 60px;
            border-top: 2px solid #1e3a8a;
            width: 200px;
        }
        
        .signer-name {
            font-weight: bold;
            color: #1e3a8a;
            margin-top: 10px;
        }
        
        .signer-title {
            color: #64748b;
            font-size: 13px;
        }
        
        /* Footer Design */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 100px;
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            overflow: hidden;
        }
        
        .footer-shape {
            position: absolute;
            right: 0;
            bottom: 0;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 100px 200px 0 0;
            border-color: #fbbf24 transparent transparent transparent;
        }
        
        .footer-accent {
            position: absolute;
            right: 200px;
            bottom: 0;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 100px 100px 0 0;
            border-color: #f59e0b transparent transparent transparent;
        }
        
        .footer-content {
            position: relative;
            z-index: 10;
            padding: 20px 60px;
            color: white;
            font-size: 12px;
        }
        
        .footer-item {
            display: inline-block;
            margin-right: 30px;
            margin-bottom: 8px;
        }
        
        .footer-item i {
            color: #fbbf24;
            margin-right: 8px;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <div class="header-shape"></div>
        <div class="header-accent"></div>
        <div class="logo-section">
            <h1 class="logo-text">{{company_name}}</h1>
            <p class="logo-tagline">EXCELLENCE IN RECRUITMENT</p>
        </div>
    </div>
    
    <!-- Content -->
    <div class="content">
        <!-- Sender Info -->
        <div class="sender-info">
            <div class="sender-name">{{hr_name}}</div>
            <div class="sender-detail">
                <i>📍</i> {{company_address}}
            </div>
            <div class="sender-detail">
                <i>📞</i> {{company_phone}}
            </div>
            <div class="sender-detail">
                <i>✉️</i> {{company_email}}
            </div>
        </div>
        
        <!-- Date -->
        <div class="date-section">
            Date: {{current_date}}
        </div>
        
        <!-- Letter Body -->
        <div class="letter-body">
            {{BODY_CONTENT}}
        </div>
        
        <!-- Signature -->
        <div class="signature-section">
            <p>Sincerely,</p>
            <div class="signature-line"></div>
            <div class="signer-name">{{hr_name}}</div>
            <div class="signer-title">HR Manager</div>
            <div class="signer-title">{{company_name}}</div>
        </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
        <div class="footer-shape"></div>
        <div class="footer-accent"></div>
        <div class="footer-content">
            <div class="footer-item">
                <i>🌐</i> www.{{company_website}}
            </div>
            <div class="footer-item">
                <i>✉️</i> {{company_email}}
            </div>
            <div class="footer-item">
                <i>📞</i> {{company_phone}}
            </div>
        </div>
    </div>
</body>
</html>
`;

async function createProfessionalDesignTemplates() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Interview Call Body
        const interviewCallBody = `
            <p>Dear <strong style="color: #1e3a8a;">{{candidate_name}}</strong>,</p>
            
            <p>Thank you for applying for the position of <strong>{{job_role}}</strong> at {{company_name}}. 
            We are impressed with your profile and would like to invite you for an interview.</p>
            
            <h3 style="color: #1e3a8a; border-bottom: 2px solid #fbbf24; padding-bottom: 10px; margin-top: 30px;">
                Interview Details
            </h3>
            
            <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
                <tr style="background: #f8fafc;">
                    <td style="padding: 12px; font-weight: bold; color: #1e3a8a; width: 200px;">Position</td>
                    <td style="padding: 12px;">{{job_role}}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; font-weight: bold; color: #1e3a8a;">Interview Date</td>
                    <td style="padding: 12px;">{{interview_date}}</td>
                </tr>
                <tr style="background: #f8fafc;">
                    <td style="padding: 12px; font-weight: bold; color: #1e3a8a;">Interview Time</td>
                    <td style="padding: 12px;">{{interview_time}}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; font-weight: bold; color: #1e3a8a;">Round</td>
                    <td style="padding: 12px;">{{round_name}}</td>
                </tr>
                <tr style="background: #f8fafc;">
                    <td style="padding: 12px; font-weight: bold; color: #1e3a8a;">Mode</td>
                    <td style="padding: 12px;">{{interview_mode}}</td>
                </tr>
                {{#if isOffline}}
                <tr style="background: #fef3c7;">
                    <td style="padding: 12px; font-weight: bold; color: #92400e;">📍 Venue</td>
                    <td style="padding: 12px; font-weight: bold; color: #92400e;">{{interview_location}}</td>
                </tr>
                {{/if}}
            </table>
            
            <p>Please confirm your attendance by replying to this email. We look forward to meeting you!</p>
        `;

        // Create/Update Interview Call Template
        await LetterTemplate.findOneAndUpdate(
            { type: 'Interview Call' },
            {
                name: 'PROFESSIONAL INTERVIEW CALL',
                type: 'Interview Call',
                subject: 'Interview Invitation - {{job_role}} at {{company_name}}',
                bodyContent: professionalDesignTemplate.replace('{{BODY_CONTENT}}', interviewCallBody),
                variables: ['candidate_name', 'job_role', 'company_name', 'current_date', 'interview_date', 'interview_time', 'interview_mode', 'interview_location', 'round_name', 'hr_name', 'company_address', 'company_phone', 'company_email', 'company_website'],
                isActive: true
            },
            { upsert: true, new: true }
        );

        console.log('✅ Professional Interview Call template created!');
        console.log('\n🎨 Design Features:');
        console.log('  ✅ Dark Blue & Yellow color scheme');
        console.log('  ✅ Geometric diagonal shapes');
        console.log('  ✅ Professional letterhead');
        console.log('  ✅ Contact details section');
        console.log('  ✅ Signature area');
        console.log('  ✅ Styled footer with shapes');

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createProfessionalDesignTemplates();
