// Final Email Verification and Fix
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User/User');
const Employee = require('./src/models/Employee/Employee');

async function finalFix() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get ALL employee users
        const employeeUsers = await User.find({ role: 'employee' });
        console.log(`📊 Found ${employeeUsers.length} employee users:\n`);

        employeeUsers.forEach((user, i) => {
            console.log(`${i + 1}. ${user.firstName} ${user.lastName} - ${user.email}`);
        });

        // Get ALL employees
        const employees = await Employee.find({});
        console.log(`\n📊 Found ${employees.length} employee records:\n`);

        employees.forEach((emp, i) => {
            console.log(`${i + 1}. ${emp.firstName} ${emp.lastName} - ${emp.email} (${emp.employeeId})`);
        });

        // Fix: Update ALL employee emails to match user emails
        console.log('\n🔧 Syncing emails...\n');

        let updated = 0;
        for (const user of employeeUsers) {
            // Find employee with similar first name
            const employee = await Employee.findOne({
                firstName: new RegExp(`^${user.firstName}`, 'i')
            });

            if (employee && employee.email !== user.email) {
                console.log(`Updating: ${employee.firstName} ${employee.lastName}`);
                console.log(`  From: ${employee.email}`);
                console.log(`  To: ${user.email}`);

                await Employee.updateOne(
                    { _id: employee._id },
                    { $set: { email: user.email } }
                );
                updated++;
                console.log(`  ✅ Updated!\n`);
            }
        }

        console.log(`\n✅ Updated ${updated} employee emails`);

        // Verify the specific user
        const testUser = await User.findOne({ email: 'muthu@gmail.com' });
        if (testUser) {
            console.log(`\n🔍 Verifying user: ${testUser.email}`);
            const matchingEmployee = await Employee.findOne({ email: testUser.email });
            if (matchingEmployee) {
                console.log(`✅ Employee found: ${matchingEmployee.firstName} ${matchingEmployee.lastName}`);
            } else {
                console.log(`❌ No employee with email: ${testUser.email}`);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected');
        process.exit(0);
    }
}

finalFix();
