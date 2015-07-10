var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var DetailSchema = new Schema({
    user_id:{type:ObjectId,ref:'User'},
    order_id:{type:ObjectId,ref:'Order'},
    brand_id:{type:ObjectId,ref:'Brand'},
    differ_id:{type:ObjectId,ref:'Differ'},
    product_id:{type:ObjectId,ref:"Product"},
    shipment:{type:ObjectId,ref:'Ship'},
    detailPrice:{type:Number},
    num:{type:Number,default:1,min:1,max:999},
    subtotal:{type:Number,default:0},
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
DetailSchema.pre('save', function(next) {
      if (this.isNew) {
                this.createAt = this.updateAt = Date.now()
            }
            else {
                this.updateAt = Date.now()
            }

    next()
})

DetailSchema.statics = {
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


module.exports = DetailSchema