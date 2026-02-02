const mongoose = require('mongoose');
require('dotenv').config();

const LetterTemplate = require('./src/models/Recruitment/LetterTemplate');

// --- COLORS & STYLES GENERATOR ---
const getStyles = (theme) => {
    const themes = {
        blue: { primary: '#2563eb', secondary: '#1e40af', bg: '#eff6ff' },
        green: { primary: '#059669', secondary: '#065f46', bg: '#ecfdf5' },
        red: { primary: '#dc2626', secondary: '#991b1b', bg: '#fef2f2' },
        purple: { primary: '#7c3aed', secondary: '#5b21b6', bg: '#f5f3ff' },
        gray: { primary: '#374151', secondary: '#111827', bg: '#f9fafb' },
        orange: { primary: '#ea580c', secondary: '#9a3412', bg: '#fff7ed' }
    };
    const t = themes[theme] || themes.blue;

    return `
        font-family: 'Segoe UI', Tahoma, sans-serif;
        color: #333;
        line-height: 1.6;
        padding: 40px;
        background: #fff;
        max-width: 800px;
        margin: 0 auto;
        border: 1px solid #ddd;
    `;
};

const getHeader = (title, theme) => {
    const themes = {
        blue: '#2563eb', green: '#059669', red: '#dc2626',
        purple: '#7c3aed', gray: '#374151', orange: '#ea580c'
    };
    const color = themes[theme] || '#2563eb';
    return `
        <div style="border-bottom: 2px solid ${color}; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h1 style="color: ${color}; margin: 0; font-size: 28px; text-transform: uppercase;">${title}</h1>
                <p style="margin: 5px 0 0; color: #666; font-size: 14px;">Official Document</p>
            </div>
            {{#if company_logo}}<img src="{{company_logo}}" style="max-height: 50px;" />{{else}}<h2 style="color: #333; margin:0;">{{company_name}}</h2>{{/if}}
        </div>
    `;
};

const getFooter = (theme) => {
    const themes = {
        blue: '#eff6ff', green: '#ecfdf5', red: '#fef2f2',
        purple: '#f5f3ff', gray: '#f9fafb', orange: '#fff7ed'
    };
    const bg = themes[theme] || '#f9fafb';
    return `
        <div style="margin-top: 50px; padding: 15px; background: ${bg}; text-align: center; font-size: 12px; color: #666; border-radius: 4px;">
            <p style="margin: 0;">{{company_name}} | {{company_address}}</p>
            <p style="margin: 5px 0 0;">Phone: {{company_phone}} | Email: {{company_email}}</p>
        </div>
    `;
};

