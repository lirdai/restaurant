const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')



const DeliverSchema = new mongoose.Schema({
    orderlist: [
        {
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
            }
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    courtier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    ordered: {
        type: Boolean,
        default: false
    },
    accepted: {
        type: Boolean,
        default: false
    },
    delivered: {
        type: Boolean,
        default: false
    },
    price: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
        default: 0.00
    },
    purchase_date: {
        type: Date, 
        default: Date.now
    },
    email: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        default: null
    },
    street: {
        type: String,
        default: null
    },
    street2: {
        type: String,
        default: null
    },
    city: {
        type: String,
        default: null
    },
    postal_code: {
        type: String,
        default: null
    }
})



DeliverSchema.plugin(uniqueValidator)
module.exports = mongoose.model('Deliver', DeliverSchema)