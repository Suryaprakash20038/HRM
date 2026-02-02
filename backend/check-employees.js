// Check Employee Status Script
require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./src/models/Employee/Employee');

async function checkEmployees() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const allEmployees = await Employee.find({});
        console.log(`📊 Total employees in database: ${allEmployees.length}\n`);

        if (allEmployees.length === 0) {
            console.log('❌ No employees found in the database!');
            console.log('   Please add employees through the Employee Management page first.\n');
        } else {
            console.log('Employee List:');
            console.log('─'.repeat(80));
            allEmployees.forEach((emp, index) => {
                console.log(`${index + 1}. ${emp.firstName} ${emp.lastName}`);
                console.log(`   ID: ${emp.employeeId || 'N/A'}`);
                console.log(`   Department: ${emp.department || 'N/A'}`);
                console.log(`   Status: ${emp.status || 'N/A'}`);
                console.log(`   Basic Salary: ₹${emp.basicSalary || 0}`);
                console.log('');
            });

            const activeCount = allEmployees.filter(e => e.status === 'Active').length;
            const inactiveCount = allEmployees.filter(e => e.status !== 'Active').length;

            console.log('─'.repeat(80));
            console.log(`Summary: ${activeCount} Active, ${inactiveCount} Inactive/Other\n`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

checkEmployees();
