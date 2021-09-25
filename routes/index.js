const express = require('express')
const router = express.Router();
const mongoose = require('mongoose')
const passport = require('passport');
const Product = require('../models/product')
const axios = require('axios');
const { session } = require('passport');
const { json } = require('express');

router.get('/', (req, res) => {
    res.render('home')
})
router.get('/menu', async (req, res) => {
    const query = req.query.search;
    if (query) {
        const product = await Product.find({ name: { $regex: query, $options: '$i' } })
        if (product.length > 0) {
            res.render('menu', { product, noResult: null })
        } else {
            res.render('menu', { product: [], noResult: `No matching items found for ${query}` })
        }
    }
    const product = await Product.find({}, null, { sort: { 'updatedAt': -1 } });
    res.render('menu', { product, noResult: null });
})
router.get('/pizza', async (req, res) => {
    const product = await Product.find({ category: 'pizza' }, null, { sort: { 'updatedAt': -1 } });
    res.render('menu', { product, noResult: null });
})
router.get('/burger', async (req, res) => {
    const product = await Product.find({ category: 'burger' }, null, { sort: { 'updatedAt': -1 } });
    res.render('menu', { product, noResult: null });
})

router.post('/add-to-cart', (req, res) => {
    const { _id, name, image, price } = req.body;
    const product = { _id, name, image, price };
    if (!req.session.cart) {
        req.session.cart = {
            items: {},
            totalQty: 0,
            totalPrice: 0
        }

    }
    let cart = req.session.cart;
    if (!cart.items[product._id]) {
        cart.items[product._id] = {
            item: product,
            qty: 1
        }
        cart.totalQty = cart.totalQty + 1;
        cart.totalPrice = cart.totalPrice + product.price;
    } else {
        cart.items[product._id].qty = cart.items[product._id].qty + 1;
        cart.totalQty = cart.totalQty + 1;
        cart.totalPrice = cart.totalPrice + product.price;
    }
    return res.json({ totalQty: req.session.cart.totalQty })
})
router.post('/delete-item/:id', (req, res) => {
    const { id } = req.params;
    const removeItem = req.session.cart.items[id];
    if (req.session.cart.totalQty > 0) {
        req.session.cart.totalQty -= removeItem.qty;
    }
    if (req.session.cart.totalPrice > 0) {
        req.session.cart.totalPrice -= removeItem.item.price * removeItem.qty;
    }
    delete req.session.cart.items[id];
    res.redirect('/cart')
})
router.post('/increase-qty/:id', (req, res) => {
    const { id } = req.params;
    const increase = req.session.cart.items[id];
    if (increase.qty) {
        req.session.cart.items[id].qty += 1;
        req.session.cart.totalPrice += increase.item.price;
        req.session.cart.totalQty += 1;
    }
    // return res.json({
    //     qty: req.session.cart.items[id].qty,
    //     totalPrice: req.session.cart.totalPrice,
    //     totalQty: req.session.cart.totalQty
    // })
    res.redirect('/cart');
})
router.post('/decrease-qty/:id', (req, res) => {
    const { id } = req.params;
    const decrease = req.session.cart.items[id];
    if (decrease.qty !== 1) {
        req.session.cart.items[id].qty -= 1;
        req.session.cart.totalPrice -= decrease.item.price;
        req.session.cart.totalQty -= 1;
    }
    // return res.json({
    //     qty: req.session.cart.items[id].qty,
    //     totalPrice: req.session.cart.totalPrice,
    //     totalQty: req.session.cart.totalQty
    // })
    res.redirect('/cart');
})
router.get('/cart', (req, res) => {
    res.render('cart');
})

module.exports = router