const templates = [
    // 1. OFFER LETTERS
    {
        name: "Standard Offer Letter (Blue Theme)",
        type: "Offer",
        subject: "Job Offer: {{designation}} at {{company_name}}",
        bodyContent: `
            <div style="${getStyles('blue')}">
                ${getHeader('Employment Offer', 'blue')}
                <p>Date: {{current_date}}</p>
                <p>Dear <strong>{{candidate_name}}</strong>,</p>
                <p>We are pleased to offer you the position of <strong>{{designation}}</strong> at <strong>{{company_name}}</strong>.</p>
                <p>We were impressed by your skills and experience, and we believe you will be a valuable asset to our team.</p>
                
                <div style="background: #eff6ff; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #2563eb;">
                    <p style="margin: 5px 0;"><strong>Position:</strong> {{designation}}</p>
                    <p style="margin: 5px 0;"><strong>Annual CTC:</strong> {{ctc}}</p>
                    <p style="margin: 5px 0;"><strong>Start Date:</strong> {{joining_date}}</p>
                </div>

                <p>Please review the attached terms and conditions. We look forward to welcoming you aboard.</p>
                
                <div style="margin-top: 40px;">
                    <p>Sincerely,</p>
                    {{#if company_signature}}<img src="{{company_signature}}" style="height: 50px;" />{{/if}}
                    <p><strong>{{hr_name}}</strong><br>HR Manager</p>
                </div>
                ${getFooter('blue')}
            </div>
        `
    },
    {
        name: "Executive Offer Letter (Gray Theme)",
        type: "Offer",
        subject: "Executive Offer: {{designation}}",
        bodyContent: `
            <div style="${getStyles('gray')}">
                ${getHeader('Executive Offer', 'gray')}
                <p>Date: {{current_date}}</p>
                <p>Dear {{candidate_name}},</p>
                <p>It is my distinct pleasure to offer you the role of <strong>{{designation}}</strong> with <strong>{{company_name}}</strong>.</p>
                <p>Your leadership and expertise are exactly what we need to drive our company forward.</p>

                <table style="width: 100%; margin: 30px 0; border-collapse: collapse;">
                    <tr style="background: #f9fafb;"><td style="padding: 10px; font-weight: bold;">Role</td><td style="padding: 10px;">{{designation}}</td></tr>
                    <tr><td style="padding: 10px; font-weight: bold;">Compensation</td><td style="padding: 10px;">{{ctc}} per annum</td></tr>
                    <tr style="background: #f9fafb;"><td style="padding: 10px; font-weight: bold;">Join Date</td><td style="padding: 10px;">{{joining_date}}</td></tr>
                </table>

                <p>We are excited about the possibility of you joining our leadership team.</p>

                <div style="margin-top: 50px;">
                    <p>Best Regards,</p>
                    {{#if company_signature}}<img src="{{company_signature}}" style="height: 50px;" />{{/if}}
                    <p><strong>{{hr_name}}</strong></p>
                </div>
                ${getFooter('gray')}
            </div>
        `
    },

    // 2. APPOINTMENT LETTERS
    {
        name: "Formal Appointment (Green Theme)",
        type: "Appointment",
        subject: "Letter of Appointment - {{designation}}",
        bodyContent: `
            <div style="${getStyles('green')}">
                ${getHeader('Appointment Letter', 'green')}
                <p>Date: {{current_date}}</p>
                <p>Dear {{candidate_name}},</p>
                <p>Further to your acceptance of our offer, we are pleased to confirm your appointment as <strong>{{designation}}</strong> with effect from <strong>{{joining_date}}</strong>.</p>
                
                <h3 style="color: #059669; border-bottom: 1px solid #eee; padding-bottom: 5px;">Terms of Employment</h3>
                <ul style="line-height: 1.8; color: #444;">
                    <li><strong>Probation:</strong> You will be on probation for a period of 6 months.</li>
                    <li><strong>Reporting:</strong> You will report to the Department Head.</li>
                    <li><strong>Compensation:</strong> Your annual CTC will be {{ctc}}.</li>
                </ul>

                <p>Welcome to the family!</p>

                <div style="margin-top: 40px;">
                    <p>Authorized Signatory,</p>
                    {{#if company_signature}}<img src="{{company_signature}}" style="height: 50px;" />{{/if}}
                    <p><strong>{{hr_name}}</strong></p>
                </div>
                ${getFooter('green')}
            </div>
        `
    },
    {
        name: "Modern Appointment (Purple Theme)",
        type: "Appointment",
        subject: "Appointment Confirmation: {{designation}}",
        bodyContent: `
            <div style="${getStyles('purple')}">
                ${getHeader('Appointment Confirmation', 'purple')}
                <p>Date: {{current_date}}</p>
                <div style="background: #f5f3ff; color: #5b21b6; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                    <h2 style="margin:0;">Welcome Aboard, {{candidate_name}}!</h2>
                </div>
                <p>We are delighted to confirm your appointment as <strong>{{designation}}</strong> effective <strong>{{joining_date}}</strong>.</p>
                
                <p>Your journey with <strong>{{company_name}}</strong> begins now. We believe you will achieve great things here.</p>

                <p>Please sign the duplicate copy of this letter as a token of your acceptance.</p>

                <div style="margin-top: 50px;">
                    <p>Warm Regards,</p>
                    {{#if company_signature}}<img src="{{company_signature}}" style="height: 50px;" />{{/if}}
                    <p><strong>{{hr_name}}</strong></p>
                </div>
                ${getFooter('purple')}
            </div>
        `
    },

    // 3. REJECTION LETTERS
    {
        name: "Standard Rejection (Red Theme)",
        type: "Rejection",
        subject: "Update on your application for {{designation}}",
        bodyContent: `
            <div style="${getStyles('red')}">
                ${getHeader('Application Status', 'red')}
                <p>Date: {{current_date}}</p>
                <p>Dear {{candidate_name}},</p>
                <p>Thank you for giving us the opportunity to consider you for the <strong>{{designation}}</strong> position.</p>
                <p>We have reviewed your application and qualifications. While we were impressed with your background, we have decided to proceed with other candidates who more closely match our current requirements.</p>
                
                <p>We will keep your resume on file for future openings that may be a better fit.</p>

                <div style="margin-top: 40px;">
                    <p>Sincerely,</p>
                    {{#if company_signature}}<img src="{{company_signature}}" style="height: 50px;" />{{/if}}
                    <p><strong>{{hr_name}}</strong><br>Recruitment Team</p>
                </div>
                ${getFooter('red')}
            </div>
        `
    },
    {
        name: "Polite Rejection (Orange Theme)",
        type: "Rejection",
        subject: "Regarding your application - {{company_name}}",
        bodyContent: `
            <div style="${getStyles('orange')}">
                ${getHeader('Candidate Update', 'orange')}
                <p>Date: {{current_date}}</p>
                <p>Dear {{candidate_name}},</p>
                <p>We appreciate the time you took to apply for the <strong>{{designation}}</strong> role.</p>
                <p>After careful consideration, we regret to inform you that we will not be moving forward with your candidacy at this time.</p>
                <p>This was a difficult decision, as we received many strong applications including yours.</p>

                <p>We wish you the very best in your job search.</p>

                <div style="margin-top: 40px;">
                    <p>Best Wishes,</p>
                    {{#if company_signature}}<img src="{{company_signature}}" style="height: 50px;" />{{/if}}
                    <p><strong>{{hr_name}}</strong></p>
                </div>
                ${getFooter('orange')}
            </div>
        `
    },

    // 4. RELIEVING LETTERS
    {
        name: "Formal Relieving (Gray Theme)",
        type: "Relieving",
        subject: "Relieving Letter - {{candidate_name}}",
        bodyContent: `
            <div style="${getStyles('gray')}">
                ${getHeader('Relieving Letter', 'gray')}
                <p>Date: {{current_date}}</p>
                <p>To,</p>
                <p><strong>{{candidate_name}}</strong></p>
                <p>Designation: {{designation}}</p>

                <p>Dear {{candidate_name}},</p>
                <p>This is to confirm that your resignation has been accepted. You are relieved from your duties as <strong>{{designation}}</strong> with effect from the closing hours of <strong>{{last_working_day}}</strong>.</p>
                
                <p>We certify that you have no outstanding dues with the company.</p>
                <p>We wish you success in your future endeavors.</p>

                <div style="margin-top: 40px;">
                    <p>For {{company_name}},</p>
                    {{#if company_signature}}<img src="{{company_signature}}" style="height: 50px;" />{{/if}}
                    <p><strong>{{hr_name}}</strong><br>Authorized Signatory</p>
                </div>
                ${getFooter('gray')}
            </div>
        `
    },
    {
        name: "Detailed Relieving (Blue Theme)",
        type: "Relieving",
        subject: "Relieving Order & Experience Note",
        bodyContent: `
            <div style="${getStyles('blue')}">
                ${getHeader('Relieving Order', 'blue')}
                <p>Date: {{current_date}}</p>
                <p>Dear {{candidate_name}},</p>
                <div style="padding: 15px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; margin: 20px 0;">
                    <p style="margin:0;"><strong>Employee Code:</strong> N/A</p>
                    <p style="margin:5px 0 0;"><strong>Designation:</strong> {{designation}}</p>
                    <p style="margin:5px 0 0;"><strong>Relieving Date:</strong> {{last_working_day}}</p>
                </div>
                <p>This letter certifies that you have been relieved of your responsibilities at <strong>{{company_name}}</strong> effective <strong>{{last_working_day}}</strong>.</p>
                <p>We appreciate your contributions during your tenure and wish you the best for your career ahead.</p>

                <div style="margin-top: 40px;">
                    <p>Sincerely,</p>
                    {{#if company_signature}}<img src="{{company_signature}}" style="height: 50px;" />{{/if}}
                    <p><strong>{{hr_name}}</strong></p>
                </div>
                ${getFooter('blue')}
            </div>
        `
    },

    // 5. NEXT ROUND LETTERS
    {
        name: "Next Round Invitation (Purple Theme)",
        type: "Next Round",
        subject: "Invitation to Next Round: {{designation}}",
        bodyContent: `
            <div style="${getStyles('purple')}">
                ${getHeader('Interview Update', 'purple')}
                <p>Date: {{current_date}}</p>
                <p>Dear {{candidate_name}},</p>
                <p>Congratulations! We are pleased to inform you that you have been shortlisted for the next round of interviews for the <strong>{{designation}}</strong> position.</p>
                
                <div style="background: #f5f3ff; border-left: 4px solid #7c3aed; padding: 15px; margin: 20px 0;">
                    <p style="margin:0; font-weight:bold; color: #5b21b6;">Next Steps:</p>
                    <p style="margin:5px 0 0;">Our team will contact you shortly to schedule the {{interview_round}}.</p>
                </div>

                <p>Please be prepared to discuss your technical skills and experience in more detail.</p>

                <div style="margin-top: 40px;">
                    <p>Best Regards,</p>
                    {{#if company_signature}}<img src="{{company_signature}}" style="height: 50px;" />{{/if}}
                    <p><strong>{{hr_name}}</strong></p>
                </div>
                ${getFooter('purple')}
            </div>
        `
    },
    {
        name: "Formal Next Round (Green Theme)",
        type: "Next Round",
        subject: "Shortlisted for Next Round - {{company_name}}",
        bodyContent: `
            <div style="${getStyles('green')}">
                ${getHeader('Selection Update', 'green')}
                <p>Date: {{current_date}}</p>
                <p>Dear {{candidate_name}},</p>
                <p>We are happy to share that you have successfully cleared the initial screening for <strong>{{designation}}</strong>.</p>
                <p>You are hereby invited to participate in the next round of our selection process.</p>
                
                <p><strong>Round Details:</strong> {{interview_round}}</p>
                <p>We look forward to meeting you again.</p>

                <div style="margin-top: 40px;">
                    <p>Regards,</p>
                    {{#if company_signature}}<img src="{{company_signature}}" style="height: 50px;" />{{/if}}
                    <p><strong>{{hr_name}}</strong><br>Talent Acquisition</p>
                </div>
                ${getFooter('green')}
            </div>
        `
    },

    // 6. INTERVIEW CALL LETTERS
    {
        name: "Standard Interview Call (Blue Theme)",
        type: "Interview Call",
        subject: "Interview Invitation for {{designation}}",
        bodyContent: `
            <div style="${getStyles('blue')}">
                ${getHeader('Interview Call', 'blue')}
                <p>Date: {{current_date}}</p>
                <p>Dear {{candidate_name}},</p>
                <p>We have reviewed your application for <strong>{{designation}}</strong> and would like to invite you for an interview.</p>
                
                <div style="background: #eff6ff; padding: 15px; border-radius: 4px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Date:</strong> {{interview_date}}</p>
                    <p style="margin: 5px 0;"><strong>Time:</strong> {{interview_time}}</p>
                    <p style="margin: 5px 0;"><strong>Mode:</strong> {{interview_mode}}</p>
                    <p style="margin: 5px 0;"><strong>Venue/Link:</strong> {{interview_location}}</p>
                </div>

                <p>Please confirm your availability by replying to this email.</p>

                <div style="margin-top: 40px;">
                    <p>Sincerely,</p>
                    {{#if company_signature}}<img src="{{company_signature}}" style="height: 50px;" />{{/if}}
                    <p><strong>{{hr_name}}</strong></p>
                </div>
                ${getFooter('blue')}
            </div>
        `
    },
    {
        name: "Remote Interview Call (Orange Theme)",
        type: "Interview Call",
        subject: "Virtual Interview: {{designation}}",
        bodyContent: `
            <div style="${getStyles('orange')}">
                ${getHeader('Virtual Interview', 'orange')}
                <p>Date: {{current_date}}</p>
                <p>Hi {{candidate_name}},</p>
                <p>We are excited to invite you to a virtual interview for the <strong>{{designation}}</strong> role at {{company_name}}.</p>
                
                <div style="border: 2px dashed #ea580c; padding: 15px; margin: 20px 0; background: #fff7ed;">
                    <h3 style="margin:0 0 10px 0; color: #c2410c;">Meeting Details</h3>
                    <p style="margin: 5px 0;">📅 {{interview_date}}</p>
                    <p style="margin: 5px 0;">⏰ {{interview_time}}</p>
                    <p style="margin: 5px 0;">🔗 {{interview_location}}</p>
                </div>

                <p>Please ensure you have a stable internet connection.</p>

                <div style="margin-top: 40px;">
                    <p>Best,</p>
                    {{#if company_signature}}<img src="{{company_signature}}" style="height: 50px;" />{{/if}}
                    <p><strong>{{hr_name}}</strong></p>
                </div>
                ${getFooter('orange')}
            </div>
        `
    }
];

// --- SEEDING FUNCTION ---
const seedTemplates = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        let createdCount = 0;

        for (const tmpl of templates) {
            const exists = await LetterTemplate.findOne({ name: tmpl.name });
            if (!exists) {
                await LetterTemplate.create(tmpl);
                console.log(`Created: ${tmpl.name}`);
                createdCount++;
            } else {
                console.log(`Skipped (Exists): ${tmpl.name}`);
            }
        }

        console.log(`\nFinished! Created ${createdCount} new templates.`);
        process.exit();
    } catch (err) {
        console.error('Error seeding templates:', err);
        process.exit(1);
    }
};

seedTemplates();
