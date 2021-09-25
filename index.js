const express = require('express')
app = express()
const path = require('path')
const mongoose = require('mongoose')
const Product = require('./models/product')
const User = require('./models/user')
const expressLayouts = require('express-ejs-layouts')
const bcrypt = require('bcrypt');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
mongoose.connect('mongodb://localhost:27017/foodtestdb1', {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'Connection Error'))
db.once('open', () => {
  console.log('Database Connected')
})
app.use(express.urlencoded({ extended: true }))
app.use(expressLayouts)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));

app.use(cookieParser('secret'));
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());



app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

// Routes
app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))



app.listen(3000, () => {
  console.log('listening on port 3000...')
})
