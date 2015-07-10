var mongoose = require('mongoose')
var BrandSchema = require('../schemas/brand')
var Brand = mongoose.model('Brand', BrandSchema)

module.exports = Brand