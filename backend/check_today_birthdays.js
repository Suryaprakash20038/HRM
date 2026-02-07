const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Employee = require('./src/models/Employee/Employee');

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();

        console.log(`\nChecking for birthdays on ${currentMonth}/${currentDay}\n`);

        const birthdayEmployees = await Employee.aggregate([
            {
                $project: {
                    userId: 1,
                    firstName: 1,
                    lastName: 1,
                    isActive: 1,
                    dateOfBirth: 1,
                    month: { $month: "$dateOfBirth" },
                    day: { $dayOfMonth: "$dateOfBirth" }
                }
            },
            {
                $match: {
                    isActive: true,
                    userId: { $exists: true },
                    month: currentMonth,
                    day: currentDay
                }
            }
        ]);

        console.log(`Found ${birthdayEmployees.length} employees with birthdays today:\n`);
        birthdayEmployees.forEach(emp => {
            console.log(`  - ${emp.firstName} ${emp.lastName || ''}`);
            console.log(`    DOB: ${emp.dateOfBirth}`);
            console.log(`    UserID: ${emp.userId}`);
            console.log('');
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
