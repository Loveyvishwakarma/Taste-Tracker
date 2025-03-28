const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    imageUrl: {
        type: String
    },
    scannedDate: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Food', foodSchema);