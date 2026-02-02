const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
    holidayName: {
        type: String,
        required: [true, 'Holiday name is required'],
        trim: true
    },
    date: {
        type: Date,
        required: [true, 'Date is required']
    },
    type: {
        type: String,
        enum: ['Public', 'Optional'],
        default: 'Public'
    },
    description: {
        type: String,
        trim: true
    },
    imageUrl: {
        type: String,
        required: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Holiday', holidaySchema);
