const authConfig = require('../config/auth');
const { errorResponse } = require('../utils/response');

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header or query string (for iframes/downloads)
        let token;
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.query.token) {
            token = req.query.token;
        }

        if (!token) {
            return errorResponse(res, 'No token provided. Please login to access this resource', 401);
        }

        // Verify token
        const decoded = authConfig.verifyToken(token);

        // Attach user info to request
        req.user = {
            id: decoded.id,
            _id: decoded.id, // Ensure compatibility with controllers expecting _id
            role: decoded.role,
            email: decoded.email, // Add email for employee lookup
            employeeId: decoded.employeeId // Include employeeId from token
        };

        next();
    } catch (error) {
        return errorResponse(res, 'Invalid or expired token. Please login again', 401);
    }
};

module.exports = authMiddleware;

