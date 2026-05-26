const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose'); // Add this

const signupSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add this line - it adds username, hash, salt fields
signupSchema.plugin(passportLocalMongoose, {
    usernameField: 'email'
});

module.exports = mongoose.model('Signup', signupSchema);