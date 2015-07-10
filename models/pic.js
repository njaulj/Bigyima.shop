var mongoose = require('mongoose')
var PicSchema = require('../schemas/pic')
var Pic = mongoose.model('Pic', PicSchema)

module.exports = Pic