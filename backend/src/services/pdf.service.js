const path = require('path');
const puppeteer = require('puppeteer');
const fs = require('fs');
const Handlebars = require('handlebars');
const { generateOverlayPDF } = require('./pdfOverlay');
const CompanyBranding = require('../models/Recruitment/CompanyBranding');
const LetterTemplate = require('../models/Recruitment/LetterTemplate');
const letterDesigns = require('../utils/letterDesigns');

// Helper to ensure image URLs are Puppeteer-friendly
const resolveImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    try {
        const absolutePath = path.resolve(url);
        return `file://${absolutePath.replace(/\\/g, '/')}`;
    } catch (e) {
        return url;
    }
};

// Register Handlebars Helpers
Handlebars.registerHelper('eq', function (a, b) {
    return a === b;
});
Handlebars.registerHelper('formatDate', function (dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString();
});

/**
 * Generate Letter PDF with Design Template Support
 * Supports both designId-based fixed templates and custom templates
 * Uses Puppeteer for high-fidelity HTML->PDF rendering
 * @param {string} templateId - Template ID from database
 * @param {object} candidateData - Candidate and letter data
 * @param {string} letterType - Optional letter type for Universal templates (overrides template.type)
 */
const generateLetterPDF = async (templateId, candidateData, letterType = null) => {
    try {
        // 1. Fetch Branding (Singleton)
        const branding = await CompanyBranding.getBranding();

        // CHECK IF USING FIXED DESIGN TEMPLATE
        const designId = candidateData.designId;
        if (designId && letterDesigns[designId]) {
            return await generateFixedDesignPDF(designId, candidateData, branding);
        }

        // 2. Fetch Template
        let templateDoc;
        if (templateId) {
            templateDoc = await LetterTemplate.findById(templateId);
        } else {
            // Fallback
            templateDoc = await LetterTemplate.findOne({ type: 'Offer' });
            if (!templateDoc) {
                templateDoc = {
                    bodyContent: `<p>Dear {{candidate_name}},</p><p>We are pleased to offer you the position of {{job_role}}.</p><p>CTC: {{ctc}}</p>`
                };
            }
        }

        // --- CHECK FOR FIXED PDF TEMPLATE OVERLAY MODE ---
        // If templateDoc was fetched and has isFixedPdf flag
        // --- CHECK FOR FIXED PDF TEMPLATE OVERLAY MODE ---
        // If templateDoc was fetched and has isFixedPdf flag
        if (templateDoc && templateDoc.isFixedPdf && (templateDoc.pdfUrl || templateDoc.localPath)) {
            console.log("Using Fixed PDF Template (Direct Send):", templateDoc.name);

            // USER REQUEST: No overlay for uploaded PDFs. Just send raw file.
            if (templateDoc.localPath && fs.existsSync(templateDoc.localPath)) {
                console.log("Reading local file:", templateDoc.localPath);
                return fs.readFileSync(templateDoc.localPath);
            }

            // Fallback Logic (e.g. if file missing or using URL - though we prefer local)
            console.log("Generating Overlay (Fallback):", templateDoc.name);
            const effectiveType = letterType || templateDoc.type;
            const filePath = templateDoc.localPath || templateDoc.pdfUrl;

            // Prepare dynamic branding details
            const brandingDetails = {
                logoUrl: branding?.logo?.url,
                address: branding?.companyAddress,
                name: branding?.companyName,
                phone: '',
                email: ''
            };

            return await generateOverlayPDF(filePath, candidateData, effectiveType, brandingDetails);
        }

        // Parse Company Address/Footer Text (BEFORE creating data object)
        const footerText = branding?.companyAddress || '';
        const footerLines = footerText.split('\n').filter(l => l.trim().length > 0);
        const phones = [];
        const emails = [];
        const others = [];
        footerLines.forEach(line => {
            const cleanLine = line.trim();
            if (cleanLine.match(/(\+|00|[0-9]{10})/)) phones.push(cleanLine);
            else if (cleanLine.includes('@')) emails.push(cleanLine);
            else others.push(cleanLine);
        });

        // 3. Prepare Data for Handlebars
        const data = {
            candidate_name: candidateData.name || 'Candidate',
            job_role: candidateData.role || 'N/A',
            candidate_email: candidateData.email || '',
            interview_date: candidateData.interviewDate || 'TBD',
            interview_time: candidateData.interviewTime || '',
            interview_mode: candidateData.interviewMode || '',
            interview_location: candidateData.interviewLocation || '',
            interview_link: candidateData.interviewLink || '',
            ctc: candidateData.salary ? Number(candidateData.salary).toLocaleString() : '',
            joining_date: candidateData.joiningDate || '',
            expiry_date: candidateData.expiryDate || '',
            company_name: branding?.companyName || 'Company Name',
            company_address: branding?.companyAddress || '',
            company_logo: resolveImageUrl(branding?.logo?.url),
            company_phone: branding?.phone || '',
            company_email: branding?.email || '',
            company_website: branding?.website || '',
            company_signature: resolveImageUrl(branding?.signature?.url),

            // New Pre-Processed Branding Variables for Custom Templates
            processed_phone_str: phones.join(' | '),
            processed_email_str: emails.join(' | '),
            processed_address_str: others.join(', '),

            current_date: new Date().toLocaleDateString(),
            hr_name: candidateData.hrName || 'HR Manager',
            round_name: candidateData.interviewRound || 'Interview'
        };

        // Add boolean flags for easy {{#if isOffline}} usage
        data.isOffline = data.interview_mode === 'Offline';
        data.isOnline = data.interview_mode === 'Online';

        // Helper to format address with line breaks
        const formattedAddress = data.company_address ? data.company_address.replace(/\n/g, '<br/>') : '';

        // 4. Compile & Render Template (Body Only)
        let bodyHtml = '';
        let sourceContent = '';
        try {
            // Use provided body content if available (allows one-off edits), otherwise use template
            sourceContent = candidateData.bodyContent || templateDoc.bodyContent;

            // --- AUTO-FIX: REPLACE == with eq helper syntax for convenience ---
            // Matches {{#if var == "val"}} and converts to {{#if (eq var "val")}}
            if (sourceContent) {
                sourceContent = sourceContent.replace(/{{#if\s+([a-zA-Z0-9_.]+)\s*==\s*(".*?"|'.*?'|[0-9]+)\s*}}/g, '{{#if (eq $1 $2)}}');
            }

            const compiled = Handlebars.compile(sourceContent);
            bodyHtml = compiled(data);
        } catch (err) {
            console.error("Handlebars Compilation Error:", err);
            bodyHtml = `<p>Error rendering template: ${err.message}</p>`;
        }

        // --- CHECK FOR RAW HTML MODE ---
        // If the template is a full HTML document, return it directly without adding extra headers/footers.
        if (sourceContent && sourceContent.trim().toLowerCase().startsWith('<!doctype html')) {
            console.log("Detected Full HTML Template - Bypassing Wrapper");

            // 6. Generate PDF (Raw Mode)
            const browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                headless: 'new'
            });
            const page = await browser.newPage();

            await page.setContent(bodyHtml, { waitUntil: 'networkidle0' });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' } // Full bleed for raw templates
            });

            await browser.close();
            return pdfBuffer;
        }

        // Helper to format footer lines with grouping: Phone -> Email -> Address
        // Consolidates multiple items into single lines per category
        const formatBandingFooter = (text) => {
            if (!text) return '';
            const lines = text.split('\n').filter(l => l.trim().length > 0);

            const phones = [];
            const emails = [];
            const others = []; // Address

            lines.forEach(line => {
                const cleanLine = line.trim();
                // Simple detection logic
                if (cleanLine.match(/(\+|00|[0-9]{10})/)) {
                    phones.push(cleanLine);
                } else if (cleanLine.includes('@')) {
                    emails.push(cleanLine);
                } else {
                    others.push(cleanLine);
                }
            });

            let combinedHtml = '';

            // Group 1: Phones (Single Line, Separated by |)
            if (phones.length > 0) {
                combinedHtml += `<div class="phone-row"><span class="icon">📞</span> ${phones.join(' <span style="opacity:0.6">|</span> ')}</div>`;
            }

            // Group 2: Emails (Single Line, Separated by |)
            if (emails.length > 0) {
                combinedHtml += `<div class="email-row"><span class="icon">✉️</span> ${emails.join(' <span style="opacity:0.6">|</span> ')}</div>`;
            }

            // Group 3: Address (Single Line, Separated by comma)
            if (others.length > 0) {
                combinedHtml += `<div class="address-row"><span class="icon">📍</span> ${others.join(', ')}</div>`;
            }

            return combinedHtml;
        };

        const smartFooterHtml = formatBandingFooter(branding.companyAddress);

        // HR Signature Block
        const signatureHtml = `
            <div class="signature-section">
                <p>Sincerely,</p>
                ${branding.signature && branding.signature.url ? `<img src="${resolveImageUrl(branding.signature.url)}" class="signature-img" />` : '<div style="height:50px;"></div>'}
                <p><strong>HR Signature</strong><br>${branding.companyName}</p>
            </div>
        `;

        // 5. Determine if Letter Pad is active
        const useLetterPad = branding.letterPad && branding.letterPad.isActive && branding.letterPad.url;

        let finalHtml;

        if (useLetterPad) {
            // ===== LETTER PAD OVERLAY MODE =====
            const margins = branding.layoutSettings.contentMargin;
            const pageSize = branding.layoutSettings.pageSize;

            finalHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                    
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    
                    body { 
                        margin: 0; padding: 0; 
                        font-family: 'Inter', system-ui, -apple-system, sans-serif; 
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        color: #334155; 
                        position: relative;
                        width: ${pageSize.width}pt;
                        height: ${pageSize.height}pt;
                    }
                    
                    /* Letter Pad Background */
                    .letterpad-background {
                        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                        z-index: -1;
                        background-image: url('${resolveImageUrl(branding.letterPad.url)}');
                        background-size: cover; background-position: center; background-repeat: no-repeat;
                    }
                    
                    /* Content Overlay */
                    .content-overlay {
                        position: absolute;
                        top: ${margins.top}px; left: ${margins.left}px; right: ${margins.right}px; bottom: ${margins.bottom}px;
                        padding: 10px;
                        font-size: 14px; line-height: 1.7;
                        overflow: visible;
                    }
                    
                    /* Typography */
                    .content-overlay h1, .content-overlay h2, .content-overlay h3 {
                        margin: 25px 0 15px 0; color: #0f172a; font-weight: 700; letter-spacing: -0.02em;
                    }
                    .content-overlay h1 { font-size: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
                    .content-overlay h2 { font-size: 20px; }
                    .content-overlay h3 { font-size: 16px; color: #3b82f6; }
                    .content-overlay p { margin: 12px 0; text-align: justify; text-justify: inter-word; }
                    .content-overlay ul, .content-overlay ol { margin: 15px 0 15px 25px; }
                    .content-overlay li { margin-bottom: 5px; padding-left: 5px; }
                    .content-overlay table { width: 100%; border-collapse: collapse; margin: 25px 0; background: #fff; border: 1px solid #e2e8f0; }
                    .content-overlay table th { background-color: #f8fafc; color: #475569; font-weight: 600; text-align: left; padding: 12px; border-bottom: 1px solid #cbd5e1; }
                    .content-overlay table td { padding: 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
                    .content-overlay strong { font-weight: 600; color: #0f172a; }
                    .content-overlay blockquote { border-left: 4px solid #3b82f6; padding-left: 15px; color: #64748b; font-style: italic; margin: 20px 0; background: #f8fafc; padding: 15px; }

                    /* Signature Section */
                    /* Signature Section */
                    .signature-section { 
                        margin-top: 50px; 
                        page-break-inside: avoid;
                        display: flex;
                        flex-direction: column;
                        align-items: flex-end;
                        padding-right: 60px; 
                    }
                    .signature-img { max-height: 60px; display: block; margin: 10px 0; }

                    /* Footer Overlay (Smart Colored Rows) */
                    .footer-overlay {
                        position: absolute;
                        bottom: 30px; left: 0; right: 0;
                        text-align: center;
                        font-size: 11px;
                        z-index: 10;
                        padding: 0 40px;
                        line-height: 1.4;
                        display: flex;
                        flex-direction: column; /* Stacked Rows */
                        justify-content: center;
                        align-items: center;
                        gap: 4px;
                        font-weight: 600;
                    }
                    .icon { margin-right: 6px; }
                    /* Colors optimized for Dark Blue Background */
                    .phone-row { color: #fbbf24; } /* Amber-400 for Visibility */
                    .email-row { color: #ffffff; } /* White for Email */
                    .address-row { color: #cbd5e1; } /* Slate-300 for Address */
                </style>
            </head>
            <body>
                <div class="letterpad-background"></div>
                
                <div class="content-overlay">
                    ${bodyHtml}
                    ${signatureHtml}
                </div>

                <div class="footer-overlay">
                    ${smartFooterHtml}
                </div>
            </body>
            </html>
            `;
        } else {
            // ===== CLEAN MODE (Legacy) =====
            // Strictly only letter content. No forced headers, footers, or signatures.

            const headerHtml = `
            <div class="header-section">
                ${branding.logo && branding.logo.url ? `<img src="${resolveImageUrl(branding.logo.url)}" class="header-logo" alt="Company Logo" />` : ''}
                <div class="company-name">${branding.companyName}</div>
            </div>
            `;

            finalHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                    body { margin: 0; padding: 0; font-family: 'Inter', system-ui, -apple-system, sans-serif; -webkit-print-color-adjust: exact; color: #334155; }
                    .page-container { position: relative; width: 100%; min-height: 100vh; box-sizing: border-box; }
                    /* Updated Content Padding to account for Header */
                    .content { 
                        margin-top: 140px; /* Push content down to avoid Fixed Header */
                        padding: 20px 60px 150px 60px; 
                        font-size: 14px; 
                        line-height: 1.7; 
                    }
                    
                    /* Header Section Styling (FIXED at Top) */
                    .header-section {
                        position: fixed;
                        top: 0; left: 0; right: 0;
                        height: 120px;
                        padding-top: 30px;
                        background-color: white;
                        text-align: center;
                        border-bottom: 2px solid #f1f5f9;
                        z-index: 100;
                    }
                    .header-logo { height: 50px; width: auto; object-fit: contain; margin-bottom: 8px; }
                    .company-name { font-size: 20px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; }

                    h1, h2, h3 { color: #0f172a; font-weight: 700; margin: 25px 0 15px 0; }
                    h1 { font-size: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
                    p { margin: 12px 0; text-align: justify; }
                    table { width: 100%; border-collapse: collapse; margin: 25px 0; border: 1px solid #e2e8f0; }
                    th { background: #f8fafc; padding: 12px; text-align: left; }
                    td { padding: 12px; border-bottom: 1px solid #e2e8f0; }

                    /* Signature Section */
                    .signature-section { 
                        margin-top: 50px; 
                        page-break-inside: avoid;
                        display: flex;
                        flex-direction: column;
                        align-items: flex-end;
                        padding-right: 60px; 
                    }
                    .signature-img { max-height: 60px; display: block; margin: 10px 0; }

                    /* Footer Overlay (FIXED at Bottom) */
                    .footer { 
                        position: fixed; bottom: 0; left: 0; right: 0; padding: 15px 20px; 
                        text-align: center; font-size: 10px; background: white; border-top: 1px solid #eee;
                        display: flex; flex-direction: column; align-items: center; gap: 3px;
                        z-index: 100;
                    }
                    .icon { margin-right: 6px; }
                    .phone-row { color: #d97706; } /* Darker Orange for White bg */
                    .email-row { color: #000000; }
                    .address-row { color: #64748b; }
                </style>
            </head>
            <body>
                ${headerHtml}
                <div class="content">
                    ${bodyHtml}
                    ${signatureHtml}
                </div>
                
                <div class="footer">
                     ${smartFooterHtml}
                </div>
            </body>
            </html>
            `;
        }

        // 6. Generate PDF
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: 'new'
        });
        const page = await browser.newPage();

        // Set content and wait for images
        await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0px',
                bottom: useLetterPad ? '0px' : '100px',
                left: '0px',
                right: '0px'
            }
        });

        await browser.close();

        return pdfBuffer;

    } catch (error) {
        console.error('PDF Generation Error:', error);
        throw error;
    }
};

/**
 * Generate PDF using Fixed Design Templates
 * @param {string} designId - Design template ID (classic, modern, etc.)
 * @param {object} candidateData - Candidate and letter data
 * @param {object} branding - Company branding information
 */
const generateFixedDesignPDF = async (designId, candidateData, branding) => {
    try {
        const design = letterDesigns[designId];

        // Prepare data for template
        const data = {
            logo: branding.logo?.url || '',
            signature: branding.signature?.url || '',
            company_name: branding.companyName || 'Company Name',
            company_address: branding.companyAddress || '',
            candidate_name: candidateData.name || candidateData.employeeName || 'Candidate',
            designation: candidateData.designation || candidateData.role || '',
            job_role: candidateData.role || candidateData.designation || '',
            salary: candidateData.salary || '',
            ctc: candidateData.salary ? Number(candidateData.salary).toLocaleString() : '',
            joining_date: candidateData.joiningDate || '',
            current_date: new Date().toLocaleDateString(),
            hr_name: candidateData.hrName || 'HR Manager',
            reference_number: `${branding.companyName?.substring(0, 3).toUpperCase() || 'COM'}/${new Date().getFullYear()}/${Math.floor(Math.random() * 10000)}`,
            footer_text: branding.companyAddress || '',

            // Interview Details
            interview_date: candidateData.interviewDate || '',
            interview_time: candidateData.interviewTime || '',
            interview_mode: candidateData.interviewMode || '',
            interview_location: candidateData.interviewLocation || '',

            // Experience / Relieving Details
            last_working_day: candidateData.lastWorkingDay || '',
            department: candidateData.department || '',

            // Body content - sanitize HTML
            body_content: sanitizeBodyContent(candidateData.bodyContent || candidateData.body || '')
        };

        // Compile HTML template
        const htmlTemplate = Handlebars.compile(design.html);
        const htmlContent = htmlTemplate(data);

        // Build complete HTML document
        const fullHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap');
                    
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    
                    ${design.css}
                </style>
            </head>
            <body>
                ${htmlContent}
            </body>
            </html>
        `;

        // Generate PDF using Puppeteer
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: 'new'
        });
        const page = await browser.newPage();

        await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0px',
                bottom: '0px',
                left: '0px',
                right: '0px'
            }
        });

        await browser.close();

        return pdfBuffer;

    } catch (error) {
        console.error('Fixed Design PDF Generation Error:', error);
        throw error;
    }
};

/**
 * Sanitize body content to prevent HTML injection
 * Converts plain text to HTML paragraphs
 */
const sanitizeBodyContent = (content) => {
    if (!content) return '<p>No content provided.</p>';

    // Check if content already looks like HTML (contains <p, <div, <br, etc.)
    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(content);

    if (hasHtmlTags) {
        // If it already has HTML, trust it (or at least don't double-escape it)
        return content;
    }

    // Convert line breaks to paragraphs for plain text
    const paragraphs = content
        .split('\n')
        .filter(p => p.trim())
        .map(p => `<p>${p.trim()}</p>`)
        .join('');

    return paragraphs || '<p>No content provided.</p>';
};

module.exports = { generateLetterPDF };
