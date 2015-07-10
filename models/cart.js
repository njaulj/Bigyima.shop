var mongoose = require('mongoose')
var CartSchema = require('../schemas/cart')
var Cart = mongoose.model('Cart', CartSchema)

module.exports = Cart