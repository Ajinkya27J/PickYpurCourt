// /models/booking.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new mongoose.Schema({
    courtId: {type: Schema.Types.ObjectId, ref: 'Court'},
    courtName: {type: String, required: true},
    name: { type: String, required: true },
    //email
    email: {type: String, required: [true, 'cannot be empty']},
   // date: { type: Date, required: true },
   date: { type: String, required: true },
   // timeSlot: {type: Array, default: []},
   timeSlot: { type: String, required: true },
    createdBy: {type:mongoose.Schema.Types.ObjectId, ref: 'User'}
}, { timestamps: true });

//collection name is bookings in the database
module.exports = mongoose.model('Booking', bookingSchema);
