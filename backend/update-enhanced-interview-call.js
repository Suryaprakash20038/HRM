const mongoose = require('mongoose');
require('dotenv').config();

const LetterTemplate = require('./src/models/Recruitment/LetterTemplate');

const enhancedInterviewCallTemplateContent = `
<div style="margin-bottom: 25px;">
    <p style="margin: 5px 0; color: #64748b; font-size: 13px;">Date: {{current_date}}</p>
</div>

<p style="margin-bottom: 20px; font-size: 15px; line-height: 1.6;">Dear <strong style="color: #1e40af;">{{candidate_name}}</strong>,</p>

<!-- Welcome Box -->
<div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px 25px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #047857; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
    <p style="margin: 0; color: white; font-size: 15px; line-height: 1.8;">
        <strong style="font-size: 16px;">🎉 Congratulations!</strong><br/>
        Thank you for applying for the position of <strong>{{job_role}}</strong> at <strong>{{company_name}}</strong>. 
        We are impressed with your profile and would like to invite you for an interview.
    </p>
</div>

<p style="margin-bottom: 25px; font-size: 14px; line-height: 1.8; color: #334155;">
    This is an excellent opportunity to discuss your qualifications, experience, and how you can contribute to our team.
</p>

<!-- Interview Details Section -->
<div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 15px 20px; border-radius: 8px 8px 0 0; margin-top: 30px;">
    <h3 style="color: white; margin: 0; font-size: 18px; font-weight: 600;">
        📅 Interview Details
    </h3>
</div>

<table style="width: 100%; border-collapse: collapse; margin: 0 0 30px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-radius: 0 0 8px 8px; overflow: hidden;">
    <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 16px 20px; font-weight: 600; color: #475569; width: 200px; font-size: 14px;">Position</td>
        <td style="padding: 16px 20px; color: #0f172a; font-weight: 500; font-size: 14px;">{{job_role}}</td>
    </tr>
    <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 16px 20px; font-weight: 600; color: #475569; font-size: 14px;">Interview Date</td>
        <td style="padding: 16px 20px; color: #0f172a; font-weight: 500; font-size: 14px;">{{interview_date}}</td>
    </tr>
    <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 16px 20px; font-weight: 600; color: #475569; font-size: 14px;">Interview Time</td>
        <td style="padding: 16px 20px; color: #0f172a; font-weight: 500; font-size: 14px;">{{interview_time}}</td>
    </tr>
    <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 16px 20px; font-weight: 600; color: #475569; font-size: 14px;">Round</td>
        <td style="padding: 16px 20px; color: #0f172a; font-weight: 500; font-size: 14px;">{{round_name}}</td>
    </tr>
    <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 16px 20px; font-weight: 600; color: #475569; font-size: 14px;">Interview Mode</td>
        <td style="padding: 16px 20px; color: #0f172a; font-weight: 500; font-size: 14px;">{{interview_mode}}</td>
    </tr>
    {{#if isOffline}}
    <tr style="background: #fef3c7; border-bottom: 1px solid #fde68a;">
        <td style="padding: 18px 20px; font-weight: 600; color: #92400e; font-size: 14px;">
            📍 Venue
        </td>
        <td style="padding: 18px 20px; color: #78350f; font-weight: 600; font-size: 14px;">
            {{interview_location}}
        </td>
    </tr>
    {{/if}}
    {{#if isOnline}}
    <tr style="background: #dbeafe; border-bottom: 1px solid #bfdbfe;">
        <td style="padding: 18px 20px; font-weight: 600; color: #1e40af; font-size: 14px;">
            🔗 Meeting Link
        </td>
        <td style="padding: 18px 20px;">
            <a href="{{interview_link}}" style="color: #2563eb; text-decoration: underline; font-weight: 500; font-size: 14px;">Click here to join</a>
        </td>
    </tr>
    {{/if}}
</table>

<!-- Preparation Tips Box -->
<div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 18px 22px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #1e40af; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
    <p style="margin: 0; color: white; font-size: 14px; line-height: 1.8;">
        <strong style="font-size: 15px;">💡 Preparation Tips:</strong><br/>
        Please bring a copy of your resume and any relevant certificates. 
        Be prepared to discuss your experience, skills, and career goals.
    </p>
</div>

<!-- Important Notice Box -->
<div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 18px 22px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #d97706; box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);">
    <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.8;">
        <strong style="font-size: 15px;">⏰ Important:</strong><br/>
        Please confirm your attendance by replying to this email. 
        If you need to reschedule, please inform us at least 24 hours in advance.
    </p>
</div>

<p style="margin-top: 30px; color: #475569; font-size: 14px; line-height: 1.8;">
    If you have any questions regarding this interview, please feel free to contact our HR department.
</p>

<p style="margin-top: 20px; color: #334155; font-size: 14px; line-height: 1.8;">
    We look forward to meeting you at <strong style="color: #1e40af;">{{company_name}}</strong>!
</p>
`;

async function updateInterviewCallTemplate() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find and update Interview Call template
        let template = await LetterTemplate.findOne({ type: 'Interview Call' });

        if (template) {
            // Update existing template
            template.bodyContent = enhancedInterviewCallTemplateContent;
            template.name = 'ENHANCED INTERVIEW CALL';
            template.subject = 'Interview Invitation - {{job_role}} at {{company_name}}';
            template.variables = [
                'candidate_name',
                'job_role',
                'company_name',
                'current_date',
                'interview_date',
                'interview_time',
                'interview_mode',
                'interview_location',
                'interview_link',
                'round_name'
            ];
            await template.save();
            console.log('✅ Interview Call template updated successfully!');
        } else {
            // Create new template
            template = await LetterTemplate.create({
                name: 'ENHANCED INTERVIEW CALL',
                type: 'Interview Call',
                subject: 'Interview Invitation - {{job_role}} at {{company_name}}',
                bodyContent: enhancedInterviewCallTemplateContent,
                variables: [
                    'candidate_name',
                    'job_role',
                    'company_name',
                    'current_date',
                    'interview_date',
                    'interview_time',
                    'interview_mode',
                    'interview_location',
                    'interview_link',
                    'round_name'
                ],
                isActive: true,
                isLocked: false
            });
            console.log('✅ Interview Call template created successfully!');
        }

        console.log('\n📋 Template Details:');
        console.log('Name:', template.name);
        console.log('Type:', template.type);
        console.log('\n🎨 Design Features:');
        console.log('  ✅ Royal Blue gradient headers');
        console.log('  ✅ Green welcome box');
        console.log('  ✅ Blue preparation tips box');
        console.log('  ✅ Yellow important notice box');
        console.log('  ✅ Yellow location highlight (Offline)');
        console.log('  ✅ Blue meeting link (Online)');
        console.log('  ✅ Professional table layout');
        console.log('  ✅ Icons (🎉, 📅, 📍, 🔗, 💡, ⏰)');

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

updateInterviewCallTemplate();
