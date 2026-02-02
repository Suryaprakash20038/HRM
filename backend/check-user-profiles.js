const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User/User');
const Employee = require('./src/models/Employee/Employee');

async function checkCurrentUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get all users and their employee profiles
        const users = await User.find({}).select('email firstName lastName role _id');

        console.log('📋 All Users and their Employee Profile Status:\n');
        console.log('='.repeat(80));

        for (const user of users) {
            const employee = await Employee.findOne({ userId: user._id });

            console.log(`\n👤 ${user.email}`);
            console.log(`   Name: ${user.firstName} ${user.lastName}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   User ID: ${user._id}`);

            if (employee) {
                console.log(`   ✅ Employee Profile: ${employee.firstName} ${employee.lastName}`);
                console.log(`   📧 Employee Email: ${employee.email}`);
                console.log(`   🏢 Department: ${employee.department}`);
                console.log(`   🆔 Employee ID: ${employee._id}`);
            } else {
                console.log(`   ❌ NO EMPLOYEE PROFILE LINKED`);
            }
        }

        console.log('\n' + '='.repeat(80));
        console.log('\n💡 If you just linked profiles, please:');
        console.log('   1. Log out from the application');
        console.log('   2. Log back in');
        console.log('   3. Try creating a task again\n');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkCurrentUser();
