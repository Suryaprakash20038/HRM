const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const axios = require('axios');

/**
 * Overlay candidate details on an existing PDF template using pdf-lib
 * @param {string} filePath - Local file path OR URL (legacy)
 * @param {object} data - Candidate data to overlay
 * @param {string} letterType - Type of letter (Offer, Interview Call, etc.)
 * @param {object} branding - (Optional) Company branding details { logoUrl, address, phone, email, website }
 */
const generateOverlayPDF = async (filePath, data, letterType, branding = null) => {
    try {
        console.log('📄 Processing PDF Template:', filePath);

        let existingPdfBytes;

        // Check if it's a local file path
        if (filePath && !filePath.startsWith('http') && fs.existsSync(filePath)) {
            console.log('📂 Reading from local filesystem...');
            existingPdfBytes = fs.readFileSync(filePath);
        } else {
            console.log('⚠️ Path looks like URL or file missing, attempting legacy fetch...');
            const response = await axios.get(filePath, { responseType: 'arraybuffer' });
            existingPdfBytes = response.data;
        }

        if (!existingPdfBytes || existingPdfBytes.byteLength === 0) {
            throw new Error('PDF template is empty');
        }

        console.log(`✅ Success! Loaded ${existingPdfBytes.byteLength} bytes`);

        // Load into PDFDocument
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();

        // --- 1. Draw Company Branding (Logo & Footer) ---
        if (branding) {
            // Draw Logo
            if (branding.logoUrl) {
                try {
                    console.log('🖼️ Fetching Logo:', branding.logoUrl);
                    const logoResponse = await axios.get(branding.logoUrl, { responseType: 'arraybuffer' });
                    const logoImageBytes = logoResponse.data;

                    let logoImage;
                    if (branding.logoUrl.toLowerCase().endsWith('.png')) {
                        logoImage = await pdfDoc.embedPng(logoImageBytes);
                    } else {
                        logoImage = await pdfDoc.embedJpg(logoImageBytes);
                    }

                    const logoDims = logoImage.scale(0.5); // Initial scale, adjust as needed
                    // Fit within 100x50 box
                    const maxWidth = 150;
                    const maxHeight = 60;
                    let scaleFactor = 1;
                    if (logoDims.width > maxWidth) scaleFactor = maxWidth / logoDims.width;
                    if (logoDims.height > maxHeight) scaleFactor = Math.min(scaleFactor, maxHeight / logoDims.height);

                    const scaledWidth = logoDims.width * scaleFactor;
                    const scaledHeight = logoDims.height * scaleFactor;

                    firstPage.drawImage(logoImage, {
                        x: 50, // Left aligned
                        y: height - 80, // Top margin
                        width: scaledWidth,
                        height: scaledHeight,
                    });
                } catch (logoErr) {
                    console.error('❌ Failed to embed logo:', logoErr.message);
                }
            }

            // Draw Footer (Address, Contact)
            const footerY = 30;
            const footerFontSize = 9;
            let footerText = '';

            // Build footer string
            const parts = [];
            if (branding.phone) parts.push(`📞 ${branding.phone}`);
            if (branding.email) parts.push(`📧 ${branding.email}`);
            if (branding.website) parts.push(`🌐 ${branding.website}`);

            const contactLine = parts.join('  |  ');

            if (contactLine) {
                const textWidth = font.widthOfTextAtSize(contactLine, footerFontSize);
                firstPage.drawText(contactLine, {
                    x: (width - textWidth) / 2, // Center
                    y: footerY + 15,
                    size: footerFontSize,
                    font: font,
                    color: rgb(0.9, 0.7, 0.0), // Gold/Yellowish color mostly used for footer icons
                });
            }

            if (branding.address) {
                const addressWidth = font.widthOfTextAtSize(branding.address, footerFontSize - 1);
                firstPage.drawText(branding.address, {
                    x: (width - addressWidth) / 2, // Center
                    y: footerY,
                    size: footerFontSize - 1,
                    font: font,
                    color: rgb(0.5, 0.5, 0.5), // Grey
                });
            }
        }

        // --- 2. Determine Letter Title based on type ---
        const type = letterType ? letterType.toLowerCase() : 'offer';
        let letterTitle = 'LETTER';

        if (type.includes('offer')) {
            letterTitle = 'OFFER LETTER';
        } else if (type.includes('interview') || type.includes('call')) {
            letterTitle = 'INTERVIEW CALL LETTER';
        } else if (type.includes('appointment')) {
            letterTitle = 'APPOINTMENT LETTER';
        } else if (type.includes('rejection')) {
            letterTitle = 'REJECTION LETTER';
        } else if (type.includes('round') || type.includes('next')) {
            letterTitle = 'NEXT ROUND INTERVIEW LETTER';
        } else if (type.includes('relieving')) {
            letterTitle = 'RELIEVING LETTER';
        } else {
            letterTitle = letterType ? letterType.toUpperCase() : 'LETTER';
        }

        // --- 3. Draw Letter Title (Adjusted Y position if Logo exists) ---
        const titleFontSize = 18;
        const titleY = height - 120; // Lowered slightly to make room for logo if needed
        const titleWidth = fontBold.widthOfTextAtSize(letterTitle, titleFontSize);
        const titleX = (width - titleWidth) / 2; // Center horizontally

        firstPage.drawText(letterTitle, {
            x: titleX,
            y: titleY,
            size: titleFontSize,
            font: fontBold,
            color: rgb(0, 0, 0.4), // Dark blue color
        });

        // Draw underline for title
        firstPage.drawLine({
            start: { x: titleX, y: titleY - 5 },
            end: { x: titleX + titleWidth, y: titleY - 5 },
            thickness: 2,
            color: rgb(0, 0, 0.4),
        });

        // --- 4. Draw Candidate Details ---
        const startY = height - 190; // Lowered further
        const lineSpacing = 16;
        const fontSize = 11;

        let fields = [];

        fields.push({ label: 'Date:', value: new Date().toLocaleDateString() });

        if (type.includes('offer')) {
            fields.push({ label: 'To:', value: data.name || data.employeeName || 'Candidate' });
            fields.push({ label: 'Designation:', value: data.designation || data.role || '' });
            if (data.salary) fields.push({ label: 'CTC:', value: data.salary.toString() });
            if (data.joiningDate) fields.push({ label: 'DOJ:', value: new Date(data.joiningDate).toLocaleDateString() });
        } else if (type.includes('interview') || type.includes('call')) {
            fields.push({ label: 'Candidate:', value: data.name || 'Candidate' });
            fields.push({ label: 'Role:', value: data.role || '' });
            fields.push({ label: 'Date:', value: data.interviewDate ? new Date(data.interviewDate).toLocaleDateString() : 'TBD' });
            if (data.interviewTime) fields.push({ label: 'Time:', value: data.interviewTime });
            if (data.interviewMode) fields.push({ label: 'Mode:', value: data.interviewMode });
        } else {
            fields.push({ label: 'Name:', value: data.name || 'Candidate' });
            fields.push({ label: 'Letter Type:', value: letterType });
        }

        const startX = 50;
        let currentY = startY;

        for (const field of fields) {
            firstPage.drawText(field.label, {
                x: startX,
                y: currentY,
                size: fontSize,
                font: fontBold,
                color: rgb(0, 0, 0),
            });

            firstPage.drawText(field.value, {
                x: startX + 90,
                y: currentY,
                size: fontSize,
                font: font,
                color: rgb(0.2, 0.2, 0.2),
            });

            currentY -= lineSpacing;
        }

        // --- 5. Draw HR Signature ---
        const signY = 120;
        const signX = width - 200;

        if (data.hrName) {
            firstPage.drawText('Authorized Signatory', {
                x: signX,
                y: signY,
                size: 10,
                font: fontBold,
            });
            firstPage.drawText(data.hrName, {
                x: signX,
                y: signY - 15,
                size: 10,
                font: font,
            });
        }

        const pdfBytes = await pdfDoc.save();
        return Buffer.from(pdfBytes);

    } catch (error) {
        console.error("Overlay PDF Generation Error:", error.message);
        throw new Error('Failed to generate overlay PDF: ' + error.message);
    }
};

module.exports = { generateOverlayPDF };
