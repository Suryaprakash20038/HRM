const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./src/models/User/User');
const Notification = require('./src/models/Notification/Notification');

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const userId = '69366647d8a9fc128059566d';
        const user = await User.findById(userId);

        if (user) {
            console.log('\n✅ User with birthday today:');
            console.log('  Email:', user.email);
            console.log('  Role:', user.role);
            console.log('  Name:', user.firstName, user.lastName);

            const notifs = await Notification.find({ userId: user._id, type: 'birthday' });
            console.log('\n🎂 Birthday Notifications:', notifs.length);
            notifs.forEach(n => {
                console.log('  -', n.title);
                console.log('    Message:', n.message.substring(0, 50) + '...');
                console.log('    Created:', n.createdAt);
            });
        } else {
            console.log('❌ User not found');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
