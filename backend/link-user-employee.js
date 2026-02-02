const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User/User');
const Employee = require('./src/models/Employee/Employee');

async function linkUserToEmployee() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get all users
        const users = await User.find({});
        console.log(`\n📊 Found ${users.length} users\n`);

        for (const user of users) {
            console.log(`\n👤 User: ${user.email} (${user.firstName} ${user.lastName})`);
            console.log(`   Role: ${user.role}`);
            console.log(`   User ID: ${user._id}`);

            // Check if employee profile exists
            let employee = await Employee.findOne({ userId: user._id });

            if (employee) {
                console.log(`   ✅ Already linked to employee: ${employee.firstName} ${employee.lastName}`);
            } else {
                // Try to find employee by email
                employee = await Employee.findOne({ email: user.email });

                if (employee) {
                    console.log(`   📧 Found employee by email: ${employee.firstName} ${employee.lastName}`);

                    // Link them using updateOne to bypass validation
                    await Employee.updateOne(
                        { _id: employee._id },
                        { $set: { userId: user._id } }
                    );

                    console.log(`   ✅ Linked user to employee profile!`);
                } else {
                    console.log(`   ⚠️  No employee profile found for this user`);
                    console.log(`   💡 You may need to create an employee profile for: ${user.email}`);
                }
            }
        }

        console.log('\n✅ User-Employee linking complete!\n');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

linkUserToEmployee();
