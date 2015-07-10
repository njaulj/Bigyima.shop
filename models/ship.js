var mongoose = require('mongoose')
var ShipSchema = require('../schemas/ship')
var Ship = mongoose.model('Ship', ShipSchema)

module.exports = Ship