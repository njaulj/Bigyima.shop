var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var OrderSchema = new Schema({
    user_id:{type:ObjectId,ref:'User'},
    total:{type:Number,default:0},
    who: {type:String},
    contact: {type: String},
    where: {type:String}
    ,
    state:{type:Number,default:1},
    payment:{type:Number},
    createAt: {
        type: Date,
         default: Date.now()
    },
    updateAt: {
        type: Date,
         default: Date.now()
    }
})
OrderSchema.pre('save', function(next) {
     if (this.isNew) {
        this.createAt = this.updateAt = Date.now()
    }
    else {
        this.updateAt = Date.now()
    }

    next()
})

OrderSchema.statics = {
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


module.exports = OrderSchema