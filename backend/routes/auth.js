// routes/auth.js
const express = require('express');
const {
    register,
    login,
    refreshToken,
    getMe,
    logout,
    logoutAll,
    updateProfile,
    changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
    validateUserRegistration,
    validateUserLogin
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);
router.post('/refresh', refreshToken);

// Protected routes
router.use(protect); // Apply authentication middleware to all routes below

router.get('/me', getMe);
router.post('/logout', logout);
router.post('/logout-all', logoutAll);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

module.exports = router;
