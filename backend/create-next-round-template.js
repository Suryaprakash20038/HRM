const mongoose = require('mongoose');
require('dotenv').config();

const LetterTemplate = require('./src/models/Recruitment/LetterTemplate');

const nextRoundTemplateContent = `<div style="margin-bottom: 20px;">
    <p style="margin: 5px 0; color: #64748b;">Date: {{current_date}}</p>
</div>

<p style="margin-bottom: 20px;">Dear <strong>{{candidate_name}}</strong>,</p>

<p style="margin-bottom: 20px;">Congratulations! We are pleased to inform you that you have successfully cleared the previous round and have been shortlisted for the <strong>{{round_name}}</strong> for the position of <strong>{{job_role}}</strong> at <strong>{{company_name}}</strong>.</p>

<h3 style="color: #1e293b; margin: 30px 0 20px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Next Round Details</h3>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8fafc; border-radius: 8px;">
    <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 15px 20px; font-weight: 600; color: #475569; width: 200px;">Interview Date</td>
        <td style="padding: 15px 20px; color: #0f172a; font-weight: 500;">{{interview_date}}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 15px 20px; font-weight: 600; color: #475569;">Interview Time</td>
        <td style="padding: 15px 20px; color: #0f172a; font-weight: 500;">{{interview_time}}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 15px 20px; font-weight: 600; color: #475569;">Round</td>
        <td style="padding: 15px 20px; color: #0f172a; font-weight: 500;">{{round_name}}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 15px 20px; font-weight: 600; color: #475569;">Interview Mode</td>
        <td style="padding: 15px 20px; color: #0f172a; font-weight: 500;">{{interview_mode}}</td>
    </tr>
    {{#if isOffline}}
    <tr style="border-bottom: 1px solid #e2e8f0; background: #fef3c7;">
        <td style="padding: 15px 20px; font-weight: 600; color: #92400e;">📍 Venue</td>
        <td style="padding: 15px 20px; color: #78350f; font-weight: 600;">{{interview_location}}</td>
    </tr>
    {{/if}}
    {{#if isOnline}}
    <tr style="border-bottom: 1px solid #e2e8f0; background: #dbeafe;">
        <td style="padding: 15px 20px; font-weight: 600; color: #1e40af;">🔗 Meeting Link</td>
        <td style="padding: 15px 20px;">
            <a href="{{interview_link}}" style="color: #2563eb; text-decoration: underline; font-weight: 500;">Click here to join</a>
        </td>
    </tr>
    {{/if}}
</table>

<div style="background: #ecfdf5; padding: 15px 20px; border-left: 4px solid #10b981; margin: 25px 0; border-radius: 4px;">
    <p style="margin: 0; color: #065f46; font-size: 14px;">
        <strong>🎉 Great Progress!</strong> You have performed well in the previous round. Keep up the good work and prepare well for the next round.
    </p>
</div>

<div style="background: #f1f5f9; padding: 15px 20px; border-left: 4px solid #3b82f6; margin: 25px 0; border-radius: 4px;">
    <p style="margin: 0; color: #475569; font-size: 14px;">
        <strong>Important:</strong> Please ensure you are available at the scheduled time. If you have any questions or need to reschedule, please contact our HR team immediately.
    </p>
</div>

<p style="margin-top: 30px; color: #475569;">We wish you all the best for your next round!</p>`;

async function createOrUpdateNextRoundTemplate() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if Next Round template exists
        let template = await LetterTemplate.findOne({ type: 'Next Round' });

        if (template) {
            // Update existing template
            template.bodyContent = nextRoundTemplateContent;
            template.variables = [
                'candidate_name',
                'job_role',
                'company_name',
                'current_date',
                'round_name',
                'interview_date',
                'interview_time',
                'interview_mode',
                'interview_location',
                'interview_link',
                'hr_name'
            ];
            await template.save();
            console.log('✅ Next Round template updated successfully!');
        } else {
            // Create new template
            template = await LetterTemplate.create({
                name: 'NEXT ROUND CALL',
                type: 'Next Round',
                subject: 'Next Round Interview - {{job_role}} at {{company_name}}',
                bodyContent: nextRoundTemplateContent,
                variables: [
                    'candidate_name',
                    'job_role',
                    'company_name',
                    'current_date',
                    'round_name',
                    'interview_date',
                    'interview_time',
                    'interview_mode',
                    'interview_location',
                    'interview_link',
                    'hr_name'
                ],
                isActive: true,
                isLocked: false
            });
            console.log('✅ Next Round template created successfully!');
        }

        console.log('Template Name:', template.name);
        console.log('Template Type:', template.type);
        console.log('\n📋 The template includes:');
        console.log('  - Congratulations message for clearing previous round');
        console.log('  - Interview location (for Offline mode)');
        console.log('  - Meeting link (for Online mode)');
        console.log('  - Success message box (green)');
        console.log('  - Important notice box (blue)');

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createOrUpdateNextRoundTemplate();
