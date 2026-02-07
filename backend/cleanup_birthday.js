const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Notification = require('./src/models/Notification/Notification');
const Message = require('./src/models/Chat/Message');

const cleanup = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // Delete all birthday notifications
        const notifResult = await Notification.deleteMany({ type: 'birthday' });
        console.log(`Deleted ${notifResult.deletedCount} birthday notifications.`);

        // Delete all birthday chat messages
        const msgResult = await Message.deleteMany({
            content: { $regex: 'Happy Birthday', $options: 'i' }
        });
        console.log(`Deleted ${msgResult.deletedCount} birthday chat messages.`);

        console.log('Cleanup complete!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

cleanup();
