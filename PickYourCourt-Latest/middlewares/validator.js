const {body, validationResult} = require("express-validator");
const mongoose = require('mongoose');
const Booking = require('../models/booking');

exports.validateId = (req, res, next) => {
    let id = req.params.id;
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid Id')
        err.status = 400;
        return next(err);
    }
    return next();
};

exports.validateSignUp = [body('firstName', 'firstName cannot be empty').notEmpty().trim().escape(),
body('lastName', 'firstName cannot be empty').notEmpty().trim().escape(), 
body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
body('password', 'Password must be atleast 8 characters and atmost 64 characters').isLength({min: 8, max: 64})]

exports.validateLogin =  [body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(), body('password', 'Password must be atleast 8 characters and atmost 64 characters').isLength({min: 8, max: 64})];

exports.validateResult = (req, res, next) => {
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        })
        return res.redirect('back');
    } else {
        next();
    }
}

exports.validateBooking = (req, res, next) => {
    const { courtId, date, timeSlot, name, email } = req.body;
    if (!courtId || !date || !timeSlot ||  !name || !email) {
      req.flash('error', 'Missing required booking information.');
      return res.redirect('back');
    }
      
    next();
  };
  

 

  exports.validateBookingAvailability = async (req, res, next) => {
    const { courtId, date, timeSlot } = req.body;
  
    // Assume a method exists to check availability. This is just a placeholder logic.
    const isAvailable = await Booking.findOne({ courtId, date, timeSlot });
  
    if (isAvailable) {
      req.flash('error', 'The selected slot is not available.');
      return res.redirect('back');
    }
  
    next();
  };

exports.validateTradeItem = [body('name', 'Name cannot be empty').notEmpty().trim().escape(),body('category', 'Category cannot be empty').notEmpty().trim().escape(),body('condition', 'Condition cannot be empty').notEmpty().trim().escape(),body('name', 'Name cannot be empty').notEmpty().trim().escape(),body('model', 'Model cannot be empty').notEmpty().trim().escape().isLength({min: 2}),body('manufacturer', 'Manufacturer cannot be empty').notEmpty().trim().escape(),body('details', 'Details cannot be empty').notEmpty().trim().escape().isLength({min: 10}),body('image', 'Image cannot be empty').notEmpty().trim()];

exports.validateStatus = [body('status').exists().withMessage('status cannot be empty').if(body('status').exists()).isIn(['Available', 'Offer Pending', 'Traded']).withMessage('status can only be Available, Offer Pending or Traded').notEmpty().escape().trim()];