const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config();
if (!process.env.MONGODB_URI) {
    // If not loaded, try path
    dotenv.config({ path: path.join(__dirname, '.env') });
}

const Notification = require('./src/models/Notification/Notification');
const Employee = require('./src/models/Employee/Employee');

const trigger = async () => {
    try {
        console.log('Connecting to DB...', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // Find employees with birthday TODAY (matching day and month)
        const today = new Date();
        const currentMonth = today.getMonth() + 1; // 1-12
        const currentDay = today.getDate(); // 1-31

        const employees = await Employee.aggregate([
            {
                $project: {
                    userId: 1,
                    firstName: 1,
                    lastName: 1,
                    isActive: 1,
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

        console.log(`Found ${employees.length} employees with birthday TODAY (${currentMonth}/${currentDay}).`);

        for (const emp of employees) {
            console.log(`Sending wish to: ${emp.firstName} (User: ${emp.userId})`);

            // Check if exists
            const exists = await Notification.findOne({
                userId: emp.userId,
                type: 'birthday'
            });

            if (exists) {
                console.log(' - Already exists, deleting old one to refresh...');
                await Notification.deleteOne({ _id: exists._id });
            }

            await Notification.create({
                userId: emp.userId,
                title: '🎉 Happy Birthday!',
                message: `Happy Birthday, ${emp.firstName}! 🎂\nWishing you a fantastic day filled with joy, success, and happiness.\n\nBest Wishes,\nYour HRM Team`,
                type: 'birthday',
                isRead: false,
                createdAt: new Date()
            });
            console.log(' - Sent Notification!');

            // CHAT
            try {
                const User = require('./src/models/User/User');
                const Conversation = require('./src/models/Chat/Conversation');
                const Message = require('./src/models/Chat/Message');

                const systemSender = await User.findOne({ role: 'admin', isActive: true });
                if (systemSender) {
                    let conversation = await Conversation.findOne({
                        type: 'direct',
                        'participants.userId': { $all: [systemSender._id, emp.userId] }
                    });
                    if (!conversation) {
                        // Fix: Use create with correct structure if not found
                        // Since User/Conversation models might have strict schemas, ensure fields exist.
                        conversation = await Conversation.create({
                            type: 'direct',
                            participants: [
                                { userId: systemSender._id, role: 'member' },
                                { userId: emp.userId, role: 'member' }
                            ],
                            createdBy: systemSender._id,
                            isActive: true
                        });
                    }

                    await Message.create({
                        conversationId: conversation._id,
                        senderId: systemSender._id,
                        messageType: 'text',
                        content: `🎉 Happy Birthday, ${emp.firstName}! 🎂\n\nWishing you a wonderful year ahead!\n- HRM Team`,
                        status: { sent: true }
                    });

                    await Conversation.findByIdAndUpdate(conversation._id, { lastMessageAt: new Date() });
                    console.log(' - Sent Chat Message!');
                }
            } catch (err) {
                console.error(' - Chat Error:', err.message);
            }
        }

        console.log('Done.');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

trigger();
