const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken } = require('../config/auth');

// Protect routes - require valid JWT token
const protect = async (req, res, next) => {
    let token;

    // Extract token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]; // Fixed here: get token string itself
    }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }

    try {
        // Verify token
        const decoded = verifyToken(token);

        // Get user from token
        const user = await User.findById(decoded.id);
        // If password was excluded in auth, re-query with select('+password') only if needed

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'No user found with this token'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'User account is deactivated'
            });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};

// Middleware to grant access only to specified roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

// Check if user owns the business or is admin
const authorizeBusinessOwner = async (req, res, next) => {
    try {
        const businessId = req.params.businessId || req.body.businessId;

        if (!businessId) {
            return res.status(400).json({
                success: false,
                message: 'Business ID is required'
            });
        }

        if (req.user.role === 'admin') {
            return next();
        }

        if (req.user.role === 'business_owner' && req.user.businessId && req.user.businessId.toString() === businessId) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'Not authorized to access this business'
        });

    } catch (error) {
        console.error('Authorization check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authorization check failed'
        });
    }
};

// Check if user is staff member or owner for a business
const authorizeStaffAccess = async (req, res, next) => {
    try {
        const businessId = req.params.businessId || req.body.businessId;

        if (!businessId) {
            return res.status(400).json({
                success: false,
                message: 'Business ID is required'
            });
        }

        if (req.user.role === 'admin') {
            return next();
        }

        if ((req.user.role === 'business_owner' || req.user.role === 'staff') && req.user.businessId && req.user.businessId.toString() === businessId) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'Not authorized to access this business'
        });

    } catch (error) {
        console.error('Staff authorization check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authorization check failed'
        });
    }
};

module.exports = {
    protect,
    authorize,
    authorizeBusinessOwner,
    authorizeStaffAccess
};
