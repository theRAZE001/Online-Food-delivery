const mongoose = require('mongoose');
const Product = require('../models/product');
mongoose.connect('mongodb://localhost:27017/OnlineFood', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
});

const seedProducts = [
    {
        name: '5 Cheese Pizza',
        image: 'https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1024/iuosrezgdx1yg8ouqwxt',
        price: 545,
        description: 'Italian Sauce + Mozzarella Cheese + Smoked Mozzarella Cheese + Cheddar Cheese + Proccesed Cheese + Cheese Spread',
        category: 'pizza',
    },
    {
        name: 'Spicy Mexican Burger',
        image: 'https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1024/znammgb4xjf3vugud1oh',
        price: 108,
        description: 'This wholesome burger patty is made with fresh chickpeas, topped with the irresistable tangy sauce & veggies. Bursts with flavour in every bite!',
        category: 'burger',
    },
    {
        name: 'Berry Cheesecake Ice Cream',
        image: 'https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1024/u2n9myutmfwexugyvbe5',
        price: 59,
        description: 'Cheesecake ice cream with berry sauce & biscuit crumb',
        category: 'ice_cream',
    },
    {
        name: 'Indian Treat Pizza',
        image: 'https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1024/vtx9notsxbyf4o5pjtg8',
        price: 345,
        description: 'Marinara Sauce + Shredded Mozzarella Cheese + Sweet Corn + Onions + Yellow Capsicum + Green Capsicum + Jalapenos',
        category: 'pizza',
    },
    {
        name: 'Big Crunch Burger',
        image: 'https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1024/fclhpxmvo9coimj98dko',
        price: 140,
        description: 'A fully loaded veg patty, topped with a peppery sauce between our super soft bun, promises a crunch in every bite.',
        category: 'burger',
    },
]

Product.insertMany(seedProducts);