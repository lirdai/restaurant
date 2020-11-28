const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')



const ReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }, 
    title: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    }, 
    date: {
        type: Date, 
        default: Date.now
    }, 
    likes: {
        type: Number,
        required: true,
        default: 0
    },
})



ReviewSchema.plugin(uniqueValidator)
module.exports = mongoose.model('Review', ReviewSchema)