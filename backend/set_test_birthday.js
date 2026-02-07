const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Employee = require('./src/models/Employee/Employee');

const setTestBirthday = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Set Surya Prakash's birthday to today (Feb 6) for testing
        // Use UTC to avoid timezone issues with MongoDB aggregation
        const testDOB = new Date(Date.UTC(1995, 1, 6, 0, 0, 0)); // Feb 6, 1995 UTC

        const result = await Employee.findOneAndUpdate(
            { firstName: 'Surya Prakash' },
            { dateOfBirth: testDOB },
            { new: true }
        );


        if (result) {
            const today = new Date();
            console.log(`✅ Updated ${result.firstName} ${result.lastName}'s DOB to: ${testDOB.toISOString()}`);
            console.log(`   Month/Day in DB will be: 2/6`);
            console.log(`   Today is: ${today.toLocaleDateString()}`);
        } else {
            console.log('❌ Employee not found');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

setTestBirthday();
