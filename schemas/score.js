var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var ScoreSchema = new Schema({
    name:{type:String},//姓名
    sex:{type:String,default:'无'},//性别
    com:{type:String},//公司
    title:{type:String},//演讲文 题目
    phone:{type:String},//手机号码
    rankNo:{type:Number,default:0},//排名
    comNo:{type:Number,default:0},//上场号码
    scores:[{type:Number}],
    score:{type:Number,default:0},
    createAt: {
        type: Date,
         default: Date.now()
    },
    updateAt: {
        type: Date,
         default: Date.now()
    },
    state:{type:Number}
})
ScoreSchema.pre('save', function(next) {
    if (this.isNew) {
        this.createAt = this.updateAt = Date.now()
    }
    else {
        this.updateAt = Date.now()
    }
    next()
})

ScoreSchema.statics = {
    fetch: function(cb) {
        return this
            .find({})
            .sort('meta.updateAt')
            .exec(cb)
    },
    findById: function(id, cb) {
        return this
            .findOne({_id: id})
            .exec(cb)
    }
}


module.exports = ScoreSchema