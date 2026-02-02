const mongoose = require('mongoose');
require('dotenv').config();

const LetterTemplate = require('./src/models/Recruitment/LetterTemplate');

async function listAllTemplates() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Fetch all templates
        const templates = await LetterTemplate.find({}).sort({ type: 1, name: 1 });

        // Group by type
        const grouped = templates.reduce((acc, template) => {
            if (!acc[template.type]) {
                acc[template.type] = [];
            }
            acc[template.type].push(template);
            return acc;
        }, {});

        // Display results
        console.log('📊 TEMPLATE INVENTORY\n');
        console.log('='.repeat(80));

        let totalCount = 0;
        const typeOrder = ['Interview Call', 'Offer', 'Next Round', 'Rejection'];

        typeOrder.forEach(type => {
            if (grouped[type]) {
                console.log(`\n📁 ${type.toUpperCase()} (${grouped[type].length} templates)`);
                console.log('-'.repeat(80));

                grouped[type].forEach((template, index) => {
                    const status = template.isActive ? '✅' : '❌';
                    const locked = template.isLocked ? '🔒' : '🔓';
                    console.log(`${index + 1}. ${status} ${locked} ${template.name}`);
                    console.log(`   Subject: ${template.subject}`);
                    console.log(`   ID: ${template._id}`);
                    console.log('');
                });

                totalCount += grouped[type].length;
            }
        });

        // Show any other types not in the main list
        Object.keys(grouped).forEach(type => {
            if (!typeOrder.includes(type)) {
                console.log(`\n📁 ${type.toUpperCase()} (${grouped[type].length} templates)`);
                console.log('-'.repeat(80));
                grouped[type].forEach((template, index) => {
                    const status = template.isActive ? '✅' : '❌';
                    console.log(`${index + 1}. ${status} ${template.name}`);
                });
                totalCount += grouped[type].length;
            }
        });

        console.log('\n' + '='.repeat(80));
        console.log(`\n📈 SUMMARY`);
        console.log(`   Total Templates: ${totalCount}`);
        console.log(`   Active: ${templates.filter(t => t.isActive).length}`);
        console.log(`   Inactive: ${templates.filter(t => !t.isActive).length}`);
        console.log(`   Types: ${Object.keys(grouped).length}`);
        console.log('\n' + '='.repeat(80));

        // Export to JSON for reference
        const exportData = {
            totalCount,
            generatedAt: new Date().toISOString(),
            byType: grouped,
            summary: {
                active: templates.filter(t => t.isActive).length,
                inactive: templates.filter(t => !t.isActive).length,
                types: Object.keys(grouped).length
            }
        };

        const fs = require('fs');
        fs.writeFileSync(
            './template-inventory.json',
            JSON.stringify(exportData, null, 2)
        );
        console.log('\n💾 Exported to: template-inventory.json\n');

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

listAllTemplates();
