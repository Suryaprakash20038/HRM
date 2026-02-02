const Media = require('../../models/Media/Media');
const Employee = require('../../models/Employee/Employee');
const User = require('../../models/User/User');
const { sendNotification } = require('../../services/notification.service');

// Create a new post
exports.createPost = async (req, res) => {
    try {
        const { platform, postLink, description } = req.body;

        // Find employee associated with the logged-in user
        const employee = await Employee.findOne({ userId: req.user.id });
        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found' });
        }

        const newPost = new Media({
            employee: employee._id,
            platform,
            postLink,
            description,
            image: req.file ? req.file.path : null // Save image path if uploaded
        });

        await newPost.save();

        // Notify Admins
        try {
            // Find Admins
            const admins = await User.find({ role: 'admin' });
            for (const admin of admins) {
                await sendNotification({
                    userId: admin._id,
                    title: 'New Media Post',
                    message: `${employee.firstName} ${employee.lastName} posted new media content.`,
                    type: 'info',
                    link: '/media'
                });
            }
        } catch (err) {
            console.error('Failed to notify admins of media post', err);
        }

        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all posts (for Admin)
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Media.find()
            .populate('employee', 'firstName lastName email department')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get my posts (for Employee)
exports.getMyPosts = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user.id });
        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found' });
        }

        const posts = await Media.find({ employee: employee._id })
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        console.error('Error fetching my posts:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get stats (posts per employee for current month)
exports.getStats = async (req, res) => {
    try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const stats = await Media.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfMonth }
                }
            },
            {
                $group: {
                    _id: '$employee',
                    postCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'employees',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'employeeDetails'
                }
            },
            {
                $unwind: '$employeeDetails'
            },
            {
                $project: {
                    _id: 1,
                    postCount: 1,
                    firstName: '$employeeDetails.firstName',
                    lastName: '$employeeDetails.lastName',
                    department: '$employeeDetails.department'
                }
            },
            {
                $sort: { postCount: -1 }
            }
        ]);

        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a single post (Admin only)
exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await Media.findByIdAndDelete(id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete all posts (Admin only - for monthly cleanup)
exports.deleteAllPosts = async (req, res) => {
    try {
        const result = await Media.deleteMany({});

        res.json({
            message: 'All posts deleted successfully',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error deleting all posts:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
