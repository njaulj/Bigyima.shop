var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var DifferSchema = new Schema({
    product_id:{type:ObjectId,ref:'Product',default:'556065f33d6ead8f0738ede3'},
    differName:{type:String},
    marketPrice:{type:Number},
    amount:{type:Number,default:999},
    differPrice:{type:Number},
    picPath:{type:String},
    sold:{type:Number,default:0},
    state:{type:Number,default:1},
    createAt: {
        type: Date,
         default: Date.now()
    },
    updateAt: {
        type: Date,
         default: Date.now()
    }
})

DifferSchema.pre('save', function(next) {
     if (this.isNew) {
        this.createAt = this.updateAt = Date.now()
    }
    else {
        this.updateAt = Date.now()
    }

    next()
})

DifferSchema.statics = {
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
module.exports = DifferSchema