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

        console.log(`\nToday's Date: ${currentMonth}/${currentDay}/${today.getFullYear()}\n`);

        // Get all employees with their DOB
        const allEmployees = await Employee.find({ isActive: true }).select('firstName lastName dateOfBirth userId');

        console.log('All Active Employees:');
        allEmployees.forEach(emp => {
            if (emp.dateOfBirth) {
                const dob = new Date(emp.dateOfBirth);
                const empMonth = dob.getMonth() + 1;
                const empDay = dob.getDate();
                const isBirthday = (empMonth === currentMonth && empDay === currentDay);
                console.log(`  ${emp.firstName} ${emp.lastName}: ${empMonth}/${empDay} ${isBirthday ? '🎂 BIRTHDAY TODAY!' : ''}`);
            } else {
                console.log(`  ${emp.firstName} ${emp.lastName}: No DOB set`);
            }
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
