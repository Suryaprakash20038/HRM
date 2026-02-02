const mongoose = require('mongoose');
require('dotenv').config();

const CompanyBranding = require('./src/models/Recruitment/CompanyBranding');

async function updateBrandingDynamic() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const branding = await CompanyBranding.findOne();

        if (branding) {
            // Update to use dynamic placeholders
            branding.headerContent = '<div style="text-align: center;"><h1>{{company_name}}</h1></div>';
            branding.footerContent = '<div style="text-align: center;"><p>{{company_address}}</p></div>';

            // Mark as modified just in case
            branding.markModified('headerContent');
            branding.markModified('footerContent');

            await branding.save();
            console.log('✅ Updated Company Branding to use dynamic {{company_address}} and {{company_name}}');
        } else {
            console.log('⚠️ No branding record found to update.');
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

updateBrandingDynamic();
