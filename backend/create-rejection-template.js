const mongoose = require('mongoose');
require('dotenv').config();

const LetterTemplate = require('./src/models/Recruitment/LetterTemplate');

const rejectionTemplateContent = `<div style="margin-bottom: 20px;">
    <p style="margin: 5px 0; color: #64748b;">Date: {{current_date}}</p>
</div>

<p style="margin-bottom: 20px;">Dear <strong>{{candidate_name}}</strong>,</p>

<p style="margin-bottom: 20px;">Thank you for your interest in the <strong>{{job_role}}</strong> position at <strong>{{company_name}}</strong> and for taking the time to interview with us.</p>

<p style="margin-bottom: 20px;">We appreciate the effort you put into your application and the opportunity to learn more about your background and qualifications.</p>

<div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #94a3b8;">
    <p style="margin: 0; color: #475569; line-height: 1.8;">
        After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current requirements for this position.
    </p>
</div>

<p style="margin-bottom: 20px;">This decision was not easy, as we received applications from many qualified candidates. We were impressed by your skills and experience, and we encourage you to apply for future openings that match your profile.</p>

<div style="background: #dbeafe; padding: 15px 20px; border-left: 4px solid #3b82f6; margin: 25px 0; border-radius: 4px;">
    <p style="margin: 0; color: #1e40af; font-size: 14px;">
        <strong>💼 Stay Connected:</strong> We will keep your resume on file and may contact you if a suitable position becomes available in the future.
    </p>
</div>

<p style="margin-top: 30px; color: #475569;">We wish you all the best in your job search and future career endeavors.</p>

<p style="margin-top: 20px; color: #475569;">Thank you once again for your interest in <strong>{{company_name}}</strong>.</p>`;

async function createOrUpdateRejectionTemplate() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if Rejection template exists
        let template = await LetterTemplate.findOne({ type: 'Rejection' });

        if (template) {
            // Update existing template
            template.bodyContent = rejectionTemplateContent;
            template.variables = [
                'candidate_name',
                'job_role',
                'company_name',
                'current_date',
                'hr_name'
            ];
            await template.save();
            console.log('✅ Rejection Letter template updated successfully!');
        } else {
            // Create new template
            template = await LetterTemplate.create({
                name: 'REJECTION LETTER',
                type: 'Rejection',
                subject: 'Application Status - {{job_role}} at {{company_name}}',
                bodyContent: rejectionTemplateContent,
                variables: [
                    'candidate_name',
                    'job_role',
                    'company_name',
                    'current_date',
                    'hr_name'
                ],
                isActive: true,
                isLocked: false
            });
            console.log('✅ Rejection Letter template created successfully!');
        }

        console.log('Template Name:', template.name);
        console.log('Template Type:', template.type);
        console.log('\n📋 The template includes:');
        console.log('  - Professional and respectful tone');
        console.log('  - Appreciation for candidate\'s effort');
        console.log('  - Clear but polite rejection message');
        console.log('  - Encouragement for future applications');
        console.log('  - Stay connected message (blue box)');

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createOrUpdateRejectionTemplate();
