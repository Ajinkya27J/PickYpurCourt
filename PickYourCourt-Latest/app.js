//require modules
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const mainRoutes = require('./routes/mainRoutes');
const tradeRoutes = require('./routes/tradeRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const userRoutes = require('./routes/userRoutes');
const feedbackRoutes = require('./routes/feedackRoute');
const mongoUrl = 'mongodb+srv://pyc:pyctest123@cluster0.smcdpeg.mongodb.net/PickYourCourt?retryWrites=true&w=majority';
const ejs = require('ejs');


//create app 
const app = express();

//configure app
let port = process.env.PORT || 4000; ; 
let host = '0.0.0.0';

app.set('view engine', 'ejs');

//connect to database

mongoose.connect(mongoUrl, {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=> {
    //start the server
    app.listen(port, host, ()=>{
        console.log('Server is running on port', port);
    })
})
.catch((err)=> console.log(err.mesage))

//mount middlware
//mount middlware
app.use(
    session({
        secret: "ajfeirf90aeu9eroejfoefj",
        resave: false,
        saveUninitialized: false,
       // store: new MongoStore({mongoUrl: 'mongodb://localhost:27017/finalProject'}),
       store: new MongoStore({ mongoUrl: mongoUrl}),
        
        cookie: {maxAge: 60*60*1000}
        })
);
app.use(flash());
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.userName = req.session.userName||null;
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

app.use('/', mainRoutes);
app.use('/trades', tradeRoutes);
app.use('/bookings', bookingRoutes);
app.use('/users', userRoutes);
app.use('/feedbacks', feedbackRoutes); // Corrected path

//error handler
app.use((req, res, next) => {
    let err = new Error('The server cannot locate ' + req.url);
    err.status = 404;
    next(err);
})

app.use((err, req, res, next) => {
    if(!err.status) {
        err.status = 500;
        err.message = ("Internal Server Error");
    }
    res.status(err.status);
    res.render('error', {error: err});
})
