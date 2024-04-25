const model = require('../models/user');
const Item = require('../models/item');
const Offer = require('../models/offer');
const Booking  = require('../models/booking');
const sendEmail = require('../middlewares/emailService');
const Court  = require('../models/court');
exports.new = (req, res)=>{
    res.render('./user/new');
};

exports.create = (req, res, next)=>{
    //res.send('Created a new item');

    let user = new model(req.body);//create a new item document
    user.save()//insert the document to the database
    .then(user=> { 
        sendEmail(
            user.email, // or req.body.email if the email is in the request body directly
            'Welcome to Our Reservation System!',
            `<h1>Welcome to PickYourCourt!</h1>
            <p>Hello ${user.firstName},</p>
            <p>We are thrilled to have you join us! Your new account has been successfully created. You can now make bookings, manage them, and enjoy our facilities to the fullest.</p>
            <p>Here are your account details:</p>
            <ul>
              <li><strong>Username:</strong> ${user.name}</li>
              <li><strong>Email:</strong> ${user.email}</li>
            </ul>
            <p>If you have any questions or need assistance, feel free to reach out to us.</p>
            <p>Welcome aboard,</p>
            <p>The PickYourCourt Team</p>
            `
        );
        req.flash('success', 'User registration successful!');
        res.redirect('/users/login');
    })
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            return res.redirect('back');
        }

        if(err.code === 11000) {
            req.flash('error', 'Email has already been used');  
            return res.redirect('back');
        }
        
        next(err);
    }); 
};

exports.getUserLogin = (req, res, next) => {

    return res.render('./user/login');
}

exports.login = (req, res, next)=>{

    let email = req.body.email;
    let password = req.body.password;
    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            req.flash('error', 'You have entered an incorrect email address!');  
            res.redirect('/users/login');
            } else {
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    req.session.user = user._id;
                    req.session.userName = user.firstName + " " + user.lastName;
                    req.flash('success', 'You have successfully logged in');
                    res.redirect('/users/profile');
            } else {
                req.flash('error', 'You have entered an incorrect password!');      
                res.redirect('/users/login');
            }
            });     
        }     
    })
    .catch(err => next(err));
};

// old code
exports.profile1 = (req, res, next)=>{
    let id = req.session.user;
    Promise.all([model.findById(id) , Item.find({createdBy: id }), Item.find(),  Offer.find({userId: id })])
    .then(results => {
        [user, items, allItems, offerItems] = results;
        const exchangeItems = offerItems.map(({ exchangeItemId }) => exchangeItemId.valueOf());
        const offers = allItems.filter(item => exchangeItems.includes(item.id) && item.status == "Offer Pending");
        const watchList = allItems.filter(item => item.watchedBy.includes(id));
        res.render('./user/profile', {user, items, offers, watchList})
    })
    .catch(err=>next(err));
};


exports.profile = (req, res, next)=>{
    let id = req.session.user;
    Promise.all([model.findById(id) , Booking.find({createdBy: id })])
    .then(results => {
        [user, bookings] = results;
        res.render('./user/profile', {user, bookings})
    })
    .catch(err=>next(err));
};



exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else
            res.redirect('/');  
    });
   
 };



