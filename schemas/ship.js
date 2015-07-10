var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var ShipSchema = new Schema({
    user_id:{type:ObjectId,ref:'User'},
    order_id:{type:ObjectId,ref:'Order'},
    company:{type:String},
    com:{type:String},
    shipNo:{type:String},
    packages:[
    {type:ObjectId,ref:'Detail'}
    ],
    who: {type:String},
    contact: {type: String},
    where: {type:String},
    createAt: {
        type: Date,
         default: Date.now()
    },
    updateAt: {
        type: Date,
         default: Date.now()
    }
})
ShipSchema.pre('save', function(next) {
     if (this.isNew) {
        this.createAt = this.updateAt = Date.now()
    }
    else {
        this.updateAt = Date.now()
    }

    next()
})

ShipSchema.statics = {
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


module.exports = ShipSchema