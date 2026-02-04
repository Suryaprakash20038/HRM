const User = require('../../models/User/User');
const Employee = require('../../models/Employee/Employee');
const authConfig = require('../../config/auth');
const { successResponse, errorResponse } = require('../../utils/response');
const logger = require('../../utils/logger');

// Register new user
exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return errorResponse(res, 'Email already registered', 400);
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            role: (role || 'employee').toLowerCase()
        });

        // Get employee profile if exists
        const employee = await Employee.findOne({ userId: user._id });
        const tokenPayload = { id: user._id, role: user.role, email: user.email };
        if (employee) {
            tokenPayload.employeeId = employee._id;
        }

        const token = authConfig.generateToken(tokenPayload);
        const refreshToken = authConfig.generateRefreshToken({ id: user._id });

        user.refreshToken = refreshToken;
        await user.save();

        logger.info(`New user registered: ${email}`);

        return successResponse(res, {
            user: user.toJSON(),
            token,
            refreshToken
        }, 'User registered successfully', 201);

    } catch (error) {
        logger.error('Registration error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const loginInput = email;

        let user = await User.findOne({ email: loginInput }).select('+password');
        if (!user) {
            // Try finding by Employee ID
            const employee = await Employee.findOne({ employeeId: loginInput });
            if (employee && employee.userId) {
                user = await User.findById(employee.userId).select('+password');
            }
        }

        if (!user) {
            return errorResponse(res, 'Invalid email/ID or password', 401);
        }

        const { loginAs } = req.body;
        if (loginAs) {
            const employeeRoles = ['employee', 'teamlead', 'manager'];
            const isEmployeeRole = employeeRoles.includes(user.role);

            if (loginAs === 'employee') {
                // Allow everyone to login as employee (Context: Self-Service)
                // Or restrict if there are special "system" users. 
                // For now, allow HR/Admin/MD to access employee panel too.
            }
            if (loginAs === 'admin' && isEmployeeRole) {
                return errorResponse(res, 'Access denied. You do not have Admin privileges.', 403);
            }
        }

        if (!user.isActive) {
            return errorResponse(res, 'Account is deactivated', 401);
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return errorResponse(res, 'Invalid email or password', 401);
        }

        // Fetch employee details for token
        let employee = await Employee.findOne({ userId: user._id }).populate('shift');

        // If no employee linked by userId, try to find and link by email
        if (!employee) {
            employee = await Employee.findOne({ email: user.email }).populate('shift');

            if (employee && !employee.userId) {
                // Auto-link the employee profile to this user
                await Employee.updateOne(
                    { _id: employee._id },
                    { $set: { userId: user._id } }
                );
                logger.info(`Auto-linked employee profile for user: ${email}`);
            }
        }

        const tokenPayload = { id: user._id, role: user.role, email: user.email };
        if (employee) {
            tokenPayload.employeeId = employee._id;
        }

        const token = authConfig.generateToken(tokenPayload);
        const refreshToken = authConfig.generateRefreshToken({ id: user._id });

        user.lastLogin = new Date();
        user.refreshToken = refreshToken;
        await user.save();

        // Employee details already fetched above for token
        const userData = user.toJSON();

        if (employee) {
            userData.employeeId = employee.employeeId;
            userData.profileImage = employee.profileImage;
            userData.employeeProfileId = employee._id;
            userData.department = employee.department;
            userData.shift = employee.shift;
            userData.position = employee.position;
            userData.domain = employee.domain;
        }

        logger.info(`User logged in: ${email}`);

        return successResponse(res, {
            user: userData,
            token,
            refreshToken
        }, 'Login successful');

    } catch (error) {
        logger.error('Login error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        // Fetch employee details
        let employee = await Employee.findOne({ userId: user._id }).populate('shift');

        // Fallback: try finding by email
        if (!employee) {
            // Exact match lookup as per Project module
            employee = await Employee.findOne({ email: user.email }).populate('shift');
        }

        const userData = user.toJSON();

        if (employee) {
            userData.employeeId = employee.employeeId;
            userData.profileImage = employee.profileImage;
            userData.employeeProfileId = employee._id;
            userData.department = employee.department;
            userData.shift = employee.shift;
            userData.position = employee.position;
            userData.domain = employee.domain;
        }

        return successResponse(res, { user: userData }, 'User retrieved successfully');

    } catch (error) {
        logger.error('Get current user error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// Refresh token
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return errorResponse(res, 'Refresh token is required', 400);
        }

        const decoded = authConfig.verifyRefreshToken(refreshToken);

        const user = await User.findById(decoded.id).select('+refreshToken');
        if (!user || user.refreshToken !== refreshToken) {
            return errorResponse(res, 'Invalid refresh token', 401);
        }

        // Get employee profile for token
        const employee = await Employee.findOne({ userId: user._id });
        const tokenPayload = { id: user._id, role: user.role, email: user.email };
        if (employee) {
            tokenPayload.employeeId = employee._id;
        }

        const newToken = authConfig.generateToken(tokenPayload);
        const newRefreshToken = authConfig.generateRefreshToken({ id: user._id });

        user.refreshToken = newRefreshToken;
        await user.save();

        return successResponse(res, {
            token: newToken,
            refreshToken: newRefreshToken
        }, 'Token refreshed successfully');

    } catch (error) {
        logger.error('Refresh token error:', error);
        return errorResponse(res, 'Invalid refresh token', 401);
    }
};

// Logout user
exports.logout = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return successResponse(res, null, 'Logout successful');
        }

        const user = await User.findById(req.user.id);
        if (user) {
            user.refreshToken = null;
            await user.save();
        }

        return successResponse(res, null, 'Logout successful');

    } catch (error) {
        logger.error('Logout error:', error);
        // Even if error, return success to client to clear local state
        return successResponse(res, null, 'Logout successful');
    }
};

