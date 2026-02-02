const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Employee = require('../src/models/Employee/Employee');
const User = require('../src/models/User/User');

const sync = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const employees = await Employee.find({ profileImage: { $exists: true, $ne: null } });
        console.log(`Found ${employees.length} employees with profile images.`);

        let count = 0;
        for (const emp of employees) {
            if (emp.userId && emp.profileImage) {
                const user = await User.findById(emp.userId);
                if (user) {
                    user.profilePicture = emp.profileImage;
                    await user.save();
                    count++;
                }
            }
        }

        console.log(`Synced ${count} user profiles.`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

sync();
