const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const User = require('./src/models/User/User');
const Employee = require('./src/models/Employee/Employee');
const Notification = require('./src/models/Notification/Notification');

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        let output = '';

        // Find employee with birthday today
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();

        const birthdayEmployees = await Employee.aggregate([
            {
                $project: {
                    userId: 1,
                    firstName: 1,
                    lastName: 1,
                    email: 1,
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

        output += `Found ${birthdayEmployees.length} employees with birthdays today:\n\n`;

        for (const emp of birthdayEmployees) {
            const user = await User.findById(emp.userId);
            if (user) {
                output += `Employee: ${emp.firstName} ${emp.lastName || ''}\n`;
                output += `Login Email: ${user.email}\n`;
                output += `Role: ${user.role}\n`;
                output += `Password: (use the password you set for this user)\n\n`;

                const notifs = await Notification.find({ userId: user._id, type: 'birthday' });
                output += `Birthday Notifications: ${notifs.length}\n`;
                notifs.forEach(n => {
                    output += `  - ${n.title}\n`;
                    output += `    Created: ${n.createdAt}\n`;
                });
                output += '\n';
            }
        }

        fs.writeFileSync('birthday_login_info.txt', output);
        console.log(output);
        console.log('✅ Info saved to birthday_login_info.txt');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
