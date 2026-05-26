const express = require('express');
const expressSession = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const Registration = require('./models/Signup');
require('dotenv').config();
const connectDb = require('./config/db');

const app = express();
const port = 3000;

connectDb();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware - CHANGE saveUninitialized to true
app.use(expressSession({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,  // ← Change this to true
    cookie: { secure: false }  // ← Add this line
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(Registration.createStrategy());
passport.serializeUser(Registration.serializeUser());
passport.deserializeUser(Registration.deserializeUser());

// Routes
app.use('/', require('./routes/indexRoutes'));

app.listen(port, () => console.log(`Listening on port ${port}`));