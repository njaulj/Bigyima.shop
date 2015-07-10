var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var SearchSchema = new Schema({
	group_id:{type:ObjectId,ref:'Group'},
	groupName:{type:String},
	category_id:{type:ObjectId,ref:'category'},
	categoryName:{type:String},
	brand_id:{type:ObjectId,ref:'Brand'},
	brandName:{type:String},
    product_id:{type:ObjectId,ref:'Product'},
    productName:{type:String},
    differ_id:{type:ObjectId,ref:'Differ'},
    differName:{type:String},
    picPath:{type:String},
    differPrice:{type:Number},
    keywords:{type:String},
    groupState:{type:Number},
    categoryState:{type:Number},
    brandState:{type:Number},
    differState:{type:Number},
    productState:{type:Number},
    pv:{type:Number},
    differSold:{type:Number},
    productSold:{type:Number},
    rating:{type:Number},
 	createAt: {
        type: Date,
         default: Date.now()
    },
    updateAt: {
        type: Date,
         default: Date.now()
    }
})
SearchSchema.pre('save', function(next) {
      if (this.isNew) {
        this.createAt = this.updateAt = Date.now()
    }
    else {
        this.updateAt = Date.now()
    }
    next()
})

SearchSchema.statics = {
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

module.exports = SearchSchema