const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User/User');
const Employee = require('./src/models/Employee/Employee');

async function forceLink() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get all employees
        const employees = await Employee.find({});
        console.log(`📊 Found ${employees.length} employees\n`);

        for (const employee of employees) {
            console.log(`\n👤 Employee: ${employee.firstName} ${employee.lastName}`);
            console.log(`   Email: ${employee.email}`);
            console.log(`   Department: ${employee.department}`);

            if (employee.userId) {
                const user = await User.findById(employee.userId);
                if (user) {
                    console.log(`   ✅ Already linked to user: ${user.email}`);
                    continue;
                }
            }

            // Find user by email
            const user = await User.findOne({ email: employee.email });

            if (user) {
                console.log(`   📧 Found user: ${user.email} (${user.role})`);

                // Link them
                await Employee.updateOne(
                    { _id: employee._id },
                    { $set: { userId: user._id } }
                );

                console.log(`   ✅ Linked employee to user!`);
            } else {
                console.log(`   ⚠️  No user account found with email: ${employee.email}`);
            }
        }

        console.log('\n✅ Force linking complete!');
        console.log('\n💡 Now please:');
        console.log('   1. Log out from the application');
        console.log('   2. Log back in');
        console.log('   3. Try creating a task\n');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

forceLink();
