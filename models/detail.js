var mongoose = require('mongoose')
var DetailSchema = require('../schemas/detail')
var Detail = mongoose.model('Detail', DetailSchema)

module.exports = Detail