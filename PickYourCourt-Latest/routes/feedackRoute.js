
// feedackRoutes.js

const express = require('express');
const feedbackController = require('../controllers/feedbackController');
const router = express.Router();

// Route to handle form submission

router.post('/submit-feedback', feedbackController.submitFeedback);

module.exports = router;
