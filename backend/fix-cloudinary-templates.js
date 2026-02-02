/**
 * Utility script to fix existing Cloudinary PDF templates
 * This script updates the access mode of existing templates to 'public'
 * Run this once to fix all existing templates that are returning 401 errors
 */

require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const LetterTemplate = require('./src/models/Recruitment/LetterTemplate');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Extract public_id from Cloudinary URL
const extractPublicId = (url) => {
    const match = url.match(/\/upload\/v\d+\/(.+)$/);
    return match ? match[1].replace(/\.[^.]+$/, '') : null;
};

async function fixExistingTemplates() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Find all templates with PDF URLs
        const templates = await LetterTemplate.find({
            isFixedPdf: true,
            pdfUrl: { $exists: true, $ne: null }
        });

        console.log(`\n📋 Found ${templates.length} PDF templates to fix\n`);

        let successCount = 0;
        let errorCount = 0;

        for (const template of templates) {
            try {
                const publicId = extractPublicId(template.pdfUrl);

                if (!publicId) {
                    console.log(`❌ [${template.name}] Could not extract public_id from URL: ${template.pdfUrl}`);
                    errorCount++;
                    continue;
                }

                console.log(`🔧 Processing: ${template.name}`);
                console.log(`   Public ID: ${publicId}`);

                // Update the resource to be publicly accessible
                const result = await cloudinary.uploader.explicit(publicId, {
                    resource_type: 'raw',
                    type: 'upload',
                    access_mode: 'public'
                });

                console.log(`✅ [${template.name}] Successfully updated to public access`);
                console.log(`   New URL: ${result.secure_url}\n`);

                // Update the template with the new URL (should be the same, but just in case)
                template.pdfUrl = result.secure_url;
                await template.save();

                successCount++;

            } catch (error) {
                console.error(`❌ [${template.name}] Error:`, error.message);
                errorCount++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log(`📊 Summary:`);
        console.log(`   ✅ Successfully fixed: ${successCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);
        console.log(`   📝 Total: ${templates.length}`);
        console.log('='.repeat(60) + '\n');

        if (successCount > 0) {
            console.log('✨ All accessible templates have been fixed!');
            console.log('💡 You can now use these templates without 401 errors.');
        }

        if (errorCount > 0) {
            console.log('\n⚠️  Some templates could not be fixed.');
            console.log('💡 For templates that still fail, please DELETE and RE-UPLOAD them.');
        }

    } catch (error) {
        console.error('❌ Fatal Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run the script
fixExistingTemplates();
