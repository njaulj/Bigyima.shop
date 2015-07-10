var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var cartSchema = new Schema({
    user_id:{type:ObjectId,ref:'User'},
    brand_id:{type:ObjectId,ref:'Brand'},
    differ_id:{type:ObjectId,ref:'Differ'},
    product_id:{type:ObjectId,ref:"Product"},
    num:{type:Number,default:1,min:1,max:999},
    pic_id:{type:ObjectId,ref:'Pic'},
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
cartSchema.pre('save', function(next) {
      if (this.isNew) {
        this.createAt = this.updateAt = Date.now()
    }
    else {
        this.updateAt = Date.now()
    }
  //  this.subtotal=parseFloat(this.price*this.num).toFixed(2)
    next()
})

cartSchema.statics = {
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


module.exports = cartSchema