// Check Employee Emails and Payroll Linkage
require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./src/models/Employee/Employee');
const Payroll = require('./src/models/Payroll/Payroll');

async function checkEmailLinkage() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get all employees with their emails
        const employees = await Employee.find({}).select('firstName lastName email employeeId department');

        console.log(`📊 Total Employees: ${employees.length}\n`);
        console.log('Employee Email List:');
        console.log('─'.repeat(100));

        for (const emp of employees) {
            console.log(`${emp.firstName} ${emp.lastName} (${emp.employeeId})`);
            console.log(`   Email: ${emp.email}`);
            console.log(`   Department: ${emp.department}`);

            // Check if this employee has payroll records
            const payrollCount = await Payroll.countDocuments({ employee: emp._id });
            console.log(`   Payroll Records: ${payrollCount}`);

            if (payrollCount > 0) {
                const payrolls = await Payroll.find({ employee: emp._id }).select('month year netSalary paymentStatus');
                payrolls.forEach(p => {
                    console.log(`      - ${getMonthName(p.month)} ${p.year}: ₹${p.netSalary} (${p.paymentStatus})`);
                });
            }
            console.log('');
        }

        console.log('─'.repeat(100));

        // Summary
        const totalPayrolls = await Payroll.countDocuments({});
        console.log(`\n📈 Summary:`);
        console.log(`   Total Employees: ${employees.length}`);
        console.log(`   Total Payroll Records: ${totalPayrolls}`);
        console.log(`   Employees with Payroll: ${employees.filter(async (emp) => {
            const count = await Payroll.countDocuments({ employee: emp._id });
            return count > 0;
        }).length}`);

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

checkEmailLinkage();
