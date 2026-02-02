// Update All Employees to Active Status
require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./src/models/Employee/Employee');

async function activateAllEmployees() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Update all employees to Active status
        const result = await Employee.updateMany(
            { status: { $ne: 'Active' } }, // Find all non-active employees
            { $set: { status: 'Active' } }  // Set them to Active
        );

        console.log(`📊 Updated ${result.modifiedCount} employees to Active status\n`);

        // Show updated list
        const activeEmployees = await Employee.find({ status: 'Active' });
        console.log(`✅ Total Active Employees: ${activeEmployees.length}\n`);

        if (activeEmployees.length > 0) {
            console.log('Active Employees:');
            console.log('─'.repeat(60));
            activeEmployees.forEach((emp, index) => {
                console.log(`${index + 1}. ${emp.firstName} ${emp.lastName} (${emp.employeeId || 'N/A'}) - ${emp.department || 'N/A'}`);
            });
            console.log('─'.repeat(60));
        }

        console.log('\n✨ All employees are now Active!');
        console.log('   You can now generate payroll for them.\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

activateAllEmployees();
