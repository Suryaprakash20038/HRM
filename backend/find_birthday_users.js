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

        // Find the user with birthday notification
        const birthdayNotifs = await Notification.find({ type: 'birthday' }).populate('userId');

        output += '=== USERS WITH BIRTHDAY NOTIFICATIONS ===\n\n';

        for (const notif of birthdayNotifs) {
            if (notif.userId) {
                const emp = await Employee.findOne({ userId: notif.userId._id });
                output += `Employee: ${emp?.firstName || 'Unknown'} ${emp?.lastName || ''}\n`;
                output += `Login Email: ${notif.userId.email}\n`;
                output += `Role: ${notif.userId.role}\n`;
                output += `Notification: ${notif.title}\n`;
                output += `Created: ${notif.createdAt}\n`;
                output += '\n';
            }
        }

        fs.writeFileSync('birthday_users.txt', output);
        console.log(output);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
