const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const CompanyBranding = require('../models/Recruitment/CompanyBranding');

// ... [Keep existing helper functions createTransporter, etc.] ...

// Helper to get branding
const getBrandingData = async () => {
    try {
        const branding = await CompanyBranding.getBranding();
        return branding;
    } catch (e) {
        return { companyName: 'HRM Solutions', logo: null };
    }
};

// ... [Keep sendEmail, sendWelcomeEmail, sendLeaveApprovalEmail, sendPayrollNotification, sendProjectAssignmentEmail, sendResignationNotification] ...


// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    });
};

// Verify connection configuration
const verifyConnection = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('✅ Email Service: SMTP connection verified successfully');
        logger.info('Email Service: SMTP connection verified successfully');
        return true;
    } catch (error) {
        console.error('❌ Email Service: SMTP connection failed');
        console.error(`   Error: ${error.message}`);

        if (error.message.includes('535')) {
            console.error(`
            ================================================================================================
            [CRITICAL AUTHENTICATION ERROR]
            Gmail blocked the sign-in attempt. 
            User: ${process.env.SMTP_USER}

            ACTION REQUIRED:
            1. Login to ${process.env.SMTP_USER || 'mmikasa758@gmail.com'}
            2. Use an App Password (16 characters), NOT your login password.
            3. Update .env file with the App Password.
            ================================================================================================
            `);
        }
        return false;
    }
};

