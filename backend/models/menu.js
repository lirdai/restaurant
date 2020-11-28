const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')



const Foodschema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  description: {
    type: String,
    unique: true,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
  },
})



Foodschema.plugin(uniqueValidator)
module.exports = mongoose.model('Food', Foodschema)