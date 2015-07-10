var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var CartSchema = new Schema({
    user_id:{type:ObjectId,ref:'User'},
    brand_id:{type:ObjectId,ref:'Brand'},
    differs:[{
        differ_id:{type:ObjectId,ref:'Differ'},
        product_id:{type:ObjectId,ref:"Product"},
        num:{type:Number,default:1,min:1,max:999},
        pic_id:{type:ObjectId,ref:'Pic'}
    }],
    meta:{
        createAt: {
            type: Date,
            default: Date.now()
        },
        updateAt: {
            type: Date,
            default: Date.now()
        }
    }
})
CartSchema.pre('save', function(next) {
    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now()
    }
    else {
        this.meta.updateAt = Date.now()
    }

    next()
})

CartSchema.statics = {
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


module.exports = CartSchema