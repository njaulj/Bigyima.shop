var mongoose = require('mongoose')
var AddressSchema = require('../schemas/address')
var Address = mongoose.model('Address', AddressSchema)

module.exports = Address