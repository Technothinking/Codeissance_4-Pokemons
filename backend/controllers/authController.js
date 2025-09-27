const User = require('../models/User');
const Business = require('../models/Business');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../config/auth');
const crypto = require('crypto');

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'business_owner'
    });

    // Generate tokens
    const token = generateToken({ id: user._id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });

    // Save refresh token in user record
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user & select password field explicitly
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    // Compare passwords
    const matched = await user.matchPassword(password);
    if (!matched) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login timestamp
    user.lastLogin = Date.now();
    await user.save();

    // Generate tokens
    const token = generateToken({ id: user._id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });

    // Save refresh token
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    // Fetch associated business for business_owner role
    let business = null;
    if (user.role === 'business_owner' && user.businessId) {
      business = await Business.findById(user.businessId);
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          businessId: user.businessId,
          isActive: user.isActive,
          lastLogin: user.lastLogin
        },
        business,
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if user and refresh token exist
    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokens.some(rt => rt.token === refreshToken)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const token = generateToken({ id: user._id, email: user.email, role: user.role });

    return res.status(200).json({
      success: true,
      data: { token }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
};

// @desc    Get currently logged in user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Fetch business if owner
    let business = null;
    if (user.role === 'business_owner' && user.businessId) {
      business = await Business.findById(user.businessId);
    }

    return res.status(200).json({
      success: true,
      data: {
        user,
        business
      }
    });
  } catch (error) {
    console.error('GetMe error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user info'
    });
  }
};

// @desc    Logout user by revoking refresh token
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required for logout'
      });
    }

    // Remove refresh token from user
    await User.findByIdAndUpdate(req.user._id, { $pull: { refreshTokens: { token: refreshToken } } });

    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

// @desc    Logout from all sessions by clearing all refresh tokens
// @route   POST /api/v1/auth/logout-all
// @access  Private
const logoutAll = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $set: { refreshTokens: [] } });

    return res.status(200).json({
      success: true,
      message: 'Logged out from all devices successfully'
    });
  } catch (error) {
    console.error('LogoutAll error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during logout all'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findByIdAndUpdate(req.user._id,
      { name, phone },
      { new: true, runValidators: true }
    ).select('-password');

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};

// @desc    Change password
// @route   PUT /api/v1/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password and clear refresh tokens to log out from other sessions
    user.password = newPassword;
    user.refreshTokens = [];
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('ChangePassword error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error changing password'
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  getMe,
  logout,
  logoutAll,
  updateProfile,
  changePassword
};
