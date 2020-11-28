const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')



const OrderListSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food",
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
    },
    purchase_date: {
        type: Date, 
        default: Date.now
    },
    deliver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Deliver",
    }
})



OrderListSchema.plugin(uniqueValidator)
module.exports = mongoose.model('OrderList', OrderListSchema)