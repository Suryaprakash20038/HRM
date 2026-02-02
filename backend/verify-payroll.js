// Verify Payroll Data
require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./src/models/Employee/Employee');
const Payroll = require('./src/models/Payroll/Payroll');

async function verifyPayroll() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const payrolls = await Payroll.find({})
            .populate('employee', 'firstName lastName employeeId email department')
            .sort({ year: -1, month: -1 });

        console.log(`📊 Total Payroll Records: ${payrolls.length}\n`);

        if (payrolls.length === 0) {
            console.log('❌ No payroll records found!\n');
        } else {
            console.log('Payroll Records:');
            console.log('─'.repeat(100));
            payrolls.forEach((p, index) => {
                console.log(`${index + 1}. ${p.employee?.firstName} ${p.employee?.lastName} (${p.employee?.employeeId})`);
                console.log(`   Email: ${p.employee?.email}`);
                console.log(`   Department: ${p.employee?.department}`);
                console.log(`   Period: ${getMonthName(p.month)} ${p.year}`);
                console.log(`   Basic: ₹${p.basicSalary} | Allowances: ₹${p.allowances} | Deductions: ₹${p.deductions}`);
                console.log(`   Net Salary: ₹${p.netSalary} | Status: ${p.paymentStatus}`);
                console.log('');
            });
            console.log('─'.repeat(100));
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

function getMonthName(month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || 'N/A';
}

verifyPayroll();
