const { errorResponse } = require('../utils/response');

// Role-based access control middleware
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return errorResponse(res, 'Unauthorized', 401);
        }

        const userRole = req.user.role ? req.user.role.toLowerCase() : '';
        const lowerCaseAllowedRoles = allowedRoles.map(role => role.toLowerCase());

        if (!lowerCaseAllowedRoles.includes(userRole)) {
            return errorResponse(res, `Forbidden: ${req.user.role} does not have permission`, 403);
        }

        next();
    };
};




module.exports = checkRole;
