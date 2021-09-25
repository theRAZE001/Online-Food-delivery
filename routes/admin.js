const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/product')
const User = require('../models/user');
const Order = require('../models/orders');
const admin = require('../middlewares/adminAuth');



router.get('/', admin, async (req, res) => {
    await Order.find({ orderStatus: { $ne: 'delivered' } }, null, { sort: { 'createdAt': -1 } })
        .populate('userId', '-password').exec((err, orders) => {
            res.render('admin/orders', { orders })
        })
})
router.get('/products', admin, async (req, res) => {
    const product = await Product.find({}, null, { sort: { createdAt: 1 } });
    res.render('admin/products', { product })
})
router.get('/users', (req, res) => {
    res.send('admin users page')
})
router.post('/update-status/:id', admin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    console.log(status)
    await Order.updateOne({ _id: id }, { orderStatus: status },
        (err, data) => {
            if (err) {
                res.redirect('/admin/orders')
            }
            const eventEmmiter = req.app.get('eventEmmiter')
            eventEmmiter.emit('orderUpdated', { id: id, status: status })
            res.redirect('/admin/orders')
        });
})
router.get('/product/:id/edit', admin, async (req, res) => {
    const { id } = req.params;
    const item = await Product.findOne({ _id: id })
    res.render('admin/edit', { item })
})
router.post('/product/:id/update', admin, async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    res.redirect('/admin/products')
})
router.get('/product/new', admin, (req, res) => {
    res.render('admin/new')
})
router.post('/product/new', admin, async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save()
    res.redirect('/admin/products')
})
router.get('/product/:id/delete', admin, async (req, res) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id)
    res.redirect('/admin/products')
})
module.exports = router;