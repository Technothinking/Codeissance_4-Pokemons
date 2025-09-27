// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false // Don't return password in queries by default
    },
    role: {
        type: String,
        enum: ['business_owner', 'staff', 'admin'],
        default: 'business_owner',
        required: true
    },
    phone: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || validator.isMobilePhone(v);
            },
            message: 'Please provide a valid phone number'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    refreshTokens: [{
        token: String,
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 2592000 // 30 days
        }
    }],
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business'
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerificationToken: String,
    isEmailVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for email to optimize lookups
userSchema.index({ email: 1 });

// Virtual for full name or display name, here just name
userSchema.virtual('fullName').get(function() {
    return this.name;
});

// Hash password before saving, only if password field modified
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare plaintext password with hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate password reset token method
userSchema.methods.getResetPasswordToken = function() {
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Token expires after 10 minutes
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model('User', userSchema);
