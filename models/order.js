var mongoose = require('mongoose')
var OrderSchema = require('../schemas/order')
var Order = mongoose.model('Order', OrderSchema)

module.exports = Order