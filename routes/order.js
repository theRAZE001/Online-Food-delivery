const express = require('express')
const router = express.Router();
const Order = require('../models/orders')
const User = require('../models/user')
const auth = require('../middlewares/auth');
const { session } = require('passport');
const { phone } = require('phone');
const stripe = require('stripe')(process.env.SECRET_KEY);
router.get('/details', auth, (req, res) => {
    if (req.session.cart && req.session.cart.totalQty === 0) {
        req.flash('error', 'First add some items to cart');
        return res.redirect('/menu');
    } else {
        return res.render('details')
    }
})
let orderId = null
router.post('/confirm-order', async (req, res) => {
    const { name, phoneno, address, paymentType, stripeToken } = req.body;
    if (!phone(`+91 ${phoneno}`).isValid) {
        return res.json({ err: 'Invalid Phone, please enter a valid phone from India' })
    } else {
        const order = new Order({
            userId: req.user._id,
            items: req.session.cart,
            phone: phoneno,
            address: address,
            payment: paymentType,
            orderStatus: 'Placed'
        })
        await order.save().then(() => {
            orderId = order._id
        });
        // const allOrders = await Order.find({ userId: req.user._id }, null, { sort: { 'createdAt': -1 } });
        if (paymentType === 'card') {
            stripe.charges.create({
                amount: req.session.cart.totalPrice * 100,
                source: stripeToken,
                currency: 'inr',
                description: `order Id: ${orderId}`
            }).then(() => {
                order.paymentStatus = true;
                delete req.session.cart;
                order.save().then(() => {
                    return res.json({ message: 'Order placed, payement successful! Redirecting.......' })
                })
            }).catch(err => {
                delete req.session.cart;
                return res.json({ messge: 'Payment failed, order placed, You can pay at delivery time' })
            })
        } else {
            delete req.session.cart;
            return res.json({ message: 'Order placed Successfully!' })
        }
    }
})
router.get('/orders', (req, res) => {
    res.render("orders")
})
module.exports = router;