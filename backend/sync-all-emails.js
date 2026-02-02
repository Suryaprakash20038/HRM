// Sync ALL Employee Emails with User Emails
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User/User');
const Employee = require('./src/models/Employee/Employee');

async function syncAllEmails() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const users = await User.find({ role: 'employee' });
        console.log(`Found ${users.length} employee users\n`);

        const employees = await Employee.find({});
        console.log(`Found ${employees.length} employee records\n`);

        console.log('Current state:');
        console.log('─'.repeat(80));

        for (const emp of employees) {
            console.log(`Employee: ${emp.firstName} ${emp.lastName} (${emp.employeeId})`);
            console.log(`  Current email: ${emp.email || 'NO EMAIL'}`);

            // Try to find matching user by name
            const matchingUser = users.find(u =>
                u.firstName.toLowerCase().includes(emp.firstName.toLowerCase()) ||
                emp.firstName.toLowerCase().includes(u.firstName.toLowerCase())
            );

            if (matchingUser) {
                console.log(`  Matching user: ${matchingUser.firstName} ${matchingUser.lastName} (${matchingUser.email})`);

                if (emp.email !== matchingUser.email) {
                    console.log(`  🔧 Updating email from "${emp.email}" to "${matchingUser.email}"`);
                    emp.email = matchingUser.email;
                    await emp.save();
                    console.log(`  ✅ Updated!`);
                } else {
                    console.log(`  ✅ Already matches`);
                }
            } else {
                console.log(`  ⚠️  No matching user found`);
            }
            console.log('');
        }

        console.log('─'.repeat(80));
        console.log('\n✅ Sync complete!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected');
        process.exit(0);
    }
}

syncAllEmails();
