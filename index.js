const express = require('express')
app = express()
const path = require('path')
const mongoose = require('mongoose')
const Campground = require('./models/product')
const User = require('./models/user')
const expressLayouts = require('express-ejs-layouts')
const passport = require('passport')
const localStrategy = require('passport-local')
mongoose.connect('mongodb://localhost:27017/foodOrdering', {
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
app.set('views', path.join(__dirname, 'views'))

app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.get('/fakeuser', async (req, res) => {
  const user = new User({ name: 'Rakesh', email: 'rakeshmandal547@gmail.com' })
  const newUser = await User.register(user, 'sulkychcken')
  res.send(newUser)
})

// Routes
app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))

app.post('/register', (req, res) => {
  console.log(req.body)
})

app.listen(3000, () => {
  console.log('listening on port 3000...')
})
