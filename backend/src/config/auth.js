const jwt = require('jsonwebtoken');

const authConfig = {
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your_refresh_secret',
    jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d',

    // Generate JWT access token
    generateToken: (payload) => {
        return jwt.sign(payload, authConfig.jwtSecret, {
            expiresIn: authConfig.jwtExpire
        });
    },

    // Generate refresh token
    generateRefreshToken: (payload) => {
        return jwt.sign(payload, authConfig.jwtRefreshSecret, {
            expiresIn: authConfig.jwtRefreshExpire
        });
    },

    // Verify JWT access token
    verifyToken: (token) => {
        try {
            return jwt.verify(token, authConfig.jwtSecret);
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    },

    // Verify refresh token
    verifyRefreshToken: (token) => {
        try {
            return jwt.verify(token, authConfig.jwtRefreshSecret);
        } catch (error) {
            throw new Error('Invalid or expired refresh token');
        }
    }
};

module.exports = authConfig;
