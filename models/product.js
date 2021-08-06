const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: String,
    price: String,
    description: String,
    category: String
})

module.exports = mongoose.model('Product', productSchema);