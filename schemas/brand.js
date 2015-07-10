var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var BrandSchema = new Schema({
    category_id:{type:ObjectId,ref:'Category'},
    brandName:{type:String},
    brandDesp:{type:String},
    brandPic:{type:String},
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
BrandSchema.pre('save', function(next) {
      if (this.isNew) {
        this.createAt = this.updateAt = Date.now()
    }
    else {
        this.updateAt = Date.now()
    }

    next()
})

BrandSchema.statics = {
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


module.exports = BrandSchema