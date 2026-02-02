require('dotenv').config();
const mongoose = require('mongoose');
const LetterTemplate = require('./src/models/Recruitment/LetterTemplate');

async function checkLatestTemplate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const template = await LetterTemplate.findOne({ isFixedPdf: true }).sort({ createdAt: -1 });

        if (template) {
            console.log('--------------------------------------------------');
            console.log('Template Name:', template.name);
            console.log('Public ID:', template.publicId ? template.publicId : 'MISSING');
            console.log('PDF URL:', template.pdfUrl);
            console.log('Resource Type:', template.resourceType);
            console.log('--------------------------------------------------');
        } else {
            console.log('No template found.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

checkLatestTemplate();
