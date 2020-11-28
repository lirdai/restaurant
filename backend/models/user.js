const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')



const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    name: String,
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    street: {
        type: String,
        required: true
    },
    street2: String,
    city: {
        type: String,
        required: true
    },
    postal_code: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    reservations_history: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reservation'
        }
    ],
    reviews_history: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    deliverys_history: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Deliver'
        }
    ]
})



UserSchema.plugin(uniqueValidator)
module.exports = mongoose.model('User', UserSchema)