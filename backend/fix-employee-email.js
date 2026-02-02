// Fix Employee Email to Match User Email
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User/User');
const Employee = require('./src/models/Employee/Employee');

async function fixEmployeeEmail() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const targetEmail = 'muthu@gmail.com';

        // Find user
        const user = await User.findOne({ email: targetEmail });
        console.log('User:', user ? `${user.firstName} ${user.lastName} (${user.email})` : 'NOT FOUND');

        // Find employee by name
        if (user) {
            const employee = await Employee.findOne({
                firstName: new RegExp(user.firstName, 'i')
            });

            if (employee) {
                console.log(`\nEmployee found: ${employee.firstName} ${employee.lastName}`);
                console.log(`Current email: ${employee.email}`);
                console.log(`Should be: ${user.email}`);

                if (employee.email !== user.email) {
                    console.log('\n🔧 Updating employee email...');
                    employee.email = user.email;
                    await employee.save();
                    console.log('✅ Email updated successfully!');
                } else {
                    console.log('\n✅ Emails already match!');
                }
            } else {
                console.log('\n❌ No employee found with name:', user.firstName);
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

fixEmployeeEmail();
