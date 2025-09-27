const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log to console for debugging
    console.error(err);

    // Handle bad ObjectId errors (e.g., invalid MongoDB IDs)
    if (err.name === 'CastError') {
        error = {
            message: 'Resource not found',
            statusCode: 404
        };
    }

    // Handle duplicate key errors in Mongoose
    if (err.code === 11000) {
        error = {
            message: 'Duplicate field value entered',
            statusCode: 400
        };
    }

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        error = {
            message: Object.values(err.errors).map(val => val.message).join(', '),
            statusCode: 400
        };
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = {
            message: 'Invalid token',
            statusCode: 401
        };
    }

    if (err.name === 'TokenExpiredError') {
        error = {
            message: 'Token expired',
            statusCode: 401
        };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error'
    });
};

module.exports = errorHandler;
