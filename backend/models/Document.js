const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const documentSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => uuidv4(),
        required: true
    },
    title: {
        type: String,
        required: true,
        default: 'Untitled Document'
    },
    content: {
        type: String,
        default: ''
    },
    contentType: {
        type: String,
        enum: ['text', 'document'],
        default: 'text'
    },
    version: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Update the updatedAt timestamp before saving
documentSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Document', documentSchema); 