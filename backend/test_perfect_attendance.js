const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Attendance = require('./src/models/Attendance/Attendance');
const Employee = require('./src/models/Employee/Employee');
const Notification = require('./src/models/Notification/Notification');
const User = require('./src/models/User/User');
const Conversation = require('./src/models/Chat/Conversation');
const Message = require('./src/models/Chat/Message');

const testPerfectAttendance = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB\n');

        // Get previous month date range
        const now = new Date();
        const previousMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const previousYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

        const startDate = new Date(previousYear, previousMonth, 1);
        const endDate = new Date(previousYear, previousMonth + 1, 0, 23, 59, 59, 999);

        console.log(`Checking attendance for ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}\n`);

        // Calculate total working days (Mon-Fri)
        let totalWorkingDays = 0;
        let d = new Date(startDate);
        while (d <= endDate) {
            const day = d.getDay();
            if (day !== 0 && day !== 6) {
                totalWorkingDays++;
            }
            d.setDate(d.getDate() + 1);
        }

        console.log(`Total working days: ${totalWorkingDays}\n`);

        // Get attendance stats per employee
        const attendanceStats = await Attendance.aggregate([
            {
                $match: {
                    date: { $gte: startDate, $lte: endDate },
                    status: { $in: ['Present', 'Late'] }
                }
            },
            {
                $group: {
                    _id: "$employee",
                    presentDays: { $sum: 1 }
                }
            }
        ]);

        console.log(`Found ${attendanceStats.length} employees with attendance records\n`);

        // Find employees with 100% attendance
        const perfectAttendanceEmployees = [];
        for (const stat of attendanceStats) {
            if (stat.presentDays >= totalWorkingDays) {
                const emp = await Employee.findById(stat._id).populate('userId');
                if (emp && emp.userId && emp.isActive) {
                    perfectAttendanceEmployees.push({
                        employee: emp,
                        presentDays: stat.presentDays
                    });
                }
            }
        }

        console.log(`Found ${perfectAttendanceEmployees.length} employees with 100% attendance:\n`);
        perfectAttendanceEmployees.forEach(({ employee, presentDays }) => {
            console.log(`  - ${employee.firstName} ${employee.lastName}: ${presentDays}/${totalWorkingDays} days`);
        });

        // Send encouragement to each employee
        for (const { employee, presentDays } of perfectAttendanceEmployees) {
            try {
                console.log(`\nSending encouragement to ${employee.firstName} ${employee.lastName}...`);

                // Create notification
                await Notification.create({
                    userId: employee.userId._id,
                    title: '🏆 Perfect Attendance Achievement!',
                    message: `Congratulations, ${employee.firstName}! 🎉\n\nYou achieved 100% attendance last month (${presentDays}/${totalWorkingDays} days).\n\nYour dedication and commitment are truly appreciated. Keep up the excellent work!\n\n- HRM Team`,
                    type: 'perfect_attendance',
                    isRead: false
                });

                console.log(`  ✅ Notification created`);

                // Send chat message
                const systemSender = await User.findOne({ role: 'admin', isActive: true });
                if (systemSender) {
                    let conversation = await Conversation.findOne({
                        type: 'direct',
                        'participants.userId': { $all: [systemSender._id, employee.userId._id] }
                    });

                    if (!conversation) {
                        conversation = await Conversation.create({
                            type: 'direct',
                            participants: [
                                { userId: systemSender._id, role: 'member' },
                                { userId: employee.userId._id, role: 'member' }
                            ],
                            createdBy: systemSender._id,
                            isActive: true
                        });
                    }

                    await Message.create({
                        conversationId: conversation._id,
                        senderId: systemSender._id,
                        messageType: 'text',
                        content: `🏆 Congratulations, ${employee.firstName}!\n\nYou achieved 100% attendance last month! Your dedication is truly inspiring. Keep up the excellent work!\n\n- HRM Team`,
                        status: { sent: true }
                    });

                    await Conversation.findByIdAndUpdate(conversation._id, { lastMessageAt: new Date() });
                    console.log(`  ✅ Chat message sent`);
                }
            } catch (err) {
                console.error(`  ❌ Failed:`, err.message);
            }
        }

        console.log('\n✅ Perfect Attendance Test Complete!');
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

testPerfectAttendance();
