const Meeting = require('../../models/Meeting/Meeting');
const { AppError } = require('../../utils/errorHandler');
const { sendMeetingNotification } = require('../../services/notification.service');

// Create a new meeting
exports.createMeeting = async (req, res, next) => {
    try {
        const { title, participants, allowedRoles, password, settings } = req.body;

        // Generate a unique room ID (could be UUID or simple random string)
        const roomId = `meet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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
            // Don't fail the meeting creation if notification fails
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
            return res.status(404).json({
                status: 'error',
                message: 'Meeting not found or has ended'
            });
        }

        // Check access
        const canAccess =
            meeting.host.equals(req.user._id) ||
            meeting.participants.includes(req.user._id) ||
            meeting.allowedRoles.includes(req.user.role);

        if (!canAccess) {
            return res.status(403).json({
                status: 'error',
                message: 'You are not authorized to join this meeting'
            });
        }

        // Return config for Jitsi
        res.status(200).json({
            status: 'success',
            data: {
                roomName: meeting.roomId,
                userInfo: {
                    displayName: req.user.name,
                    email: req.user.email,
                    avatarURL: req.user.profilePicture
                },
                configOverwrite: {
                    startWithAudioMuted: meeting.settings.startWithAudioMuted,
                    startWithVideoMuted: meeting.settings.startWithVideoMuted
                }
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
            return res.status(404).json({
                status: 'error',
                message: 'Meeting not found'
            });
        }

        // Only host can end the meeting
        if (!meeting.host.equals(req.user._id)) {
            return res.status(403).json({
                status: 'error',
                message: 'Only the host can end the meeting'
            });
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
