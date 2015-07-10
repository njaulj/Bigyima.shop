var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var AddressSchema = new Schema({
    user_id: {type: ObjectId, ref: 'User'},
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
    },
    state:{type:Number}
})
AddressSchema.pre('save', function(next) {
    if (this.isNew) {
        this.createAt = this.updateAt = Date.now()
    }
    else {
        this.updateAt = Date.now()
    }

    next()
})

AddressSchema.statics = {
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


module.exports = AddressSchema