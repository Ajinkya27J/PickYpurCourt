const Item = require('../models/item');
const Offer = require('../models/offer');
const Booking = require('../models/booking');

exports.isGuest = (req, res, next) => {
    if(!req.session.user) {   
        return next();
    } else {
        req.flash('error', 'You are logged in already');
        return res.redirect('/users/profile');
    }
}

exports.isLoggedIn = (req, res, next) => {
    if(req.session.user) {   
        return next();
    } else {
        req.flash('error', 'You need to login first');
        return res.redirect('/users/login');
    }
}

exports.isCreator = (req, res, next) => {
    let id = req.params.id;
    Booking.findById(id)
    .then(item => {
        if(item) {
            if(item.createdBy == req.session.user) {
                return next();
            } else {
                let err = new Error('Unauthorized to access the resource');
                err.status = 401;
                return next(err);
            }
        } else {
            let err = new Error('Cannot find a booking item with id ' + req.params.id);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
}

exports.isNotCreator = (req, res, next) => {
    let id = req.params.id;
    Booking.findById(id)
    .then(item => {
        if(item) {
            if(item.createdBy != req.session.user) {
                return next();
            } else {
                let err = new Error('Unauthorized to access the resource');
                err.status = 401;
                return next(err);
            }
        } else {
            let err = new Error('Cannot find a booking item with id ' + req.params.id);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
}

exports.isOfferCreator = (req, res, next) => {
    let id = req.params.id;
    Offer.findById(id)
    .then(item => {
        if(item) {
            if(item.userId == req.session.user) {
                return next();
            } else {
                let err = new Error('Unauthorized to access the resource');
                err.status = 401;
                return next(err);
            }
        } else {
            let err = new Error('Cannot find an offer associated with this item');
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
}

exports.isNotOfferCreator = (req, res, next) => {
    let id = req.params.id;
    Offer.findById(id)
    .then(item => {
        if(item) {
            if(item.createdBy != req.session.user) {
                return next();
            } else {
                let err = new Error('Unauthorized to access the resource');
                err.status = 401;
                return next(err);
            }
        } else {
            let err = new Error('Cannot find an offer associated with this item');
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
}
