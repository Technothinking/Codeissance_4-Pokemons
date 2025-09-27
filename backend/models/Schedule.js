const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Schedule title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    weekStartDate: {
        type: Date,
        required: true
    },
    weekEndDate: {
        type: Date,
        required: true
    },
    shifts: [{
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Staff',
            required: true
        },
        role: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        startTime: {
            type: String,
            required: true
        },
        endTime: {
            type: String,
            required: true
        },
        duration: {
            type: Number, // in minutes
            required: true
        },
        breakTime: {
            type: Number, // in minutes
            default: 0
        },
        hourlyRate: {
            type: Number,
            min: 0
        },
        totalPay: {
            type: Number,
            min: 0
        },
        notes: {
            type: String,
            maxlength: [200, 'Notes cannot exceed 200 characters']
        },
        status: {
            type: String,
            enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'],
            default: 'scheduled'
        },
        isOvertime: {
            type: Boolean,
            default: false
        }
    }],
    aiGenerated: {
        type: Boolean,
        default: false
    },
    aiPrompt: {
        type: String
    },
    aiRecommendations: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['draft', 'published', 'completed', 'archived'],
        default: 'draft'
    },
    publishedAt: {
        type: Date
    },
    totalCost: {
        type: Number,
        min: 0,
        default: 0
    },
    metrics: {
        totalHours: {
            type: Number,
            default: 0
        },
        averageShiftLength: {
            type: Number,
            default: 0
        },
        overtimeHours: {
            type: Number,
            default: 0
        },
        staffUtilization: {
            type: Number,
            default: 0
        }
    },
    approvals: [{
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Staff'
        },
        approvedAt: {
            type: Date
        },
        notes: String
    }],
    modifications: [{
        modifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        modifiedAt: {
            type: Date,
            default: Date.now
        },
        changes: [{
            field: String,
            oldValue: mongoose.Schema.Types.Mixed,
            newValue: mongoose.Schema.Types.Mixed
        }],
        reason: String
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexing for performance
scheduleSchema.index({ businessId: 1, weekStartDate: 1 });
scheduleSchema.index({ 'shifts.staffId': 1 });
scheduleSchema.index({ status: 1 });

// Calculate totals before saving
scheduleSchema.pre('save', function(next) {
    this.totalCost = this.shifts.reduce((total, shift) => {
        return total + (shift.totalPay || 0);
    }, 0);

    const totalMinutes = this.shifts.reduce((total, shift) => total + shift.duration, 0);
    this.metrics.totalHours = totalMinutes / 60;
    this.metrics.averageShiftLength = this.shifts.length > 0 ? totalMinutes / this.shifts.length / 60 : 0;
    this.metrics.overtimeHours = this.shifts.reduce((total, shift) => {
        return total + (shift.isOvertime ? shift.duration / 60 : 0);
    }, 0);

    next();
});

module.exports = mongoose.model('Schedule', scheduleSchema);
