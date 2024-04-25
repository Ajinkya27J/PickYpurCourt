const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    firstName: {type: String, required: [true, 'cannot be empty']},
    lastName: {type: String, required: [true, 'cannot be empty']},
    email: {type: String, required: [true, 'cannot be empty'], unique: true},
    password: {type: String, required: [true, 'cannot be empty'], minlength: 8}
})

// replace plaain text password with hashed password  before saving the document in database
// pre middleware

userSchema.pre('save', function(next) {
    let user = this;
    if(!user.isModified('password')) {
        return next();
    }
    bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(user.password, salt)
        .then(hash => {
            user.password = hash;
            next();
        })
        .catch(err => next(err));
        })
});

//implement a method to compare the login password and the hash stored in the database
userSchema.methods.comparePassword = function(loginPassword) {
    return bcrypt.compare(loginPassword, this.password);
}
module.exports = mongoose.model('User', userSchema);