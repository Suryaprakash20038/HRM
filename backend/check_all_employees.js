const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Employee = require('./src/models/Employee/Employee');

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Get ALL employees, check their DOB
        const allEmployees = await Employee.find({}).select('firstName lastName dateOfBirth isActive userId');

        console.log('\n=== ALL EMPLOYEES ===\n');
        allEmployees.forEach(emp => {
            const dob = emp.dateOfBirth ? new Date(emp.dateOfBirth) : null;
            const month = dob ? dob.getMonth() + 1 : 'N/A';
            const day = dob ? dob.getDate() : 'N/A';

            console.log(`${emp.firstName} ${emp.lastName || ''}`);
            console.log(`  DOB: ${emp.dateOfBirth}`);
            console.log(`  Month/Day: ${month}/${day}`);
            console.log(`  Active: ${emp.isActive}`);
            console.log(`  Has UserID: ${!!emp.userId}`);
            console.log('');
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
