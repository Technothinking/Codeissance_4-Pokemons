const mongoose = require('mongoose');
const validator = require('validator');

const staffSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Staff name is required'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        validate: [validator.isMobilePhone, 'Please provide a valid phone number']
    },
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    roles: [{
        type: String,
        required: true,
        trim: true
    }],
    hourlyRate: {
        type: Number,
        min: 0,
        default: 15
    },
    availability: {
        monday: {
            isAvailable: { type: Boolean, default: true },
            timeSlots: [{
                start: String,
                end: String
            }]
        },
        tuesday: {
            isAvailable: { type: Boolean, default: true },
            timeSlots: [{
                start: String,
                end: String
            }]
        },
        wednesday: {
            isAvailable: { type: Boolean, default: true },
            timeSlots: [{
                start: String,
                end: String
            }]
        },
        thursday: {
            isAvailable: { type: Boolean, default: true },
            timeSlots: [{
                start: String,
                end: String
            }]
        },
        friday: {
            isAvailable: { type: Boolean, default: true },
            timeSlots: [{
                start: String,
                end: String
            }]
        },
        saturday: {
            isAvailable: { type: Boolean, default: false },
            timeSlots: [{
                start: String,
                end: String
            }]
        },
        sunday: {
            isAvailable: { type: Boolean, default: false },
            timeSlots: [{
                start: String,
                end: String
            }]
        }
    },
    preferences: {
        preferredShifts: [{
            type: String,
            enum: ['morning', 'afternoon', 'evening', 'night']
        }],
        maxShiftsPerDay: {
            type: Number,
            default: 1,
            min: 1,
            max: 3
        },
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
        notes: {
            type: String,
            maxlength: [200, 'Notes cannot exceed 200 characters']
        }
    },
    emergencyContact: {
        name: String,
        phone: String,
        relationship: String
    },
    hireDate: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    documents: [{
        type: {
            type: String,
            enum: ['id', 'contract', 'tax_form', 'other']
        },
        filename: String,
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }],
    timeOffRequests: [{
        startDate: Date,
        endDate: Date,
        reason: String,
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        requestDate: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for performance
staffSchema.index({ businessId: 1 });
staffSchema.index({ userId: 1 });
staffSchema.index({ phone: 1 });
staffSchema.index({ email: 1 });

// Virtual for active time off
staffSchema.virtual('activeTimeOff').get(function() {
    const now = new Date();
    return this.timeOffRequests.filter(request =>
        request.status === 'approved' &&
        request.startDate <= now &&
        request.endDate >= now
    );
});

module.exports = mongoose.model('Staff', staffSchema);
