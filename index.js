const express = require('express')
app = express()
const path = require('path')
const mongoose = require('mongoose')
const axios = require('axios');
const Product = require('./models/product')
const User = require('./models/user');
const Order = require('./models/orders');
require('dotenv').config();

const ejsMate = require('ejs-mate')
const bcrypt = require('bcrypt');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const MongoDbStore = require('connect-mongo')(session);
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const override = require('method-override')
const Emmiter = require('events')

mongoose.connect('mongodb://localhost:27017/OnlineFood', {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
})
//Connect to mongoDB
const db = mongoose.connection
db.on('error', console.error.bind(console, 'Connection Error'))
db.once('open', () => {
  console.log('Database Connected')
})
app.use(express.urlencoded({ extended: true }))
app.use(override('_method'));
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());

app.use(cookieParser('secret'));
app.use(session({
  secret: 'secret',
  resave: false,
  store: new MongoDbStore({
    mongooseConnection: db,
    collection: 'sessions'
  }),
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24
  }
}));
const eventEmmiter = new Emmiter()
app.set('eventEmmiter', eventEmmiter)

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use('/static', express.static(path.join(__dirname, 'public')));


app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.session = req.session;
  next();
})

// Routes
app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))
app.use('/order', require('./routes/order'))
app.use('/admin', require('./routes/admin'))



const server = app.listen(3000, () => {
  console.log('listening on port 3000...')
})


const io = require('socket.io')(server)

io.on('connection', (socket) => {
  socket.on('join', roomName => {
    socket.join(roomName)
  })
})

eventEmmiter.on('orderUpdated', (data) => {
  io.to(`order_${data.id}`).emit('orderUpdated', data)
})