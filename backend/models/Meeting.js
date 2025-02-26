const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
    meetingId: {
        type: String,
        required: [true, 'Meeting ID is required'],
        unique: true,
        trim: true,
        validate: {
            validator: function(v) {
                // Validate that meetingID is 8 characters
                return v && v.length === 8;
            },
            message: props => `${props.value} is not a valid meeting ID! Must be 8 characters.`
        }
    },
    meetingName: {
        type: String,
        required: [true, 'Meeting name is required'],
        trim: true
    },
    type: {
        type: String,
        enum: ['instant', 'scheduled'],
        default: 'instant'
    },
    host: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false
        },
        name: {
            type: String,
            required: [true, 'Host name is required']
        },
        email: {
            type: String,
            required: [true, 'Host email is required']
        }
    },
    scheduledTime: {
        type: Date,
        default: null,
        validate: {
            validator: function(v) {
                if (this.type === 'scheduled' && !v) {
                    return false;
                }
                return true;
            },
            message: 'Scheduled time is required for scheduled meetings'
        }
    },
    participants: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        name: String,
        email: String,
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['pending', 'active', 'completed', 'cancelled'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
meetingSchema.index({ 'host.email': 1 });
meetingSchema.index({ status: 1 });
meetingSchema.index({ scheduledTime: 1 });

// Pre-save middleware
meetingSchema.pre('save', function(next) {
    // Ensure meetingID is trimmed
    if (this.meetingId) {
        this.meetingId = this.meetingId.trim();
    }
    
    // Update timestamps
    this.updatedAt = new Date();
    
    // Set status based on meeting type and time
    if (this.type === 'scheduled') {
        this.status = 'pending';
    } else {
        this.status = 'active';
    }

    next();
});

// Virtual for checking if meeting is active
meetingSchema.virtual('isActive').get(function() {
    return this.status === 'active';
});

// Method to add participant
meetingSchema.methods.addParticipant = async function(participantData) {
    if (!this.participants.find(p => p.email === participantData.email)) {
        this.participants.push(participantData);
        await this.save();
    }
    return this;
};

// Static method to find active meetings
meetingSchema.statics.findActiveMeetings = function() {
    return this.find({ status: 'active' });
};

// Clear existing model if it exists
mongoose.models = {};

// Export the model
module.exports = mongoose.model('Meeting', meetingSchema); 