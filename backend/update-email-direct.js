// Update muthu employee email - bypass validation
require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./src/models/Employee/Employee');

async function updateEmail() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Update directly without validation
        const result = await Employee.updateOne(
            { firstName: /muthu/i },
            { $set: { email: 'muthu@gmail.com' } }
        );

        console.log('Update result:', result);

        if (result.modifiedCount > 0) {
            console.log('✅ Email updated successfully!');

            // Verify
            const employee = await Employee.findOne({ email: 'muthu@gmail.com' });
            if (employee) {
                console.log(`\nVerified: ${employee.firstName} ${employee.lastName} - ${employee.email}`);
            }
        } else if (result.matchedCount > 0) {
            console.log('✅ Email already correct!');
        } else {
            console.log('❌ No employee found');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected');
        process.exit(0);
    }
}

updateEmail();
