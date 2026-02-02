const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./src/models/User/User');
const Employee = require('./src/models/Employee/Employee');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB.');

        const users = await User.find({}).select('+password');
        let matchFound = false;

        console.log('\n--- Credentials Check (Password: BANKAI18) ---');
        for (const user of users) {
            const isMatch = await bcrypt.compare('BANKAI18', user.password);
            if (isMatch) {
                console.log(`[MATCH] Email: ${user.email} | Role: ${user.role} | Active: ${user.isActive} | UserID: ${user._id}`);
                matchFound = true;
            }
        }

        if (!matchFound) {
            console.log('No user found with password "BANKAI18".');
        }

        console.log('\n--- Admin Users ---');
        users.filter(u => u.role === 'admin').forEach(u => {
            console.log(`Email: ${u.email} | Active: ${u.isActive}`);
        });

        console.log('\n--- Employees ---');
        const employees = await Employee.find({});
        employees.slice(0, 5).forEach(emp => { // Just show first 5
            console.log(`Name: ${emp.firstName} ${emp.lastName} | ID: ${emp.employeeId} | Email: ${emp.email} | UserID: ${emp.userId}`);
        });
        if (employees.length > 5) console.log(`... and ${employees.length - 5} more employees.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

run();
