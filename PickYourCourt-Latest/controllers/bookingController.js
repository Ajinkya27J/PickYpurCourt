const model = require('../models/item');
const Court = require('../models/court');
const Booking = require('../models/booking');
const Offer = require('../models/offer');
const User = require('../models/user');
const timeSlotArr = ['9:00AM - 10:00AM', '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM', '12:00 PM - 1:00 PM', '01:00 PM - 02:00 PM', '02:00 PM - 03:00 PM', '03:00 PM - 04:00 PM', '04:00 PM - 05:00 PM', '05:00 PM - 06:00 PM', '06:00 PM - 07:00 PM', '07:00 PM - 08:00 PM' , '08:00 PM - 09:00 PM'];
const sendEmail = require('../middlewares/emailService');
const booking = require('../models/booking');


exports.index = (req, res, next)=> {
    Court.find()
    .then((results) => {
        const courts = results;
        res.render('./booking/index', {courts});
    })
    .catch(err => next(err));
}

function calculateTimeSlots() {
    console.log('time slot');
}

exports.new = (req, res, next ) => {

    //res.render('./trade/new');
    let id = req.params.id;
    let bookingArr = [];
    const dateObj = new Date();
    const month  = dateObj.getMonth() + 1;
    const m  = month < 10 ? '0' + month : month;  
    const curDate = dateObj.getFullYear()+ '-' + m + '-' + dateObj.getDate();
    const curDateObj = { 'curDate' : curDate};
    console.log('cur date : ' + curDate);
    Promise.all([Court.findById(id) , Booking.find({courtId: id, date: curDate })])
    .then(results => {
        //get all the time slots from the booking and check 
        [court, bookings] = results;
        bookings.forEach(book => {
            book.curDate = curDate;
            bookingArr.push(book.timeSlot);
            
        })
        console.log(bookings);
        res.render('./booking/new', {court, bookingArr, timeSlotArr, curDate});  
        
    })
    .catch(err=>next(err));
};

exports.chooseDate = (req, res, next) => {
    let id = req.params.id;
    let bookingArr = [];
    const dateObj = new Date();
    //const month  = dateObj.getMonth() + 1;
    //const m  = month < 10 ? '0' + month : month;  
    const curDate = req.params.date;
    Promise.all([Court.findById(id) , Booking.find({courtId: id, date: curDate })])
    .then(results => {
        //get all the time slots from the booking and check 
        [court, bookings] = results;
       // console.log(results);
        bookings.forEach(book => {
            console.log(book.date);
            bookingArr.push(book.timeSlot);
        })
        res.render('./booking/new', {court, bookingArr, timeSlotArr, curDate});  
        
    })
    .catch(err=>next(err));
}

exports.create = (req, res, next) => { 
    let booking = new Booking(req.body);
    booking.createdBy = req.session.user;
    //booking.courtId = '62766ae59d37086eee7eed8b';
    Court.findById(booking.courtId).
    then(court => {
        booking.courtName = court.name;
        booking.save()
        .then(booking => {
            req.flash('success', 'Court booked successfully!');
            sendEmail(
                booking.email, // Assuming the user's email is stored in session
                'Booking Confirmation', 
            `<h1>Booking Confirmation</h1>
            <p>Hello ${booking.name},</p>
            <p>Your booking at PickYourCourt has been confirmed. Here are your booking details:</p>
            <ul>
                <li><strong>Court Name:</strong> ${booking.courtName}</li>
                <li><strong>Date:</strong> ${booking.date}</li>
                <li><strong>Time Slot:</strong> ${booking.timeSlot}</li>
            </ul>
            <p>If you have any questions or need to make changes to your booking, please contact us at actualcontactinfo@example.com.</p>
            <p>We look forward to seeing you!</p>
            <p>Best regards,</p>
            <p>The PickYourCourt Team</p>`
            );
            //res.redirect('/bookings');
            let id = req.session.user;
            Promise.all([User.findById(id) , Booking.find({createdBy: id })])
            .then(results => {
                [user, bookings] = results;
                res.render('./user/profile', {user, bookings})
            })
            .catch(err=>next(err));
        })
        .catch(err => {
            console.log(err);
            if(err.name === 'ValidationError' ) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            next(err);
        });
    })
};

