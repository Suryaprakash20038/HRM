const mongoose = require('mongoose');
require('dotenv').config();

const LetterTemplate = require('./src/models/Recruitment/LetterTemplate');

const enhancedOfferTemplateContent = `
<div style="margin-bottom: 25px;">
    <p style="margin: 5px 0; color: #64748b; font-size: 13px;">Date: {{current_date}}</p>
    <p style="margin: 5px 0; color: #64748b; font-size: 13px;">Ref: OFFER/{{current_date}}/{{candidate_name}}</p>
</div>

<p style="margin-bottom: 20px; font-size: 15px; line-height: 1.6;">Dear <strong style="color: #1e40af;">{{candidate_name}}</strong>,</p>

<p style="margin-bottom: 20px; font-size: 14px; line-height: 1.8; color: #334155;">
    We are delighted to extend an offer of employment to you for the position of 
    <strong style="color: #1e40af;">{{job_role}}</strong> at <strong>{{company_name}}</strong>.
</p>

<p style="margin-bottom: 25px; font-size: 14px; line-height: 1.8; color: #334155;">
    After careful consideration of your qualifications, experience, and performance during the interview process, 
    we believe you will be a valuable addition to our team.
</p>

<!-- Offer Details Section -->
<div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 15px 20px; border-radius: 8px 8px 0 0; margin-top: 30px;">
    <h3 style="color: white; margin: 0; font-size: 18px; font-weight: 600;">
        📋 Offer Details
    </h3>
</div>

<table style="width: 100%; border-collapse: collapse; margin: 0 0 30px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-radius: 0 0 8px 8px; overflow: hidden;">
    <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 16px 20px; font-weight: 600; color: #475569; width: 200px; font-size: 14px;">Position</td>
        <td style="padding: 16px 20px; color: #0f172a; font-weight: 500; font-size: 14px;">{{job_role}}</td>
    </tr>
    <tr style="background: #ecfdf5; border-bottom: 1px solid #d1fae5;">
        <td style="padding: 18px 20px; font-weight: 600; color: #065f46; font-size: 14px;">
            💰 Annual CTC
        </td>
        <td style="padding: 18px 20px; color: #065f46; font-weight: 700; font-size: 18px;">
            ₹ {{ctc}}
        </td>
    </tr>
    <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 16px 20px; font-weight: 600; color: #475569; font-size: 14px;">Joining Date</td>
        <td style="padding: 16px 20px; color: #0f172a; font-weight: 500; font-size: 14px;">{{joining_date}}</td>
    </tr>
    <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 16px 20px; font-weight: 600; color: #475569; font-size: 14px;">Offer Valid Until</td>
        <td style="padding: 16px 20px; color: #0f172a; font-weight: 500; font-size: 14px;">{{expiry_date}}</td>
    </tr>
    <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 16px 20px; font-weight: 600; color: #475569; font-size: 14px;">Employment Type</td>
        <td style="padding: 16px 20px; color: #0f172a; font-weight: 500; font-size: 14px;">Full-time</td>
    </tr>
    <tr style="background: #f8fafc;">
        <td style="padding: 16px 20px; font-weight: 600; color: #475569; font-size: 14px;">Work Location</td>
        <td style="padding: 16px 20px; color: #0f172a; font-weight: 500; font-size: 14px;">{{company_name}} Office</td>
    </tr>
</table>

<!-- Terms & Conditions -->
<div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 15px 20px; border-radius: 8px 8px 0 0; margin-top: 30px;">
    <h3 style="color: white; margin: 0; font-size: 18px; font-weight: 600;">
        📜 Terms & Conditions
    </h3>
</div>

<div style="background: #f8fafc; padding: 25px; border-radius: 0 0 8px 8px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <ul style="margin: 0; padding-left: 25px; color: #475569; line-height: 2; font-size: 14px;">
        <li style="margin-bottom: 12px;">This offer is contingent upon successful completion of background verification and reference checks.</li>
        <li style="margin-bottom: 12px;">You will be subject to a probation period of <strong>3 months</strong> from your date of joining.</li>
        <li style="margin-bottom: 12px;">You will be entitled to benefits as per company policy, including health insurance, paid leave, and other perks.</li>
        <li style="margin-bottom: 0;">Your employment will be governed by the terms and conditions outlined in the employment contract.</li>
    </ul>
</div>

<!-- Action Required Box -->
<div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 18px 22px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #d97706; box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);">
    <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.8;">
        <strong style="font-size: 15px;">⏰ Action Required:</strong><br/>
        Please sign and return the duplicate copy of this offer letter by <strong>{{expiry_date}}</strong> to confirm your acceptance.
    </p>
</div>

<!-- Welcome Box -->
<div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 18px 22px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #047857; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
    <p style="margin: 0; color: white; font-size: 14px; line-height: 1.8;">
        <strong style="font-size: 15px;">🎉 Welcome Aboard!</strong><br/>
        We are excited to have you join our team and look forward to a long and mutually beneficial association.
    </p>
</div>

<p style="margin-top: 30px; color: #475569; font-size: 14px; line-height: 1.8;">
    If you have any questions regarding this offer, please feel free to contact our HR department.
</p>

<p style="margin-top: 20px; color: #334155; font-size: 14px; line-height: 1.8;">
    We look forward to welcoming you to <strong style="color: #1e40af;">{{company_name}}</strong>!
</p>
`;

async function createEnhancedOfferTemplate() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if enhanced offer template exists
        let template = await LetterTemplate.findOne({
            name: 'ENHANCED OFFER LETTER',
            type: 'Offer'
        });

        if (template) {
            // Update existing template
            template.bodyContent = enhancedOfferTemplateContent;
            template.subject = 'Job Offer - {{job_role}} at {{company_name}}';
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
            console.log('✅ Enhanced Offer Letter template updated successfully!');
        } else {
            // Create new template
            template = await LetterTemplate.create({
                name: 'ENHANCED OFFER LETTER',
                type: 'Offer',
                subject: 'Job Offer - {{job_role}} at {{company_name}}',
                bodyContent: enhancedOfferTemplateContent,
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
            console.log('✅ Enhanced Offer Letter template created successfully!');
        }

        console.log('\n📋 Template Details:');
        console.log('Name:', template.name);
        console.log('Type:', template.type);
        console.log('\n🎨 Design Features:');
        console.log('  ✅ Royal Blue gradient headers');
        console.log('  ✅ Green CTC highlight box');
        console.log('  ✅ Yellow action required box');
        console.log('  ✅ Green welcome box');
        console.log('  ✅ Professional table with alternating colors');
        console.log('  ✅ Icons (💰, ⏰, 🎉, 📋, 📜)');
        console.log('  ✅ Clean white background');
        console.log('  ✅ Box shadows and rounded corners');

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createEnhancedOfferTemplate();
