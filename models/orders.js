const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items:
    {
        type: Object,
        required: true
    },
    phone:
    {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    payment: {
        type: String,
        required: true,
    },
    paymentStatus: {
        type: Boolean,
        default: false
    },
    orderStatus: {
        type: String,
        required: true,
        default: 'Placed'
    },
},
    { timestamps: true }
)

module.exports = mongoose.model('Order', orderSchema);