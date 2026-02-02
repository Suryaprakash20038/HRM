const mongoose = require('mongoose');
require('dotenv').config();

const LetterTemplate = require('./src/models/Recruitment/LetterTemplate');

const enhancedNextRoundTemplateContent = `
<div style="margin-bottom: 25px;">
    <p style="margin: 5px 0; color: #64748b; font-size: 13px;">Date: {{current_date}}</p>
</div>

<p style="margin-bottom: 20px; font-size: 15px; line-height: 1.6;">Dear <strong style="color: #1e40af;">{{candidate_name}}</strong>,</p>

<!-- Congratulations Box -->
<div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px 25px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #047857; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
    <p style="margin: 0; color: white; font-size: 15px; line-height: 1.8;">
        <strong style="font-size: 16px;">🎉 Congratulations!</strong><br/>
        We are pleased to inform you that you have successfully cleared the previous round and have been shortlisted for the next round of interview.
    </p>
</div>

<p style="margin-bottom: 25px; font-size: 14px; line-height: 1.8; color: #334155;">
    We were impressed by your performance and believe you will continue to excel in the upcoming round for the position of 
    <strong style="color: #1e40af;">{{job_role}}</strong> at <strong>{{company_name}}</strong>.
</p>

<!-- Next Round Details Section -->
<div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 15px 20px; border-radius: 8px 8px 0 0; margin-top: 30px;">
    <h3 style="color: white; margin: 0; font-size: 18px; font-weight: 600;">
        📅 Next Round Details
    </h3>
</div>

<table style="width: 100%; border-collapse: collapse; margin: 0 0 30px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-radius: 0 0 8px 8px; overflow: hidden;">
    <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 16px 20px; font-weight: 600; color: #475569; width: 200px; font-size: 14px;">Interview Date</td>
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

<!-- Great Progress Box -->
<div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 18px 22px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #047857; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
    <p style="margin: 0; color: white; font-size: 14px; line-height: 1.8;">
        <strong style="font-size: 15px;">🌟 Great Progress!</strong><br/>
        You have performed well in the previous round. Keep up the good work and prepare well for the next round.
    </p>
</div>

<!-- Important Notice Box -->
<div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 18px 22px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #1e40af; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
    <p style="margin: 0; color: white; font-size: 14px; line-height: 1.8;">
        <strong style="font-size: 15px;">ℹ️ Important:</strong><br/>
        Please ensure you are available at the scheduled time. If you have any questions or need to reschedule, please contact us immediately.
    </p>
</div>

<p style="margin-top: 30px; color: #475569; font-size: 14px; line-height: 1.8;">
    We wish you all the best for your next round!
</p>

<p style="margin-top: 20px; color: #334155; font-size: 14px; line-height: 1.8;">
    Looking forward to meeting you at <strong style="color: #1e40af;">{{company_name}}</strong>!
</p>
`;

async function updateNextRoundTemplate() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find and update Next Round template
        let template = await LetterTemplate.findOne({ type: 'Next Round' });

        if (template) {
            // Update existing template
            template.bodyContent = enhancedNextRoundTemplateContent;
            template.name = 'ENHANCED NEXT ROUND';
            template.subject = 'Next Round Interview - {{job_role}} at {{company_name}}';
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
            console.log('✅ Next Round template updated successfully!');
        } else {
            // Create new template
            template = await LetterTemplate.create({
                name: 'ENHANCED NEXT ROUND',
                type: 'Next Round',
                subject: 'Next Round Interview - {{job_role}} at {{company_name}}',
                bodyContent: enhancedNextRoundTemplateContent,
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
            console.log('✅ Next Round template created successfully!');
        }

        console.log('\n📋 Template Details:');
        console.log('Name:', template.name);
        console.log('Type:', template.type);
        console.log('\n🎨 Design Features:');
        console.log('  ✅ Royal Blue gradient headers');
        console.log('  ✅ Green congratulations box');
        console.log('  ✅ Green progress box');
        console.log('  ✅ Blue important notice box');
        console.log('  ✅ Yellow location highlight (Offline)');
        console.log('  ✅ Blue meeting link (Online)');
        console.log('  ✅ Professional table layout');
        console.log('  ✅ Icons (🎉, 📅, 📍, 🔗, 🌟, ℹ️)');

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

updateNextRoundTemplate();
