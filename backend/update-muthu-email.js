// Simple Email Sync - Update muthu employee email
require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./src/models/Employee/Employee');

async function updateMuthuEmail() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // List all employees first
        const allEmployees = await Employee.find({});
        console.log('All employees:');
        allEmployees.forEach((emp, i) => {
            console.log(`${i + 1}. ${emp.firstName} ${emp.lastName} - ${emp.email} (${emp.employeeId})`);
        });

        // Find employee with "muthu" in name (case insensitive)
        const muthuEmployee = await Employee.findOne({
            $or: [
                { firstName: /muthu/i },
                { lastName: /muthu/i }
            ]
        });

        if (muthuEmployee) {
            console.log(`\n✅ Found employee: ${muthuEmployee.firstName} ${muthuEmployee.lastName}`);
            console.log(`   Current email: ${muthuEmployee.email}`);
            console.log(`   Updating to: muthu@gmail.com`);

            muthuEmployee.email = 'muthu@gmail.com';
            await muthuEmployee.save();

            console.log('   ✅ Email updated successfully!');
        } else {
            console.log('\n❌ No employee found with "muthu" in name');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected');
        process.exit(0);
    }
}

updateMuthuEmail();
