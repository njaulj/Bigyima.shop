var mongoose = require('mongoose')
var ProductSchema = require('../schemas/product')
var Product = mongoose.model('Product', ProductSchema)

module.exports = Product