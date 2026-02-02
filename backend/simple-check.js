// Simple Email and Payroll Check
require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./src/models/Employee/Employee');
const Payroll = require('./src/models/Payroll/Payroll');

async function simpleCheck() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get all employees
        const employees = await Employee.find({}).select('firstName lastName email employeeId');
        console.log(`📊 Total Employees: ${employees.length}\n`);

        console.log('Employees:');
        employees.forEach((emp, i) => {
            console.log(`${i + 1}. ${emp.firstName} ${emp.lastName}`);
            console.log(`   Email: ${emp.email}`);
            console.log(`   Employee ID: ${emp.employeeId}`);
            console.log(`   MongoDB _id: ${emp._id}`);
            console.log('');
        });

        // Get all payroll records
        const payrolls = await Payroll.find({})
            .populate('employee', 'firstName lastName email employeeId')
            .select('month year netSalary paymentStatus employee');

        console.log(`\n📊 Total Payroll Records: ${payrolls.length}\n`);

        console.log('Payroll Records:');
        payrolls.forEach((p, i) => {
            console.log(`${i + 1}. Employee: ${p.employee?.firstName} ${p.employee?.lastName}`);
            console.log(`   Email: ${p.employee?.email}`);
            console.log(`   Period: Month ${p.month}, Year ${p.year}`);
            console.log(`   Net Salary: ₹${p.netSalary}`);
            console.log(`   Status: ${p.paymentStatus}`);
            console.log('');
        });

        // Test email lookup (simulate what the API does)
        console.log('\n🔍 Testing Email Lookup (like the API does):\n');
        const testEmail = employees[0]?.email;
        if (testEmail) {
            console.log(`Looking up employee with email: ${testEmail}`);
            const foundEmployee = await Employee.findOne({ email: testEmail });
            if (foundEmployee) {
                console.log(`✅ Found: ${foundEmployee.firstName} ${foundEmployee.lastName}`);
                const employeePayrolls = await Payroll.find({ employee: foundEmployee._id });
                console.log(`✅ Payroll records for this employee: ${employeePayrolls.length}`);
            } else {
                console.log(`❌ No employee found with email: ${testEmail}`);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

simpleCheck();
