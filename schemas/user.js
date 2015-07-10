var mongoose = require('mongoose')
var Schema = mongoose.Schema
var bcrypt = require('bcrypt')
var SALT_WORK_FACTOR = 10

var UserSchema = new Schema({
    userName:{type:String},
    password:{type:String},
    phone:{type:String},
    role:{type:Number,default:0},
    message:{type:Number,default:0},
    cart:{type:Number,default:0},
    money:{type:Number,default:0},
    order:{type:Number,default:0},
    cost:{type:Number,default:0},
    createAt: {
        type: Date,
         default: Date.now()
    },
    updateAt: {
        type: Date,
         default: Date.now()
    },
    lastLogin:{
        type:Date
    }
})

UserSchema.pre('save', function(next) {
    var user = this

      if (this.isNew) {
        this.createAt = this.updateAt = Date.now()
    }
    else {
        this.updateAt = Date.now()
    }
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err)

        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err)

            user.password = hash
            next()
        })
    })
})

UserSchema.methods = {
    comparePassword: function(_password,cb) {
        bcrypt.compare(_password, this.password, function(err, isMatch) {
            if (err) return cb(err)

            cb(null, isMatch)
        })
    }
}

UserSchema.statics = {
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



module.exports = UserSchema