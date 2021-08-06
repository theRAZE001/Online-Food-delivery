const express = require('express')
const router = express.Router()

// Render Login Page
router.get('/login', (req, res) => {
    res.render('login')
})

// Render Register Page
router.get('/register', (req, res) => {
    res.render('register')
})

// Post Registration form data
router.post('/register', (req, res) => {
    const { name, email, password, repassword } = req.body
})

// Post Login form data
router.post('/login', (req, res) => {
    console.log(req.body)
})

module.exports = router
