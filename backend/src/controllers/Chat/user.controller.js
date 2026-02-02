const User = require('../../models/User/User');

class UserController {
    // Search users for chat
    async searchUsers(req, res) {
        try {
            const { q, role, department } = req.query;
            const currentUserId = req.user._id;

            if (!q || q.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query must be at least 2 characters'
                });
            }

            const query = {
                _id: { $ne: currentUserId }, // Exclude current user
                isActive: true
            };

            // Add text search
            const searchRegex = new RegExp(q, 'i');
            query.$or = [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { email: searchRegex }
            ];

            // Add filters
            if (role) {
                query.role = role;
            }

            if (department) {
                query.department = department;
            }

            const users = await User.find(query)
                .select('firstName lastName email profilePicture role department isOnline lastSeen')
                .limit(20)
                .lean();

            res.status(200).json({
                success: true,
                data: { users }
            });
        } catch (error) {
            console.error('Search users error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to search users'
            });
        }
    }

    // Get online users
    async getOnlineUsers(req, res) {
        try {
            const users = await User.find({
                isOnline: true,
                isActive: true
            })
                .select('firstName lastName email profilePicture role department')
                .lean();

            res.status(200).json({
                success: true,
                data: { users }
            });
        } catch (error) {
            console.error('Get online users error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch online users'
            });
        }
    }

    // Get all users (for chat)
    async getAllUsers(req, res) {
        try {
            const currentUserId = req.user._id;

            const users = await User.find({
                _id: { $ne: currentUserId },
                isActive: true
            })
                .select('firstName lastName email profilePicture role department isOnline lastSeen')
                .sort({ firstName: 1 })
                .lean();

            res.status(200).json({
                success: true,
                data: { users }
            });
        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch users'
            });
        }
    }
}

module.exports = new UserController();