// Forgot Password - Send OTP
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return errorResponse(res, 'Email not registered', 404);
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // DEV LOG for testing
        console.log('================================================');
        console.log('RESET PASSWORD OTP:', otp);
        console.log('================================================');

        // Save OTP to DB (valid for 5 minutes)
        user.resetPasswordOtp = otp;
        user.resetPasswordOtpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
        await user.save();

        // Send Email
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Standard gmail service
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP - HRM System',
            text: `Your OTP for password reset is: ${otp}\n\nThis OTP is valid for 5 minutes.`
        };

        await transporter.sendMail(mailOptions);

        return successResponse(res, null, 'OTP sent successfully to your email');

    } catch (error) {
        // Log detailed error for debugging
        logger.error('Forgot password error:', error);

        // Return friendly error message (hide internal details in prod, but show for debug if needed)
        // If email fails, it often throws specific errors
        if (error.code === 'EAUTH') {
            return errorResponse(res, 'Email configuration error. Please contact admin.', 500);
        }

        return errorResponse(res, error.message || 'Failed to send OTP', 500);
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Select hidden fields
        const user = await User.findOne({ email }).select('+resetPasswordOtp +resetPasswordOtpExpires');

        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp) {
            return errorResponse(res, 'Invalid OTP', 400);
        }

        if (user.resetPasswordOtpExpires < Date.now()) {
            return errorResponse(res, 'OTP has expired', 400);
        }

        return successResponse(res, null, 'OTP verified successfully');

    } catch (error) {
        logger.error('Verify OTP error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        user.password = password; // Will be hashed by pre-save hook
        user.resetPasswordOtp = undefined;
        user.resetPasswordOtpExpires = undefined;

        await user.save();

        return successResponse(res, null, 'Password updated successfully, please login');

    } catch (error) {
        logger.error('Reset password error:', error);
        return errorResponse(res, error.message, 500);
    }
};

