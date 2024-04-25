const Feedback = require('../models/feedback'); // Adjust the path as necessary

exports.submitFeedback = (req, res, next) => {
    // Directly use name and email from the request body
    const { name, email, message } = req.body;

    // Create a new feedback instance and save it to the database
    const newFeedback = new Feedback({ name, email, message });
    newFeedback.save()
        .then(() => {
            console.log('Feedback saved successfully.');
            // Redirect or send a success response
            res.redirect('/contact');
        })
        .catch(error => {
            console.error('Error saving feedback:', error);
            // Respond with an error status if saving feedback fails
            res.status(500).send('An error occurred while submitting your feedback.');
        });
};
