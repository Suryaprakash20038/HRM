// Clear Payroll for December 2025
// Run this to delete all payroll records for December 2025
// so you can generate them individually through the UI

require('dotenv').config();
const mongoose = require('mongoose');
const Payroll = require('./src/models/Payroll/Payroll');

const MONTH = 12; // December
const YEAR = 2025;

async function clearPayroll() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Count existing payroll records
        const count = await Payroll.countDocuments({ month: MONTH, year: YEAR });
        console.log(`📊 Found ${count} payroll records for ${getMonthName(MONTH)} ${YEAR}\n`);

        if (count === 0) {
            console.log('✅ No payroll records to delete.\n');
        } else {
            // Delete all payroll records for the specified month/year
            const result = await Payroll.deleteMany({ month: MONTH, year: YEAR });
            console.log(`🗑️  Deleted ${result.deletedCount} payroll records\n`);
            console.log('✨ You can now generate payroll individually through the UI!\n');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

function getMonthName(month) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
}

clearPayroll();
