// Bulk Payroll Generation Script
// Run this to generate payroll for all employees for a specific month/year

require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./src/models/Employee/Employee');
const Payroll = require('./src/models/Payroll/Payroll');

const MONTH = 12; // December
const YEAR = 2025;

async function generateBulkPayroll() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get all active employees
        const employees = await Employee.find({ status: 'Active' });
        console.log(`📊 Found ${employees.length} active employees`);

        if (employees.length === 0) {
            console.log('❌ No active employees found. Please add employees first.');
            process.exit(0);
        }

        let generated = 0;
        let skipped = 0;

        for (const employee of employees) {
            // Check if payroll already exists
            const existing = await Payroll.findOne({
                employee: employee._id,
                month: MONTH,
                year: YEAR
            });

            if (existing) {
                console.log(`⏭️  Skipped ${employee.firstName} ${employee.lastName} - already exists`);
                skipped++;
                continue;
            }

            // Calculate salary components
            const basicSalary = employee.basicSalary || 30000;
            const allowances = employee.allowances || 5000;
            const deductions = employee.deductions || 1000;
            const bonus = 0;
            const tax = basicSalary * 0.025; // 2.5% tax
            const netSalary = basicSalary + allowances + bonus - deductions - tax;

            // Auto-set payment date to 7th of the month
            const paymentDate = new Date(YEAR, MONTH - 1, 7);

            // Create payroll
            await Payroll.create({
                employee: employee._id,
                month: MONTH,
                year: YEAR,
                basicSalary,
                allowances,
                deductions,
                bonus,
                tax,
                netSalary,
                paymentDate,
                paymentStatus: 'Pending',
                bankDetails: employee.bankDetails || null
            });

            console.log(`✅ Generated payroll for ${employee.firstName} ${employee.lastName} - ₹${netSalary.toFixed(2)}`);
            generated++;
        }

        console.log('\n📈 Summary:');
        console.log(`   ✅ Generated: ${generated}`);
        console.log(`   ⏭️  Skipped: ${skipped}`);
        console.log(`   📊 Total: ${employees.length}`);
        console.log('\n✨ Bulk payroll generation completed!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

generateBulkPayroll();
