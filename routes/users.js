const express = require('express');
const router = express.Router();
const User = require('../models/user')
const Order = require('../models/orders')
const bcrypt = require('bcrypt');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const auth = require('../middlewares/auth');
const moment = require('moment');
const crypto = require('crypto');
const nodemailer = require('nodemailer')
const validator = require('email-validator');
const user = require('../models/user');

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL, // generated ethereal user
        pass: process.env.PASSWORD, // generated ethereal password
    },
});

router.get('/login', (req, res) => {
    res.render('login')
})

// Render Register Page
router.get('/register', (req, res) => {
    res.render('register')
})
router.get('/resend-mail', (req, res) => {
    transporter.sendMail({
        from: process.env.EMAIL, // sender address
        to: req.user.email, // list of receivers
        subject: "Account verification", // Subject line
        text: `Click the below link to verify your account
        http://localhost:3000/users/verify-account?token=${req.user.emailToken}
        `, // plain text body
        html: `<b>Click the below link to verify your email</b>
        <a href='http://localhost:3000/users/verify-account?token=${req.user.emailToken}'>Click Here to verify</a>`,
    });
})

// Post Registration form data
router.post('/register', async (req, res) => {
    const { name, email, password, repassword } = req.body;
    let lcaseEmail = email.toLowerCase();
    const emailToken = crypto.randomBytes(64).toString('hex');
    const isAvailable = await User.findOne({ email: email.toLowerCase() });
    let errors = []
    if (!validator.validate(email)) {
        errors.push({ msg: 'Enter a valid email!!' })
    }
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
        const newUser = {
            username: name,
            email: lcaseEmail,
            password: password,
            emailToken: emailToken,
            isVerified: false
        };
        const addUser = new User(newUser);
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(addUser.password, salt, (err, hash) => {
                addUser.password = hash;
                addUser.save();
                //Login user after registering
                req.login(addUser, (err) => {
                    if (err) return next(err);
                    req.flash('success_msg', 'Successfully created you account! An verification link has been send to your email, please confirm your account')
                    transporter.sendMail({
                        from: process.env.EMAIL, // sender address
                        to: newUser.email, // list of receivers
                        subject: "Account verification", // Subject line
                        text: `Click the below link to verify your account
                        http://localhost:3000/users/verify-account?token=${emailToken}
                        `, // plain text body
                        html: `<b>Click the below link to verify your email</b>
                        <a href='http://localhost:3000/users/verify-account?token=${emailToken}'>Click Here to verify</a>`,
                    });
                    res.redirect('/menu');
                })
            })
        })

    }
    else {
        res.render('register', { errors, name, email, password });
    }
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
// Post Login form data
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/menu',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
    req.flash('success_msg', `Welcome Back`)
});


router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'successfully logged out!');
    res.redirect('login');
});

router.get('/verify-account', async (req, res) => {
    const { token } = req.query
    if (req.user.emailToken === token) {
        await User.updateOne({
            _id: req.user.id
        }, { isVerified: true, emailToken: null }, function (err, result) {
            if (err) {
                console.log(err)
            }
        })
        req.flash('success_msg', 'Successfully verified your account!')
        res.redirect('/menu')
    }
})
router.get('/profile', async (req, res) => {
    const orders = await Order.find({ userId: req.user._id })
    res.render('profile', { orders })
})
router.get('/resend-verification-mail', async (req, res) => {
    const emailToken = crypto.randomBytes(64).toString('hex');
    await User.updateOne({ _id: req.user._id }, { emailToken: emailToken });
    transporter.sendMail({
        from: process.env.EMAIL, // sender address
        to: req.user.email, // list of receivers
        subject: "Account verification", // Subject line
        text: `Click the below link to verify your account
        http://localhost:3000/users/verify-account?token=${emailToken}
        `, // plain text body
        html: `<b>Click the below link to verify your email</b>
        <a href='http://localhost:3000/users/verify-account?token=${emailToken}'>Click Here to verify</a>`,
    });
    req.flash('success_msg', 'An verification link has been send to your email, please confirm your account')
    res.redirect('/users/profile')
})

router.post('/reset/password', async (req, res) => {
    let { email } = req.body;
    email = email.toLowerCase()
    const user = await User.findOne({ email: email })
    const passwordToken = crypto.randomBytes(64).toString('hex');
    if (user) {
        transporter.sendMail({
            from: process.env.EMAIL, // sender address
            to: user.email, // list of receivers
            subject: "Password Reset", // Subject line
            text: `Click the below link to reset password
            http://localhost:3000/users/reset-password?token=${passwordToken}
            `, // plain text body
            html: `<b>Click the below link to reset your passwords</b>
            <a href='http://localhost:3000/users/reset-password?token=${passwordToken}'>Click Here to verify</a>`,
        });
        user.emailToken = passwordToken;
        await user.save()

        req.flash('success', 'Check your email for password reset link')
        res.redirect('/users/reset/email')
    } else {
        req.flash('error', 'No account Found!')
        res.redirect('/users/reset/email')
    }

})
router.get('/reset-password', async (req, res) => {
    const { token } = req.query
    let user = await User.findOne({ emailToken: token })
    res.render('new-pass', { user })
})
router.post('/save-password', async (req, res) => {
    const { password, repassword } = req.body
    const { token } = req.query
    const user = await User.findOne({ emailToken: token })
    let error = []
    if (password.length < 6) {
        error.push({ msg: "password should not be less than 6 characters" })
    }
    else if (repassword !== password) {
        error.push({ msg: "passwords do not match" });
    }
    if (error.length !== 0) {
        res.render('new-pass', { user, error })
    } else {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
                user.password = hash;
                user.emailToken = null;
                user.save();
                req.flash('success', 'successfully changed your password now you can login with new password');
                res.redirect('/users/login')
            })
        })
    }

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
// Post Login form data
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/menu',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
    req.flash('success_msg', `Welcome Back`)
});
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

router.get('/reset/email', (req, res) => {
    res.render('reset')
})
router.post('/update-username', async (req, res) => {
    const { id, username } = req.body;
    await User.updateOne({ _id: id }, { username: username })
    return res.json({ msg: 'Username Updated Successfully!' })
})
router.get('/orders', auth, async (req, res) => {
    const allOrders = await Order.find({ userId: req.user._id }, null, { sort: { 'createdAt': -1 } })
    res.render('orders', { allOrders, moment: moment });
})
router.get('/orders/show/:id', auth, async (req, res) => {
    const { id } = req.params
    const order = await Order.findById(id)
    if (req.user._id.toString() === order.userId.toString()) {
        res.render('show', { order, moment: moment });
    } else {
        res.redirect('/menu')
    }
})
module.exports = router;
