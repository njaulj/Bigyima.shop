var mongoose = require('mongoose')
var ScoreSchema = require('../schemas/score')
var Score = mongoose.model('Score', ScoreSchema)

module.exports = Score