const express = require('express');
const router = express.Router();
const User = require('../models/user')
const bcrypt = require('bcrypt');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
// Render Login Page
router.get('/login', (req, res) => {
    res.render('login')
})

// Render Register Page
router.get('/register', (req, res) => {
    res.render('register')
})

// Post Registration form data
router.post('/register', async (req, res) => {
    const { name, email, password, repassword } = req.body;
    const isAvailable = await User.findOne({ email: email.toLowerCase() });
    let errors = []

    if (isAvailable) {
        errors.push({ msg: "email is already taken" });
    }
    if (password.length < 6) {
        errors.push({ msg: "password should not be less than 6 characters" })
    }
    else if (repassword !== password) {
        errors.push({ msg: "passwords do not match" });
    }
    if (errors.length === 0) {
        const newUser = { name, email, password };
        const addUser = new User(newUser);
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(addUser.password, salt, (err, hash) => {
                addUser.password = hash;
                addUser.save();
            })
        })
        req.flash('success_msg', 'Successfully created you account')
        res.redirect('/');
    }
    else {
        res.render('register', { errors, name, email, password });
    }

})
router.get('/', (req, res) => {
    res.render('home')
})
passport.use(new localStrategy({ usernameField: 'email' }, function (email, password, done) {
    User.findOne({ email: email }, function (err, user) {
        if (err) { return done(err); }
        if (!user) {
            return done(null, false, { message: "Email id is not registered" });
        }
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: "invalid password" });
            }
        })
    })
}));
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});
// Post Login form data
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
    req.flash('success_msg', 'Logged in successfully')
});


module.exports = router;
