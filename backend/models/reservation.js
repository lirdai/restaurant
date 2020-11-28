const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')



const ReservationSchema = new mongoose.Schema({
    reservedAt: {
        type: String, 
        required: true
    },
    time: {
        type: String,
        required: true
    },
    customers: {
        type: Number,
        required: true
    },
    email: String,
    phone: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    check: {
        type: Boolean,
        default: false
    }
})



ReservationSchema.plugin(uniqueValidator)
module.exports = mongoose.model('Reservation', ReservationSchema)