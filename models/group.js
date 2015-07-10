var mongoose = require('mongoose')
var GroupSchema = require('../schemas/group')
var Group = mongoose.model('Group', GroupSchema)

module.exports = Group