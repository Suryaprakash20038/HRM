const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Employee = require('./src/models/Employee/Employee');

const fix = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected\n');

        // Set to Feb 6 at noon UTC to avoid any timezone edge cases
        const testDOB = new Date(Date.UTC(1995, 1, 6, 12, 0, 0));

        const result = await Employee.findOneAndUpdate(
            { firstName: 'Surya Prakash' },
            { dateOfBirth: testDOB },
            { new: true }
        );

        if (result) {
            console.log(`✅ Updated: ${result.firstName} ${result.lastName}`);
            console.log(`   DOB set to: ${testDOB.toISOString()}`);
            console.log(`   DOB in DB: ${result.dateOfBirth}`);

            // Test aggregation
            const dob = new Date(result.dateOfBirth);
            console.log(`\n   JS getMonth(): ${dob.getMonth() + 1}`);
            console.log(`   JS getDate(): ${dob.getDate()}`);

            // Test MongoDB aggregation
            const agg = await Employee.aggregate([
                { $match: { _id: result._id } },
                {
                    $project: {
                        firstName: 1,
                        month: { $month: "$dateOfBirth" },
                        day: { $dayOfMonth: "$dateOfBirth" }
                    }
                }
            ]);

            console.log(`\n   MongoDB $month: ${agg[0].month}`);
            console.log(`   MongoDB $dayOfMonth: ${agg[0].day}`);
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fix();
