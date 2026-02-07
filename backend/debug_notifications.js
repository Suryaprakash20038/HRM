const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Notification = require('./src/models/Notification/Notification');
const Employee = require('./src/models/Employee/Employee');
const User = require('./src/models/User/User');

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB\n');

        // Check Surya Prakash's data
        const emp = await Employee.findOne({ firstName: 'Surya Prakash' }).populate('userId');
        if (!emp) {
            console.log('❌ Employee not found');
            process.exit(1);
        }

        console.log('Employee Info:');
        console.log('  Name:', emp.firstName, emp.lastName);
        console.log('  DOB:', emp.dateOfBirth);
        console.log('  UserId:', emp.userId?._id);
        console.log('  User Email:', emp.userId?.email);

        // Check notifications
        const notifications = await Notification.find({
            userId: emp.userId._id,
            type: 'birthday'
        }).sort({ createdAt: -1 });

        console.log('\nBirthday Notifications:', notifications.length);
        notifications.forEach(n => {
            console.log('  -', n.title, '| Created:', n.createdAt, '| Read:', n.isRead);
        });

        // Check all notifications for this user
        const allNotifs = await Notification.find({ userId: emp.userId._id }).sort({ createdAt: -1 }).limit(5);
        console.log('\nAll Recent Notifications:', allNotifs.length);
        allNotifs.forEach(n => {
            console.log('  -', n.type, '|', n.title, '| Read:', n.isRead);
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debug();
