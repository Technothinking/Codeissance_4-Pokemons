const { validationResult, body, param, query } = require('express-validator');

// Middleware to check validation results
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors: errors.array().map(err => ({ field: err.param, message: err.msg }))
        });
    }
    next();
};

// Validation rules for user registration
const validateUserRegistration = [
    body('name').isLength({ min: 2, max: 50 }).withMessage('Name must be 2 to 50 characters'),
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
        .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
        .matches(/\d/).withMessage('Password must contain a number')
        .matches(/[@$!%*?&]/).withMessage('Password must contain a special character'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
    body('role').optional().isIn(['business_owner', 'staff']).withMessage('Invalid role'),
    handleValidationErrors
];

// Validation rules for user login
const validateUserLogin = [
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('password').exists().withMessage('Password is required'),
    handleValidationErrors
];

// Validation rules for business creation / update
const validateBusiness = [
    body('name').isLength({ min: 1, max: 100 }).withMessage('Business name required'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description max 500 chars'),
    body('phone').optional().matches(/^[\+]?[0-9\s\-]{7,}$/).withMessage('Invalid phone number'),
    body('email').optional().isEmail().withMessage('Invalid email').normalizeEmail(),
    // Validate time format (hh:mm) for business hours
    body('businessHours.*.start').optional().matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/).withMessage('Invalid start time'),
    body('businessHours.*.end').optional().matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/).withMessage('Invalid end time'),
    body('constraints.maxHoursPerDay').optional().isInt({ min: 1, max: 24 }).withMessage('Invalid max hours per day'),
    body('constraints.maxHoursPerWeek').optional().isInt({ min:1, max:168 }).withMessage('Invalid max hours per week'),
    handleValidationErrors
];

// Validation rules for staff creation / update
const validateStaff = [
    body('name').isLength({ min:1, max:50 }).withMessage('Staff name required'),
    body('phone').exists().withMessage('Phone required').isMobilePhone().withMessage('Invalid phone'),
    body('email').optional().isEmail().withMessage('Invalid email').normalizeEmail(),
    body('roles').isArray({ min:1 }).withMessage('At least one role required'),
    body('hourlyRate').optional().isFloat({ min:0 }).withMessage('Hourly rate must be positive'),
    body('preferences.maxHoursPerDay').optional().isInt({ min:1, max:24 }).withMessage('Invalid max hours per day'),
    body('preferences.maxHoursPerWeek').optional().isInt({ min:1, max:168 }).withMessage('Invalid max hours per week'),
    handleValidationErrors
];

// Validation for schedule creation / update
const validateSchedule = [
    body('title').isLength({ min:1, max:100 }).withMessage('Title required'),
    body('weekStartDate').isISO8601().toDate().withMessage('Valid start date required'),
    body('weekEndDate').isISO8601().toDate().withMessage('Valid end date required')
        .custom((value, { req }) => {
            if (value <= req.body.weekStartDate) {
                throw new Error('End date must be after start date');
            }
            return true;
        }),
    body('shifts').optional().isArray(),
    body('shifts.*.date').optional().isISO8601(),
    body('shifts.*.startTime').optional().matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/),
    body('shifts.*.endTime').optional().matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/),
    handleValidationErrors
];

// Validation for MongoDB ObjectId params
const validateObjectId = (paramName) => [
    param(paramName).isMongoId().withMessage(`${paramName} must be a valid ID`),
    handleValidationErrors
];

// Validation for query parameters (pagination)
const validatePagination = [
    query('page').optional().isInt({ min:1 }).withMessage('Page must be positive integer'),
    query('limit').optional().isInt({ min:1, max:100 }).withMessage('Limit must be 1-100'),
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    validateUserRegistration,
    validateUserLogin,
    validateBusiness,
    validateStaff,
    validateSchedule,
    validateObjectId,
    validatePagination
};
