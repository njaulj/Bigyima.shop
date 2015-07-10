var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var ProductSchema = new Schema({
    brand_id:{type:ObjectId,ref:'Brand'},
    productName:{type:String},
    productDesp:{type:String},
    shortDesp:{type:String},
    productMeta:{type:String},
    keywords:{type:String},
    differShow:{type:ObjectId,ref:'Differ'},
    pv:{type:Number,default:0},
    sold:{type:Number,default:0},
    state:{type:Number,default:0},
    createAt: {
        type: Date,
         default: Date.now()
    },
    updateAt: {
        type: Date,
         default: Date.now()
    },
    availableFrom:{
        type: Date
     },
     availableTo:{
        type: Date
     }
})
ProductSchema.pre('save', function(next) {
      if (this.isNew) {
        this.createAt = this.updateAt = Date.now()
    }
    else {
        this.updateAt = Date.now()
    }

    next()
})

ProductSchema.statics = {
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

module.exports = ProductSchema