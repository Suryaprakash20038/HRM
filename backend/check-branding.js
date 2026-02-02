const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const CompanyBranding = require('./src/models/Recruitment/CompanyBranding');

if (!process.env.MONGODB_URI) {
    console.error('FATAL: MONGODB_URI is missing from environment variables.');
    // Check if .env file exists
    const fs = require('fs');
    if (fs.existsSync(path.join(__dirname, '.env'))) {
        console.log('.env file found.');
    } else {
        console.log('.env file NOT found.');
    }
    process.exit(1);
}


async function checkBranding() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('Connected to DB');

        const branding = await CompanyBranding.findOne();
        console.log('--- BRANDING DATA ---');
        console.log('Company Name:', branding?.companyName);
        console.log('Company Address:', branding?.companyAddress);
        console.log('LetterPad URL:', branding?.letterPad?.url);
        console.log('LetterPad Active:', branding?.letterPad?.isActive);
        console.log('---------------------');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkBranding();
