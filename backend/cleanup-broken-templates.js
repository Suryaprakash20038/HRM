/**
 * Cleanup script to remove broken PDF templates
 * This removes templates where the PDF file doesn't exist in Cloudinary
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

async function cleanupBrokenTemplates() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB\n');

        // Find all PDF templates
        const templates = await LetterTemplate.find({
            isFixedPdf: true,
            pdfUrl: { $exists: true, $ne: null }
        });

        console.log(`📋 Found ${templates.length} PDF templates\n`);

        const brokenTemplates = [];
        const workingTemplates = [];

        for (const template of templates) {
            try {
                const publicId = extractPublicId(template.pdfUrl);

                if (!publicId) {
                    console.log(`⚠️  [${template.name}] Invalid URL format`);
                    brokenTemplates.push(template);
                    continue;
                }

                // Check if resource exists in Cloudinary
                try {
                    await cloudinary.api.resource(publicId, {
                        resource_type: 'raw',
                        type: 'upload'
                    });
                    console.log(`✅ [${template.name}] - Working`);
                    workingTemplates.push(template);
                } catch (err) {
                    if (err.error && err.error.http_code === 404) {
                        console.log(`❌ [${template.name}] - File not found in Cloudinary`);
                        brokenTemplates.push(template);
                    } else {
                        console.log(`⚠️  [${template.name}] - ${err.message}`);
                        brokenTemplates.push(template);
                    }
                }

            } catch (error) {
                console.error(`❌ [${template.name}] Error:`, error.message);
                brokenTemplates.push(template);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log(`📊 Summary:`);
        console.log(`   ✅ Working templates: ${workingTemplates.length}`);
        console.log(`   ❌ Broken templates: ${brokenTemplates.length}`);
        console.log('='.repeat(60) + '\n');

        if (brokenTemplates.length > 0) {
            console.log('🗑️  Broken templates to delete:\n');
            brokenTemplates.forEach((t, i) => {
                console.log(`   ${i + 1}. ${t.name} (ID: ${t._id})`);
            });

            console.log('\n⚠️  Deleting broken templates...\n');

            for (const template of brokenTemplates) {
                await LetterTemplate.findByIdAndDelete(template._id);
                console.log(`   ✅ Deleted: ${template.name}`);
            }

            console.log(`\n✨ Successfully deleted ${brokenTemplates.length} broken template(s)!`);
            console.log('💡 You can now upload fresh PDF templates.');
        } else {
            console.log('✨ All templates are working correctly!');
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
cleanupBrokenTemplates();
