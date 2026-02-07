const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./src/models/User/User');

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const userId = '69366647d8a9fc128059566d';
        const user = await User.findById(userId);

        if (user) {
            console.log('\n🎂 BIRTHDAY USER LOGIN INFO:\n');
            console.log('Email:', user.email);
            console.log('Role:', user.role);
            console.log('\n✅ Login with this email to see the birthday banner, notification, and chat message!');
        } else {
            console.log('User not found');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
