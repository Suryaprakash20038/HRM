const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Employee = require('./src/models/Employee/Employee');

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const emp = await Employee.findOne({ firstName: 'Surya Prakash' });
        console.log('\nSurya Prakash DOB:', emp.dateOfBirth);
        console.log('Type:', typeof emp.dateOfBirth);
        console.log('As Date:', new Date(emp.dateOfBirth));

        const dob = new Date(emp.dateOfBirth);
        console.log('\nExtracted:');
        console.log('  Month (getMonth):', dob.getMonth()); // 0-indexed
        console.log('  Month +1:', dob.getMonth() + 1);
        console.log('  Day:', dob.getDate());

        const today = new Date();
        console.log('\nToday:');
        console.log('  Month:', today.getMonth() + 1);
        console.log('  Day:', today.getDate());

        // Test aggregation
        const result = await Employee.aggregate([
            {
                $match: { firstName: 'Surya Prakash' }
            },
            {
                $project: {
                    firstName: 1,
                    dateOfBirth: 1,
                    month: { $month: "$dateOfBirth" },
                    day: { $dayOfMonth: "$dateOfBirth" }
                }
            }
        ]);

        console.log('\nAggregation result:', JSON.stringify(result, null, 2));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debug();
