const mongoose = require('mongoose');
require('dotenv').config();

const LetterTemplate = require('./src/models/Recruitment/LetterTemplate');

const geometricTemplate = `<!DOCTYPE html>
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
        
        /* Logo in Header (Replaces Text) */
        .logo-section {
            position: absolute;
            left: 60px;
            top: 20px;
            z-index: 20;
            background: white;
            padding: 8px 15px;
            border-radius: 4px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .logo-img {
            height: 45px;
            max-width: 200px;
            object-fit: contain;
            display: block;
        }
        
        /* Content Area */
        .content {
            padding: 40px 60px 100px 60px; /* Reduced bottom padding slightly as footer is fixed */
            min-height: 800px;
            display: flex;
            flex-direction: column;
        }

        /* Title in Body */
        .body-letter-title {
            margin-bottom: 30px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 15px;
        }
        
        /* ... existing styles ... */

        .letter-body {
            font-size: 14px;
            line-height: 1.9;
            color: #334155;
            text-align: justify;
            flex-grow: 1; /* Allow body to grow, but signature handles push */
            display: flex;
            flex-direction: column;
        }
        
        /* ... styles ... */

        /* Signature Section - Kept together, pushed to bottom */
        .signature-section {
            margin-top: auto; /* Push to bottom of flex container */
            padding-top: 40px;
            page-break-inside: avoid;
        }
        
        .signature-line {
            margin-top: 70px;
            border-top: 3px solid #1e3a8a;
            width: 220px;
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
            z-index: 100;
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
    <!-- Header with LOGO -->
    <div class="header">
        <div class="header-shape-1"></div>
        <div class="header-shape-2"></div>
        <div class="logo-section">
            {{#if company_logo}}
                <img src="{{company_logo}}" class="logo-img" alt="Company Logo" />
            {{else}}
                <h2 style="margin: 10px 0; color: #1e3a8a;">{{company_name}}</h2>
            {{/if}}
        </div>
    </div>
    
    <!-- Main Content -->
    <div class="content">
        <!-- Title Moved to Body -->
        <div class="body-letter-title">
            <h1>NEXT ROUND</h1>
            <p>Empowering Careers, Enhancing Lives</p>
        </div>

        <!-- Date -->
        <div class="date-section">
            Date: {{current_date}}
        </div>
        
        <!-- Letter Body Content -->
        <div class="letter-body">
            
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

<p style="text-align: center; font-weight: bold; margin-top: 30px;">
  We look forward to your participation in the next round of interviews.
</p>

<!-- Signature Section -->
<div class="signature-section">
     <p>Sincerely,</p>
     {{#if company_signature}}<img src="{{company_signature}}" style="height: 60px; margin-top: 10px;" />{{/if}}
     <p><strong>HR Signature</strong><br>{{company_name}}</p>
</div>

        </div>
    </div>
    
    <!-- Footer from Branding -->
    <div class="footer">
        <div class="footer-shape-1"></div>
        <div class="footer-shape-2"></div>
        <div class="footer-content">
             {{#if processed_phone_str}}
             <div class="footer-item"><span class="footer-icon">📞</span> {{processed_phone_str}}</div><br>
             {{/if}}
             {{#if processed_email_str}}
             <div class="footer-item"><span class="footer-icon">✉️</span> {{processed_email_str}}</div><br>
             {{/if}}
             {{#if processed_address_str}}
             <div class="footer-item"><span class="footer-icon">📍</span> {{processed_address_str}}</div>
             {{/if}}
        </div>
    </div>
   
</body>
</html>`;

async function updateNextRound() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const template = await LetterTemplate.findOne({ type: 'Next Round' });
        if (template) {
            template.bodyContent = geometricTemplate;
            await template.save();
            console.log('✅ Updated "Next Round" with Company Logo Header & Body Title');
        } else {
            console.log('❌ "Next Round" template not found.');
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateNextRound();
