var mongoose = require('mongoose')
var Cart = mongoose.model('Cart')
var User = mongoose.model('User')
var _= require('underscore')



exports.addCart = function(req,res){

    var _cart =  {
        user_id:req.session.user._id,
        brand_id : req.params.bid,
        product_id:req.params.pid,
        differ_id:req.params.did,
        num:req.params.num,
        pic_id:req.params.picid
    }

    var cart = new Cart(_cart)
    cart.save(function(err, cart) {
        if (err) {
            console.log(err)
        }
        User.findById(req.session.user._id,function(err,user){

            //console.log(user     )
            var query = {"_id": user._id};
            var update = {$inc:{cart: 1}};
            var options = {new: true};
            User.findOneAndUpdate(query, update, options, function(err, user) {
                req.session.user=user;
                res.json({success:1})
                // at this point person is null.
            });
        })

    })
}


exports.cart = function(req,res){
    Cart
        .find({user_id:req.session.user._id})
        .populate('product_id')
        .populate('differ_id')
        .populate('pic_id')
        .exec(function(err,carts){
            console.log(carts)
            res.render('testCart',{
                user:req.session.user,
                carts:carts
            })
        })
}

exports.new = function(req,res){
    var _cart = {
        user_id :'5535bd90f2f23c1e4b7a3aeb',
        differ_id:'5535b84b790db2f44a985288',
        num:10
    }
    var cart = new Cart(_cart)
    cart.save(function(err, cart) {
        if (err) {
            console.log(err)
        }

        res.send('success')
    })
}

exports.addOnce= function(req,res){
    var cid = req.params.cid;
    var query = {"_id": cid};
    var update = {$inc:{num: 1}};
    var options = {new: true};
    Cart.findById(cid,function(err,cart){
        if(cart.num>0 &&cart.num<999){
            console.log(cart.num)

            Cart.findByIdAndUpdate(query,update,options,function(err,cart){
                res.json({success:1})
            })
        }
    })

}


exports.minusOnce= function(req,res){
    var cid = req.params.cid;
    var query = {"_id": cid};
    var update = {$inc:{num: -1}};
    var options = {new: true};
    Cart.findById(cid,function(err,cart){
        if(cart.num>1){
            console.log(cart.num)
            Cart.findByIdAndUpdate(query,update,options,function(err,cart){
                res.json({success:1})
            })
        }
    })
}

exports.delOnce= function(req,res){
    var cid = req.params.cid;
    var query = {"_id": cid};
    Cart.findByIdAndRemove(query,function(err,cart){
        console.log(cart)
        res.json({success:1})
    })
}