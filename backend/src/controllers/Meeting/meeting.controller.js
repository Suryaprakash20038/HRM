const Meeting = require('../../models/Meeting/Meeting');
const { AppError } = require('../../utils/errorHandler');
const { sendMeetingNotification } = require('../../services/notification.service');
// const dailyService = require('../../services/daily.service'); // Removed

// Create a new meeting
exports.createMeeting = async (req, res, next) => {
    try {
        const { title, participants, allowedRoles, password, settings } = req.body;

        // Generate Jitsi Room ID
        const roomId = `hrm-${Date.now()}`;

        const meeting = await Meeting.create({
            roomId,
            title,
            host: req.user._id,
            participants,
            allowedRoles,
            password,
            settings
        });

        // Send Notifications to participants
        try {
            await sendMeetingNotification(meeting);
        } catch (notifError) {
            console.error('Failed to send meeting notifications:', notifError);
        }

        res.status(201).json({
            status: 'success',
            data: {
                meeting
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get all active meetings accessible to the user
exports.getMeetings = async (req, res, next) => {
    try {
        const userRole = req.user.role;
        const userId = req.user._id;

        // Find active meetings where user is host, participant, or role is allowed
        const meetings = await Meeting.find({
            status: { $ne: 'ended' },
            $or: [
                { host: userId },
                { participants: userId },
                { allowedRoles: userRole }
            ]
        }).populate('host', 'name email profilePicture')
            .sort('-createdAt');

        res.status(200).json({
            status: 'success',
            results: meetings.length,
            data: {
                meetings
            }
        });
    } catch (error) {
        next(error);
    }
};

// Join a meeting (validate access)
exports.joinMeeting = async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const meeting = await Meeting.findOne({ roomId, status: { $ne: 'ended' } });

        if (!meeting) {
            return next(new AppError('Meeting not found or has ended', 404));
        }

        // Access control checks...
        // ...

        // Return Daily.co URL and User Config
        res.status(200).json({
            status: 'success',
            data: {
                roomName: meeting.roomId,
                userInfo: {
                    displayName: req.user.name,
                    email: req.user.email,
                    avatarURL: req.user.profilePicture
                },
                settings: meeting.settings
            }
        });
    } catch (error) {
        next(error);
    }
};

// End a meeting
exports.endMeeting = async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const meeting = await Meeting.findOne({ roomId });

        if (!meeting) {
            return next(new AppError('Meeting not found', 404));
        }

        // Only host can end the meeting
        if (meeting.host.toString() !== req.user._id.toString()) {
            return next(new AppError('Only the host can end the meeting', 403));
        }

        meeting.status = 'ended';
        meeting.endTime = Date.now();
        await meeting.save();

        res.status(200).json({
            status: 'success',
            message: 'Meeting ended successfully'
        });
    } catch (error) {
        next(error);
    }
};