exports.show = (req, res, next)=> {
    let id = req.params.id;
    const user  = req.session.user;
    Booking.findById(id)
    .then(item => {
        if (item) {
            Court.findById(item.courtId)
            .then(court => {
                res.render('./booking/show', {court,item, user});
            })
        } else {
            let err = new Error('Cannot find item with id '+ id)
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err))
};

exports.edit = (req, res, next) => {
    let id = req.params.id;
    let bookingArr = [];
    //Booking.findById(id)
   // Promise.all([Booking.findById(id) , Booking.find({courtId: id, date: curDate })])
    Booking.findById(id)
    .then(booking => {
        if (booking) {
            Promise.all([Court.findById(booking.courtId) , Booking.find({courtId: booking.courtId, date: booking.date })])
   .then(results => {
                [court, bookingList] = results;
                bookingList.forEach(book => {
                    bookingArr.push(book.timeSlot);    
                })
                console.log(court);
                res.render('./booking/edit', {court, booking, bookingArr, timeSlotArr});
            })
            .catch(err => next(err))
            //res.render('./booking/edit', {booking});
        } else {
            let err = new Error('Cannot find booking with id '+ id)
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err))
}

exports.update = (req, res, next) =>{
    let item = req.body;
    let id = req.params.id;
    Booking.findByIdAndUpdate(id, item, {useFindAndModify: false, runValidators: true})
    .then(item => {
        if(item) {
            req.flash('success', 'Booking has been updated successfully!');
            sendEmail(
                item.email, // Assuming the user's email is stored in session
                'Booking Update',
                `<h1>Your Booking Updated</h1>
                <p>Hello ${item.name},</p>
                <p>We wanted to let you know that your booking at PickYourCourt has been updated. Please review the new details below:</p>
                <ul>
                  <li><strong>Court Name:</strong> ${item.courtName}</li>
                  <li><strong>New Date:</strong> ${item.date}</li>
                  <li><strong>New Time Slot:</strong> ${item.timeSlot}</li>
                </ul>
                <p>If these changes are incorrect or if you wish to discuss them further, please don't hesitate to reach out to us.</p>
                <p>Thank you for choosing PickYourCourt,</p>
                <p>Best regards,</p>
                <p>The PickYourCourt Team</p>
                `
            );
            res.redirect('/bookings/' + id);
        } else {
            let err = new Error('Cannot find an item with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => {
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        next(err);
    })
};

exports.delete = (req, res, next) => {
    let id = req.params.id;
    Booking.findByIdAndDelete(id, {useFindAndModify: false, runValidators: true})
    .then(item => {
        if(item) {
            req.flash('success', 'Booking item has been deleted successfully!');
            sendEmail(
                item.email, // Assuming the user's email is stored in session
                'Booking Cancellation',
                `<h1>Booking Cancellation</h1>
                <p>Hello ${item.name},</p>
                <p>Here is a comfirmation for you that your booking has been canceled. We apologize for any inconvenience this may have caused.</p>
                <p>Here were the details of your canceled booking:</p>
                <ul>
                  <li><strong>Court Name:</strong> ${item.courtName}</li>
                  <li><strong>Date:</strong> ${item.date}</li>
                  <li><strong>Time Slot:</strong> ${item.timeSlot}</li>
                </ul>
                <p>If this cancellation is unexpected or if you would like to reschedule, please reschedule or contact us directly.</p>
                <p>We hope to see you on the court again soon!</p>
                <p>Best regards,</p>
                <p>The PickYourCourt Team</p>`
            );
            res.redirect('/bookings');
        } else {
            let err = new Error('Cannot find an booking item with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err))
}

/*exports.watch = (req, res, next) => {  
    const id = req.params.id;
    model.findById(id)
    .then(item => {
        if(!item.watchedBy.includes(req.session.user)) {
            item.watchedBy.push(req.session.user);
        }
        model.findByIdAndUpdate(id, item, {useFindAndModify: false, runValidators: true})
        .then(watchedItem => {
            return res.redirect('/users/profile');
        })
        .catch(err => next(err))
    })
    .catch(err => next(err))
};

exports.unwatch = (req, res, next) => {  
    const id = req.params.id;
    model.findById(id)
    .then(item => {
        const watchIndex = item.watchedBy.indexOf(req.session.user);
        if(watchIndex !== -1) {
            item.watchedBy.splice(watchIndex, 1);
        }
        model.findByIdAndUpdate(id, item, {useFindAndModify: false, runValidators: true})
        .then(watchedItem => {
            return res.redirect('back');
        })
        .catch(err => next(err))
    })
    .catch(err => next(err))
};*/
exports.trade = (req, res, next) => { 
    let exchangeItem = {id: req.params.id };
    let id = req.session.user;
    Promise.all([User.findById(id) , model.find({createdBy: id, status: "Available" })])
    .then(results => {
        [user, items] = results;
        res.render('./user/userItems', {user, items, exchangeItem });  
        
    })
    .catch(err=>next(err));
};

/*
exports.offer = (req, res, next) => { 
    let offer = new Offer(req.body);
    offer.exchangeItemId = req.params.id;
    offer.userId = req.session.user;
    offer.save()
    .then(offerItem => {
        model.updateMany({
            "_id": {$in: [offer.itemId, offer.exchangeItemId]}
        }, {status: "Offer Pending", "offerId": offerItem.id})
        .then(result => {
            req.flash('success', 'Trade Offer has been created successfully!');
            return res.redirect('/users/profile');
        })
        .catch(err => next(err))
    })
    .catch(err => {
        next(err);
    });
};

exports.manageOffer = (req, res, next) => { 
    const userId = req.session.user;
    Offer.findById(req.params.id)
    .then(offerItem => {
        if(offerItem) {
            model.find({"_id": {$in: [offerItem.itemId, offerItem.exchangeItemId]}})
            .then(result => {
                if (result && result.length === 2) {
                    const user = { isOfferInitiator: offerItem.userId == userId ? true: false};
                    let item1, item2 = null;
                    if(result[0].createdBy == userId) {
                        item1 = result[0];
                        item2 = result[1];
                    } else {
                        item1 = result[1];
                        item2 = result[0];
                    }
                    res.render('./offer/manage', {user, item1, item2, offerItem});
                } else {
                    let err = new Error('Cannot find item with id '+ id)
                    err.status = 404;
                    next(err);
                }
        
            })
        } else {
            let err = new Error('Cannot find the offer associated with this Item')
            err.status = 404;
            next(err);
        } 
    })      
    .catch(err => next(err))
};
exports.acceptOffer = (req, res, next) => { 
    Offer.findById(req.params.id)
    .then(offerItem => {
        model.updateMany({
            "_id": {$in: [offerItem.itemId, offerItem.exchangeItemId]}
        }, {status: "Traded"})
        .then(result => {
           return res.redirect('/users/profile');
        })
        .catch(err => next(err))
    })
    .catch(err => {
        next(err);
    });
};
exports.cancelOffer = (req, res, next) => { 
    Offer.findById(req.params.id)
    .then(offerItem => {
        model.updateMany({
            "_id": {$in: [offerItem.itemId, offerItem.exchangeItemId]}
        }, {status: "Available", offerId: null})
        .then(result => {
            Offer.findByIdAndDelete(offerItem.id, {useFindAndModify: false, runValidators: true})
            .then(result => {
                return res.redirect('/users/profile');
            })
            .catch(err => next(err));
        })
        })
        .catch(err => next(err))
};

exports.rejectOffer = (req, res, next) => { 
    Offer.findById(req.params.id)
    .then(offerItem => {
        model.updateMany({
            "_id": {$in: [offerItem.itemId, offerItem.exchangeItemId]}
        }, {status: "Available", offerId: null})
        .then(result => {
            Offer.findByIdAndDelete(offerItem.id, {useFindAndModify: false, runValidators: true})
            .then(result => {
                return res.redirect('/users/profile');
            })
            .catch(err => next(err));
        })
        .catch(err => next(err))
    })
    .catch(err => {
        next(err);
    });
};
*/

