const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Business name is required'],
        trim: true,
        maxlength: [100, 'Business name cannot exceed 100 characters']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        zipCode: { type: String, trim: true },
        country: { type: String, default: 'USA', trim: true }
    },
    phone: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^[\+]?[1-9][\d]{0,15}$/.test(v);
            },
            message: 'Please provide a valid phone number'
        }
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(v) {
                return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: 'Please provide a valid email'
        }
    },
    businessHours: {
        monday: { start: String, end: String, isOpen: { type: Boolean, default: true } },
        tuesday: { start: String, end: String, isOpen: { type: Boolean, default: true } },
        wednesday: { start: String, end: String, isOpen: { type: Boolean, default: true } },
        thursday: { start: String, end: String, isOpen: { type: Boolean, default: true } },
        friday: { start: String, end: String, isOpen: { type: Boolean, default: true } },
        saturday: { start: String, end: String, isOpen: { type: Boolean, default: true } },
        sunday: { start: String, end: String, isOpen: { type: Boolean, default: false } }
    },
    roles: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        minStaffRequired: {
            type: Number,
            default: 1,
            min: 0
        },
        maxStaffRequired: {
            type: Number,
            default: 5,
            min: 0
        },
        hourlyRate: {
            type: Number,
            min: 0
        }
    }],
    constraints: {
        maxHoursPerDay: {
            type: Number,
            default: 8,
            min: 1,
            max: 24
        },
        maxHoursPerWeek: {
            type: Number,
            default: 40,
            min: 1,
            max: 168
        },
        minBreakTime: {
            type: Number,
            default: 30,
            min: 0
        },
        overtimeThreshold: {
            type: Number,
            default: 8,
            min: 1,
            max: 24
        }
    },
    timezone: {
        type: String,
        default: 'America/New_York'
    },
    currency: {
        type: String,
        default: 'USD',
        enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    subscription: {
        plan: {
            type: String,
            enum: ['free', 'basic', 'premium'],
            default: 'free'
        },
        maxStaff: {
            type: Number,
            default: 5
        },
        maxSchedulesPerMonth: {
            type: Number,
            default: 10
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for performance
businessSchema.index({ owner: 1 });
businessSchema.index({ 'subscription.plan': 1 });

// Virtual for staff count
businessSchema.virtual('staffCount', {
    ref: 'Staff',
    localField: '_id',
    foreignField: 'businessId',
    count: true
});

// Virtual populate staff
businessSchema.virtual('staff', {
    ref: 'Staff',
    localField: '_id',
    foreignField: 'businessId'
});

module.exports = mongoose.model('Business', businessSchema);
