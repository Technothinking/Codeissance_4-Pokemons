// config/auth.js
const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
        issuer: 'workforce-planner',
        audience: 'workforce-planner-users'
    });
};

const generateRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
        issuer: 'workforce-planner',
        audience: 'workforce-planner-users'
    });
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET, {
            issuer: 'workforce-planner',
            audience: 'workforce-planner-users'
        });
    } catch (error) {
        throw new Error('Invalid token');
    }
};

const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
            issuer: 'workforce-planner',
            audience: 'workforce-planner-users'
        });
    } catch (error) {
        throw new Error('Invalid refresh token');
    }
};

module.exports = {
    generateToken,
    generateRefreshToken,
    verifyToken,
    verifyRefreshToken
};
