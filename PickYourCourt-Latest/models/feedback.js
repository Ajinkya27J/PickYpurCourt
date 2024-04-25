const mongoose = require('mongoose');

// Define the schema for feedback
const feedbackSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    message: {
        type: String,
        required: true,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
});

// Create the model from the schema
const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
