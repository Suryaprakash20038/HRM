const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./src/models/User/User');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB.');

        // 1. Find Admin
        let admin = await User.findOne({ role: 'admin' });

        if (admin) {
            console.log(`Found Admin: ${admin.email}`);
            // Reset password
            admin.password = 'BANKAI18';
            await admin.save();
            console.log('Admin password reset to: BANKAI18');
        } else {
            console.log('No Admin found. Creating one...');
            admin = await User.create({
                firstName: 'Super',
                lastName: 'Admin',
                email: 'admin@hrm.com',
                password: 'BANKAI18',
                role: 'admin',
                isActive: true
            });
            console.log(`Admin created: admin@hrm.com / BANKAI18`);
        }

        // 2. Find "BANKAI18" user just to be sure
        const users = await User.find({}).select('+password');
        for (const u of users) {
            const m = await bcrypt.compare('BANKAI18', u.password);
            if (m) console.log(`User with password 'BANKAI18': ${u.email} (${u.role})`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

run();
