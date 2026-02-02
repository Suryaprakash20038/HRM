const mongoose = require('mongoose');
require('dotenv').config();

const LetterTemplate = require('./src/models/Recruitment/LetterTemplate');

const offerTemplateContent = `<div style="margin-bottom: 20px;">
    <p style="margin: 5px 0; color: #64748b;">Date: {{current_date}}</p>
    <p style="margin: 5px 0; color: #64748b;">Ref: OFFER/{{current_date}}/{{candidate_name}}</p>
</div>

<p style="margin-bottom: 20px;">Dear <strong>{{candidate_name}}</strong>,</p>

<p style="margin-bottom: 20px;">We are delighted to extend an offer of employment to you for the position of <strong>{{job_role}}</strong> at <strong>{{company_name}}</strong>.</p>

<p style="margin-bottom: 20px;">After careful consideration of your qualifications, experience, and performance during the interview process, we believe you will be a valuable addition to our team.</p>

<h3 style="color: #1e293b; margin: 30px 0 20px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Offer Details</h3>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8fafc; border-radius: 8px;">
    <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 15px 20px; font-weight: 600; color: #475569; width: 200px;">Position</td>
        <td style="padding: 15px 20px; color: #0f172a; font-weight: 500;">{{job_role}}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0; background: #ecfdf5;">
        <td style="padding: 15px 20px; font-weight: 600; color: #065f46;">💰 Annual CTC</td>
        <td style="padding: 15px 20px; color: #065f46; font-weight: 600; font-size: 16px;">₹ {{ctc}}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 15px 20px; font-weight: 600; color: #475569;">Joining Date</td>
        <td style="padding: 15px 20px; color: #0f172a; font-weight: 500;">{{joining_date}}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 15px 20px; font-weight: 600; color: #475569;">Offer Valid Until</td>
        <td style="padding: 15px 20px; color: #0f172a; font-weight: 500;">{{expiry_date}}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 15px 20px; font-weight: 600; color: #475569;">Employment Type</td>
        <td style="padding: 15px 20px; color: #0f172a; font-weight: 500;">Full-time</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 15px 20px; font-weight: 600; color: #475569;">Work Location</td>
        <td style="padding: 15px 20px; color: #0f172a; font-weight: 500;">{{company_name}} Office</td>
    </tr>
</table>

<h3 style="color: #1e293b; margin: 30px 0 20px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Terms & Conditions</h3>

<div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <ul style="margin: 0; padding-left: 20px; color: #475569; line-height: 1.8;">
        <li>This offer is contingent upon successful completion of background verification and reference checks.</li>
        <li>You will be subject to a probation period of 3 months from your date of joining.</li>
        <li>You will be entitled to benefits as per company policy, including health insurance, paid leave, and other perks.</li>
        <li>Your employment will be governed by the terms and conditions outlined in the employment contract.</li>
    </ul>
</div>

<div style="background: #fef3c7; padding: 15px 20px; border-left: 4px solid #f59e0b; margin: 25px 0; border-radius: 4px;">
    <p style="margin: 0; color: #92400e; font-size: 14px;">
        <strong>⏰ Action Required:</strong> Please sign and return the duplicate copy of this offer letter by <strong>{{expiry_date}}</strong> to confirm your acceptance.
    </p>
</div>

<div style="background: #ecfdf5; padding: 15px 20px; border-left: 4px solid #10b981; margin: 25px 0; border-radius: 4px;">
    <p style="margin: 0; color: #065f46; font-size: 14px;">
        <strong>🎉 Welcome Aboard!</strong> We are excited to have you join our team and look forward to a long and mutually beneficial association.
    </p>
</div>

<p style="margin-top: 30px; color: #475569;">If you have any questions regarding this offer, please feel free to contact our HR department.</p>

<p style="margin-top: 30px; color: #475569;">We look forward to welcoming you to <strong>{{company_name}}</strong>!</p>`;

async function createOrUpdateOfferTemplate() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if Offer template exists
        let template = await LetterTemplate.findOne({ type: 'Offer' });

        if (template) {
            // Update existing template
            template.bodyContent = offerTemplateContent;
            template.variables = [
                'candidate_name',
                'job_role',
                'company_name',
                'current_date',
                'ctc',
                'joining_date',
                'expiry_date',
                'hr_name'
            ];
            await template.save();
            console.log('✅ Offer Letter template updated successfully!');
        } else {
            // Create new template
            template = await LetterTemplate.create({
                name: 'OFFER LETTER',
                type: 'Offer',
                subject: 'Job Offer - {{job_role}} at {{company_name}}',
                bodyContent: offerTemplateContent,
                variables: [
                    'candidate_name',
                    'job_role',
                    'company_name',
                    'current_date',
                    'ctc',
                    'joining_date',
                    'expiry_date',
                    'hr_name'
                ],
                isActive: true,
                isLocked: false
            });
            console.log('✅ Offer Letter template created successfully!');
        }

        console.log('Template Name:', template.name);
        console.log('Template Type:', template.type);
        console.log('\n📋 The template includes:');
        console.log('  - Professional offer letter format');
        console.log('  - Highlighted CTC (green)');
        console.log('  - Terms & Conditions section');
        console.log('  - Action required box (yellow)');
        console.log('  - Welcome message box (green)');
        console.log('  - Clean table layout');

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createOrUpdateOfferTemplate();