// Send email
const sendEmail = async ({ to, subject, html, text }) => {
    try {
        console.log(`[EMAIL SERVICE] Attempting to send email to: ${to} | Subject: ${subject}`);
        logger.info(`Attempting to send email to: ${to}`);

        // Log config presence (do not log actual passwords)
        logger.info(`SMTP Config: Host=${process.env.SMTP_HOST}, Port=${process.env.SMTP_PORT}, User=${process.env.SMTP_USER}, Pass=${process.env.SMTP_PASSWORD ? 'Set' : 'Missing'}`);

        const transporter = createTransporter();

        // Prioritize SMTP_USER as the sender to match authentication, or specific fallback
        let fromAddress = process.env.SMTP_USER || 'mmikasa758@gmail.com';

        // Only use EMAIL_FROM if it is explicitly set and DIFFERENT from noreply (unless you really want noreply)
        // In this case, we want the admin email.
        if (process.env.EMAIL_FROM && !process.env.EMAIL_FROM.includes('noreply')) {
            fromAddress = process.env.EMAIL_FROM;
        }

        const mailOptions = {
            from: fromAddress,
            to,
            subject,
            html,
            text
        };

        console.log(`[EMAIL SERVICE] Sending email FROM: ${fromAddress} TO: ${to}`);

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL SERVICE] Email sent successfully: ${info.messageId}`);
        logger.info(`Email sent successfully: ${info.messageId}`);
        return info;

    } catch (error) {
        console.error(`[EMAIL SERVICE] Email sending failed: ${error.message}`);
        logger.error(`Email sending failed. Error: ${error.message}`);
        logger.error(`Full error stack: ${error.stack}`);

        if (error.message && (error.message.includes('535') || error.message.includes('Username and Password not accepted'))) {
            const errorMsg = `
            ================================================================================================
            [CRITICAL AUTHENTICATION ERROR]
            Gmail blocked the sign-in attempt for user: ${process.env.SMTP_USER}
            
            Rules for Gmail SMTP:
            1. You MUST use an App Password, not your regular Gmail password.
            2. To generate an App Password: 
               Go to Google Account -> Security -> 2-Step Verification (Must be ON) -> App passwords.
            3. Update your .env file:
               SMTP_USER=${process.env.SMTP_USER || 'mmikasa758@gmail.com'}
               SMTP_PASSWORD=<your-16-char-app-password>
            ================================================================================================
            `;
            console.error(errorMsg);
            logger.error(errorMsg);
        }

        // Do not throw error to prevent crashing main flows
        return null;
    }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
    const html = `
    <h1>Welcome to HRM System</h1>
    <p>Hello ${user.firstName} ${user.lastName},</p>
    <p>Your account has been created successfully.</p>
    <p>Email: ${user.email}</p>
    <p>Role: ${user.role}</p>
    <br>
    <p>Best regards,<br>HRM Team</p>
  `;

    return sendEmail({
        to: user.email,
        subject: 'Welcome to HRM System',
        html,
        text: `Welcome ${user.firstName}! Your account has been created.`
    });
};

// Send leave approval email
const sendLeaveApprovalEmail = async (leave, employee) => {
    let statusText = leave.status;
    // If status is Pending but stage moved to Manager/HR, implies intermediate approval
    if (leave.status === 'Pending') {
        if (leave.currentStage === 'Manager') {
            statusText = 'Approved by Team Lead';
        } else if (leave.currentStage === 'HR') {
            statusText = 'Approved by Manager';
        }
    } else if (leave.status === 'Approved') {
        statusText = 'Fully Approved';
    }

    const html = `
    <h1>Leave Request Update</h1>
    <p>Hello ${employee.firstName},</p>
    <p>Your leave request status: <strong>${statusText}</strong>.</p>
    <p>Leave Type: ${leave.leaveType}</p>
    <p>From: ${new Date(leave.startDate).toDateString()}</p>
    <p>To: ${new Date(leave.endDate).toDateString()}</p>
    <p>Total Days: ${leave.totalDays}</p>
    ${leave.rejectionReason ? `<p>Reason: ${leave.rejectionReason}</p>` : ''}
    <br>
    <p>Best regards,<br>HRM Team</p>
  `;

    return sendEmail({
        to: employee.email,
        subject: `Leave Request Update: ${statusText}`,
        html,
        text: `Your leave request status is: ${statusText}.`
    });
};

// Send payroll notification
const sendPayrollNotification = async (payroll, employee) => {
    const html = `
    <h1>Salary Slip - ${payroll.month}/${payroll.year}</h1>
    <p>Hello ${employee.firstName},</p>
    <p>Your salary for ${payroll.month}/${payroll.year} has been processed.</p>
    <p>Basic Salary: $${payroll.basicSalary}</p>
    <p>Allowances: $${payroll.allowances}</p>
    <p>Deductions: $${payroll.deductions}</p>
    <p>Net Salary: $${payroll.netSalary}</p>
    <br>
    <p>Best regards,<br>HRM Team</p>
  `;

    return sendEmail({
        to: employee.email,
        subject: `Salary Slip - ${payroll.month}/${payroll.year}`,
        html,
        text: `Your salary for ${payroll.month}/${payroll.year} has been processed.`
    });
};

// Send project assignment email
const sendProjectAssignmentEmail = async (project, employee, role) => {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .project-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #eee; }
            .info-label { font-weight: bold; width: 150px; color: #667eea; }
            .info-value { flex: 1; }
            .role-badge { display: inline-block; padding: 5px 15px; background: #667eea; color: white; border-radius: 20px; font-size: 14px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0;">🎯 New Project Assignment</h1>
            </div>
            <div class="content">
                <p>Hello ${employee.firstName} ${employee.lastName},</p>
                <p>You have been assigned to a new project!</p>
                
                <div class="role-badge">Your Role: ${role}</div>
                
                <div class="project-info">
                    <h2 style="color: #667eea; margin-top: 0;">${project.projectName}</h2>
                    
                    <div class="info-row">
                        <div class="info-label">Department:</div>
                        <div class="info-value">${project.department}</div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Manager:</div>
                        <div class="info-value">${project.manager.firstName} ${project.manager.lastName}</div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Team Lead:</div>
                        <div class="info-value">${project.teamLead.firstName} ${project.teamLead.lastName}</div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Start Date:</div>
                        <div class="info-value">${formatDate(project.startDate)}</div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Deadline:</div>
                        <div class="info-value">${formatDate(project.deadline)}</div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Status:</div>
                        <div class="info-value">${project.status}</div>
                    </div>
                    
                    ${project.description ? `
                    <div class="info-row">
                        <div class="info-label">Description:</div>
                        <div class="info-value">${project.description}</div>
                    </div>
                    ` : ''}
                </div>
                
                <p>Please log in to the HRM system to view complete project details and start working on your assigned tasks.</p>
                
                <div class="footer">
                    <p>Best regards,<br><strong>HRM Team</strong></p>
                    <p style="margin-top: 20px;">This is an automated email. Please do not reply.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;

    const text = `
Hello ${employee.firstName} ${employee.lastName},

You have been assigned to a new project!

Your Role: ${role}

Project Details:
- Project Name: ${project.projectName}
- Department: ${project.department}
- Manager: ${project.manager.firstName} ${project.manager.lastName}
- Team Lead: ${project.teamLead.firstName} ${project.teamLead.lastName}
- Start Date: ${formatDate(project.startDate)}
- Deadline: ${formatDate(project.deadline)}
- Status: ${project.status}
${project.description ? `- Description: ${project.description}` : ''}

Please log in to the HRM system to view complete project details.

Best regards,
HRM Team
  `;

    return sendEmail({
        to: employee.email,
        subject: `New Project Assignment: ${project.projectName}`,
        html,
        text
    });
};

// Send resignation notification
const sendResignationNotification = async ({ type, employee, manager, data }) => {
    let subject = '';
    let html = '';
    let text = '';
    let to = '';

    const formatDate = (date) => new Date(date).toLocaleDateString();

    switch (type) {
        case 'RESIGNATION_SUBMITTED':
            // To Manager
            to = manager ? manager.email : process.env.HR_EMAIL; // Fallback to HR if no manager
            subject = `Action Required: Resignation Request - ${employee.firstName} ${employee.lastName}`;
            html = `
                <h1>Resignation Request</h1>
                <p>Hello ${manager ? manager.firstName : 'HR Check'},</p>
                <p><strong>${employee.firstName} ${employee.lastName}</strong> has submitted a resignation request.</p>
                <p><strong>Reason:</strong> ${data.reason}</p>
                <p><strong>Requested LWD:</strong> ${formatDate(data.requestedLWD)}</p>
                <p>Please log in to the system to approve or reject this request.</p>
            `;
            break;

        case 'RESIGNATION_APPROVED':
            // To HR (from Manager)
            // Ideally finding all HR emails, but passing a specific "hrEmail" to this func
            to = data.hrEmail || process.env.HR_EMAIL;
            subject = `Manager Approved: Resignation - ${employee.firstName} ${employee.lastName}`;
            html = `
                <h1>Resignation Approved by Manager</h1>
                <p>Hello HR Team,</p>
                <p>Manager has approved the resignation request for <strong>${employee.firstName} ${employee.lastName}</strong>.</p>
                <p><strong>Manager Action Date:</strong> ${formatDate(new Date())}</p>
                <p>Please review and set the final Notice Period.</p>
            `;
            break;

        case 'RESIGNATION_REJECTED':
            // To Employee
            to = employee.userId && employee.userId.email ? employee.userId.email : employee.email;
            subject = `Resignation Request Rejected`;
            html = `
                <h1>Resignation Update</h1>
                <p>Hello ${employee.firstName},</p>
                <p>Your resignation request has been <strong>REJECTED</strong> by your manager.</p>
                <p><strong>Reason:</strong> ${data.rejectionReason}</p>
                <p>Please contact your manager for further discussion.</p>
            `;
            break;

        case 'RESIGNATION_FINALIZED':
            // To Employee
            to = employee.userId && employee.userId.email ? employee.userId.email : employee.email;
            subject = `Resignation Accepted - Exit Process Started`;
            html = `
                <h1>Resignation Accepted</h1>
                <p>Hello ${employee.firstName},</p>
                <p>Your resignation has been formally accepted by HR.</p>
                <p><strong>Notice Period:</strong> ${data.noticeDays} days</p>
                <p><strong>Final Last Working Day:</strong> ${formatDate(data.finalLWD)}</p>
                <p>The exit process has been initiated.</p>
            `;
            break;

        case 'EMPLOYEE_RELIEVED':
            // To Employee
            to = employee.userId && employee.userId.email ? employee.userId.email : employee.email;
            subject = `Relieving Letter - ${employee.firstName} ${employee.lastName}`;
            html = `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1>Relieving Letter</h1>
                    </div>
                    <p>Date: ${formatDate(new Date())}</p>
                    <p>To,</p>
                    <p><strong>${employee.firstName} ${employee.lastName}</strong></p>
                    <br>
                    <p><strong>Subject: Relieving Letter</strong></p>
                    <br>
                    <p>Dear ${employee.firstName},</p>
                    <p>This has reference to your resignation dated <strong>${formatDate(data.resignationDate)}</strong>.</p>
                    <p>We would like to inform you that your resignation has been accepted and you are relieved from your duties and responsibilities with effect from the closing working hours of today, <strong>${formatDate(new Date())}</strong>.</p>
                    <p>We certify that you have cleared all dues and handed over all company assets and charges entrusted to you.</p>
                    <p>We wish you all the best in your future endeavors.</p>
                    <br>
                    <p>Sincerely,</p>
                    <p><strong>HR Department</strong></p>
                    <p>HRM System</p>
                </div>
            `;
            break;
    }

    if (to) {
        return sendEmail({ to, subject, html, text: html.replace(/<[^>]*>?/gm, '') });
    }
};

// Send candidate status email (Updated with Branding)
const sendCandidateStatusEmail = async (candidate) => {
    const branding = await getBrandingData();
    const { name, email, appliedFor, status } = candidate;

    let subject = "";
    let messageBody = "";
    let color = "#0f172a"; // Default Slate Dark
    let icon = "📋";

    const companyName = branding.companyName || 'Our Company';

    switch (status) {
        case 'New':
            subject = `Application Received - ${appliedFor} | ${companyName}`;
            icon = "👋";
            messageBody = `
                <p>Thank you for applying for the position of <strong>${appliedFor}</strong> at <strong>${companyName}</strong>.</p>
                <p>We have received your application. Our recruitment team will review your profile and contact you shortly.</p>
            `;
            break;
        case 'Screening':
            subject = `Application Update: Screening - ${appliedFor}`;
            icon = "🔍";
            messageBody = `
                <p>We are pleased to inform you that your profile for <strong>${appliedFor}</strong> has moved to the <strong>Screening Phase</strong>.</p>
                <p>Our team is currently evaluating your qualifications and experience.</p>
            `;
            break;
        case 'Interviewing':
            subject = `Interview Invitation - ${appliedFor}`;
            color = "#f59e0b"; // Amber
            icon = "📅";
            messageBody = `
                <p><strong>Congratulations!</strong> Your profile has been shortlisted for an interview.</p>
                <p>We would like to invite you for a discussion regarding the <strong>${appliedFor}</strong> role.</p>
            `;
            break;
        case 'Selected':
            subject = `Congratulations! You are Selected - ${appliedFor}`;
            color = "#10b981"; // Green
            icon = "🎉";
            messageBody = `
                <p><strong>Great News!</strong></p>
                <p>We are delighted to inform you that you have been <strong>selected</strong> for the position of <strong>${appliedFor}</strong>.</p>
                <p>Our HR team will be sending you the official offer letter and onboarding details soon.</p>
            `;
            break;
        case 'Rejected':
            subject = `Update on your application - ${appliedFor}`;
            color = "#ef4444"; // Red
            icon = "💼";
            messageBody = `
                <p>Thank you for your interest in the <strong>${appliedFor}</strong> position.</p>
                <p>After careful consideration, we regret to inform you that we will not be proceeding with your application at this time.</p>
            `;
            break;
        default:
            subject = `Application Status Update - ${appliedFor}`;
            messageBody = `<p>Your application status has been updated to: <strong>${status}</strong>.</p>`;
    }

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7f6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 30px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            .header { background-color: ${color}; padding: 30px; text-align: center; color: white; }
            .content { padding: 40px 30px; }
            .status-badge { display: inline-block; padding: 6px 12px; background-color: ${color}15; color: ${color}; border-radius: 20px; font-weight: bold; font-size: 14px; margin-bottom: 20px; border: 1px solid ${color}30; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                 <div style="font-size: 40px; margin-bottom: 10px;">${icon}</div>
                 <h1 style="margin:0; font-size: 24px;">Application Update</h1>
                 <p style="margin:5px 0 0 0; opacity: 0.9;">${companyName}</p>
            </div>
            <div class="content">
                <p>Hello <strong>${name}</strong>,</p>
                <div style="text-align: center; margin: 25px 0;">
                    <span class="status-badge">${status.toUpperCase()}</span>
                </div>
                ${messageBody}
                <br>
                <p>Best Regards,<br><strong>Recruitment Team</strong><br>${companyName}</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return sendEmail({
        to: email,
        subject,
        html,
        text: messageBody.replace(/<[^>]*>?/gm, '')
    });
};

// Send Letter Email (Dynamic based on template type)
const sendOfferLetterEmail = async (candidate, offerDetails, pdfBuffer, templateType = 'Offer') => {
    const branding = await getBrandingData();
    const companyName = branding.companyName || 'HRM Solutions Inc.';

    // Dynamic content based on template type
    let emailContent = {};

    switch (templateType) {
        case 'Interview Call':
            emailContent = {
                subject: `Interview Invitation - ${offerDetails.role} at ${companyName}`,
                greeting: `We are pleased to invite you for an interview for the position of <strong>${offerDetails.role}</strong> at <strong>${companyName}</strong>.`,
                documentName: 'Interview Call Letter',
                documentDescription: 'This document contains your interview details including date, time, and location/meeting link.',
                actionRequired: 'Please ensure you are available at the scheduled time.',
                closingMessage: 'We look forward to meeting you and learning more about your qualifications.',
                filename: `${companyName.replace(/ /g, '_')}_Interview_Call_${candidate.name.replace(/ /g, '_')}.pdf`
            };
            break;

        case 'Next Round':
            emailContent = {
                subject: `Next Round Interview - ${offerDetails.role} at ${companyName}`,
                greeting: `Congratulations! You have successfully cleared the previous round. We are pleased to invite you for the next round of interview for the position of <strong>${offerDetails.role}</strong> at <strong>${companyName}</strong>.`,
                documentName: 'Next Round Interview Letter',
                documentDescription: 'This document contains your next round interview details including date, time, and location/meeting link.',
                actionRequired: 'Please prepare well and ensure you are available at the scheduled time.',
                closingMessage: 'We were impressed by your performance and look forward to the next round.',
                filename: `${companyName.replace(/ /g, '_')}_Next_Round_${candidate.name.replace(/ /g, '_')}.pdf`
            };
            break;

        case 'Offer':
            emailContent = {
                subject: `Job Offer - ${offerDetails.role} at ${companyName}`,
                greeting: `Congratulations! We are delighted to offer you the position of <strong>${offerDetails.role}</strong> at <strong>${companyName}</strong>!`,
                documentName: 'Offer Letter / Appointment Order',
                documentDescription: 'This document contains important details regarding your compensation, joining date, and terms of employment.',
                actionRequired: `Please sign and return the duplicate copy by ${offerDetails.expiryDate || 'the specified date'}.`,
                closingMessage: 'We were impressed by your background and skills, and we are excited to have you join our team.',
                filename: `${companyName.replace(/ /g, '_')}_Offer_Letter_${candidate.name.replace(/ /g, '_')}.pdf`
            };
            break;

        case 'Rejection':
            emailContent = {
                subject: `Application Status - ${offerDetails.role} at ${companyName}`,
                greeting: `Thank you for your interest in the <strong>${offerDetails.role}</strong> position at <strong>${companyName}</strong> and for taking the time to interview with us.`,
                documentName: 'Application Status Letter',
                documentDescription: 'This document contains the status of your application.',
                actionRequired: 'We encourage you to apply for future openings that match your profile.',
                closingMessage: 'We appreciate your interest in our company and wish you all the best in your job search.',
                filename: `${companyName.replace(/ /g, '_')}_Application_Status_${candidate.name.replace(/ /g, '_')}.pdf`
            };
            break;

        case 'Promotion':
            emailContent = {
                subject: `Promotion Letter - ${offerDetails.role} at ${companyName}`,
                greeting: `Congratulations! We are thrilled to inform you of your promotion to <strong>${offerDetails.role}</strong> at <strong>${companyName}</strong>.`,
                documentName: 'Promotion Letter',
                documentDescription: 'This document outlines the details of your new role and compensation structure.',
                actionRequired: 'Please review the details and sign the copy if required.',
                closingMessage: 'We appreciate your hard work and dedication, and we look forward to your continued success.',
                filename: `${companyName.replace(/ /g, '_')}_Promotion_Letter_${candidate.name.replace(/ /g, '_')}.pdf`
            };
            break;

        case 'Experience':
            emailContent = {
                subject: `Experience Certificate - ${candidate.name}`,
                greeting: `Please find attached your Experience Certificate from <strong>${companyName}</strong>.`,
                documentName: 'Experience Certificate',
                documentDescription: 'This document certifies your employment history and role with our organization.',
                actionRequired: 'Please keep this document for your records.',
                closingMessage: 'We thank you for your contributions and wish you all the best in your future endeavors.',
                filename: `${companyName.replace(/ /g, '_')}_Experience_Certificate_${candidate.name.replace(/ /g, '_')}.pdf`
            };
            break;

        case 'Relieving':
            emailContent = {
                subject: `Relieving Letter - ${candidate.name}`,
                greeting: `Please find attached your Relieving Letter from <strong>${companyName}</strong>.`,
                documentName: 'Relieving Letter',
                documentDescription: 'This document acts as formal proof of your relieving from duties.',
                actionRequired: 'Please ensure all company assets have been returned.',
                closingMessage: 'We wish you success in your future career path.',
                filename: `${companyName.replace(/ /g, '_')}_Relieving_Letter_${candidate.name.replace(/ /g, '_')}.pdf`
            };
            break;

        default:
            emailContent = {
                subject: `Letter from ${companyName}`,
                greeting: `We are writing to you regarding the position of <strong>${offerDetails.role}</strong> at <strong>${companyName}</strong>.`,
                documentName: 'Letter',
                documentDescription: 'Please find the attached document for your reference.',
                actionRequired: 'Please review the document carefully.',
                closingMessage: 'If you have any questions, please feel free to reply to this email.',
                filename: `${companyName.replace(/ /g, '_')}_Letter_${candidate.name.replace(/ /g, '_')}.pdf`
            };
    }

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
             body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #374151; background-color: #f3f4f6; margin: 0; padding: 0; }
             .email-wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
             .email-card { background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden; }
             .email-header { background: #1e293b; padding: 30px; text-align: center; color: white; }
             .email-body { padding: 40px 30px; }
             .btn { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
             .email-footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="email-card">
                <div class="email-header">
                    ${branding.logo && branding.logo.url ? `<img src="${branding.logo.url}" style="max-height: 60px; background: white; padding: 5px; border-radius: 4px;">` : `<h1 style="margin:0;">${companyName}</h1>`}
                </div>
                <div class="email-body">
                    <p style="font-size: 18px; margin-top: 0;">Dear <strong>${candidate.name}</strong>,</p>
                    
                    <p>${emailContent.greeting}</p>
                    
                    <p>Please find attached your official <strong>${emailContent.documentName}</strong>. ${emailContent.documentDescription}</p>
                    
                    <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 14px; color: #64748b;">Action Required:</p>
                        <p style="margin: 5px 0 0 0; font-weight: 600;">${emailContent.actionRequired}</p>
                    </div>

                    <p>${emailContent.closingMessage}</p>
                    
                    <p>If you have any questions, please feel free to reply to this email.</p>
                    
                    <br>
                    <p>Best regards,</p>
                    <p><strong>HR Team</strong><br>${companyName}</p>
                </div>
            </div>
            <div class="email-footer">
                <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: process.env.SMTP_USER || 'mmikasa758@gmail.com',
        to: candidate.email,
        subject: emailContent.subject,
        html: html,
        attachments: [
            {
                filename: emailContent.filename,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }
        ]
    };

    try {
        const transporter = createTransporter();
        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL SERVICE] ${templateType} sent to ${candidate.email}: ${info.messageId}`);
        logger.info(`${templateType} sent to ${candidate.email}: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`[EMAIL SERVICE] Failed to send ${templateType}: ${error.message}`);
        logger.error(`Failed to send ${templateType}: ${error.message}`);
        throw error;
    }
};

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendLeaveApprovalEmail,
    sendPayrollNotification,
    sendProjectAssignmentEmail,
    sendResignationNotification,
    sendCandidateStatusEmail,
    verifyConnection,
    sendOfferLetterEmail
};
