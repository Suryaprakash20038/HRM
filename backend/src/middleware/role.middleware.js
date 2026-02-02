const { errorResponse } = require('../utils/response');

// Role-based access control middleware
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return errorResponse(res, 'Unauthorized', 401);
        }

        if (!allowedRoles.includes(req.user.role)) {
            return errorResponse(res, 'Forbidden: You do not have permission to access this resource', 403);
        }

        next();
    };
};

module.exports = checkRole;
