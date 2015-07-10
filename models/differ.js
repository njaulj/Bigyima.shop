var mongoose = require('mongoose')
var DifferSchema = require('../schemas/differ')
var Differ = mongoose.model('Differ', DifferSchema)

module.exports = Differ