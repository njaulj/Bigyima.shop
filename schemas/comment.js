var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var CommentSchema = new Schema({
    product_id:{type:ObjectId,ref:'Product'},
    from: {type: ObjectId, ref: 'User'},
  	reply: [{
	    from: {type: ObjectId, ref: 'User'},
	    to: {type: ObjectId, ref: 'User'},
	    content: {type:String}
  	}],
    rating:{type:Number,default:500},
  	content: {type:String},
 	createAt: {
        type: Date,
         default: Date.now()
    },
    updateAt: {
        type: Date,
         default: Date.now()
    }
})
CommentSchema.pre('save', function(next) {
      if (this.isNew) {
        this.createAt = this.updateAt = Date.now()
    }
    else {
        this.updateAt = Date.now()
    }
    next()
})

CommentSchema.statics = {
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

module.exports = CommentSchema