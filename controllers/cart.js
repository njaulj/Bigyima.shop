var mongoose = require('mongoose')
var Cart = mongoose.model('Cart')
var Address= mongoose.model('Address')
var Differ = mongoose.model('Differ')
var User = mongoose.model('User')
var _= require('underscore')
var eventproxy = require('eventproxy')
var ainb = require('../libs/ainb')
var dedupe = require('dedupe')


exports.addCart = function(req,res){
    var differ_id=req.params.did
    var num = parseInt(req.params.num,10)
    if(num>0&&num<1000) {

        Cart.findOne({user_id: req.session.user._id, differ_id: differ_id,state:1}, function (err, cart) {
            if (err)console.log(err)
            if (cart) {
                cart.num = num
                cart.save(function(err,cart){
                    if (err)console.log(err)
                    res.json({success: 2})//表示已存在并更新数量
                })
            } else {
                    var _cart = {
                        user_id: req.session.user._id,
                        brand_id: req.params.bid,
                        product_id: req.params.pid,
                        differ_id: differ_id,
                        num: num
                    }
                    console.log(_cart)
                    var cart = new Cart(_cart)
                    cart.save(function (err, cart) {
                        User.findByIdAndUpdate(req.session.user._id,{$inc:{cart:1}},{new:true},function(err,user){
                            req.session.user= user
                          //  console.log(req.session.user)
                            if (err)console.log(err)
                            res.json({success:1})
                        })

                    })


            }
        })
    }else{
        res.json({success:3})//数量有问题
    }


}


exports.cart = function(req,res) {
    Cart
        .find({user_id: req.session.user._id,state:1})
        .populate('brand_id')
        .populate('differ_id')
        .populate('product_id')
        .populate('pic_id')
        .exec(function (err, carts) {
           // console.log(carts)
            // console.log(carts[0].differs[0])
            //     res.render('testCart',{
            //       user:req.session.user,
            //     carts:carts
            //   })
            var brands =new Array()
            for(var i =0;i<carts.length;i++) {
              //  console.log(carts[i].brand_id._id)
                brands.push(carts[i].brand_id._id+'-'+carts[i].brand_id.brandName)
            }
            var xbrands = dedupe(brands)
            console.log(xbrands)
          //  console.log(xbrands.length)
            var total= orderTotal(carts)
            console.log(total)
            res.render('mycart',{
                user:req.session.user,
                carts:carts,
                xbrands:xbrands,
                total:total
            })
        })
}


exports.ajaxcart = function(req,res) {
    Cart
        .find({user_id: req.session.user._id,state:1})
        .populate('differ_id')
        .populate('product_id')
        .exec(function (err, carts) {
           // console.log(carts)
            // console.log(carts[0].differs[0])
            //     res.render('testCart',{
            //       user:req.session.user,
            //     carts:carts
            //   })
      
            var total= orderTotal(carts)
            console.log(total)
            res.json({
                carts:carts,
                total:total
            })
        })
}



exports.setOnce= function(req,res){
   // console.log(req.params)
    var cid = req.params.cid;
        var num=parseInt(req.params.num)

    Cart.findById(cid,function(err,cart){
        if(err) console.log(err)
        if(num<1000 && num>0){
            cart.num=num
            cart.save(function(err,cart){
                if(err) console.log(err)
                    Cart.findOne({_id:cart._id})
                    .populate({
                    path:'differ_id',
                    select:'differPrice'
                })
                .exec(function(err,_cart){
                res.json(_cart)
                })
            })
        }
    })
  //  Cart.

}

exports.addOnce= function(req,res){
   // console.log(req.params)
    var cid = req.params.cid;
        var num=parseInt(req.params.num)

    Cart.findById(cid,function(err,cart){
        if(err) console.log(err)
        if(cart.num+num<1000){
            cart.num=cart.num+num
            cart.save(function(err,cart){
                if(err) console.log(err)
                    Cart.findOne({_id:cart._id})
                .populate({
                    path:'differ_id',
                    select:'differPrice'
                })
                .exec(function(err,_cart){
                res.json(_cart)
                })
            })
        }else{
            cart.num=999
            cart.save(function(err,cart){
                if(err) console.log(err)
                Cart.findOne({_id:cart._id})
                .populate({
                    path:'differ_id',
                    select:'differPrice'
                })
                .exec(function(err,_cart){
                res.json(_cart)
                })
            })
        }
    })
  //  Cart.

}


exports.minusOnce= function(req,res){
    var cid = req.params.cid;
    var num=parseInt(req.params.num)
    Cart.findById(cid,function(err,cart){
        if(err) console.log(err)
        if(cart.num-num>0){
            cart.num=cart.num-num
            cart.save(function(err,cart){
                if(err) console.log(err)
                Cart.findOne({_id:cart._id})
                .populate({
                    path:'differ_id',
                    select:'differPrice'
                })
                .exec(function(err,_cart){
                res.json(_cart)
                })
            })
        }else{
            cart.num=1
            cart.save(function(err,cart){
                if(err) console.log(err)
                Cart.findOne({_id:cart._id})
                .populate({
                    path:'differ_id',
                    select:'differPrice'
                })
                .exec(function(err,_cart){
                res.json(_cart)
                })
            })
        }
    })
}

exports.delOnce= function(req,res){
    var cid = req.params.cid;
    var state=req.params.state
    Cart.findById(cid,function(err,cart){
        if(err) console.log(err)
        if(cart){
            Cart.findByIdAndUpdate(cart._id,{$set:{state:0}},{new:true},function(err,cart){
                User.findByIdAndUpdate(req.session.user._id,{$inc:{cart:-1}},{new:true},function(err,user){
                    req.session.user = user
                })
                Cart.find({brand_id:cart.brand_id,state:state},function(err,xcart) {
                    Cart.find({state:state},function(err,ycart) {
                    if (xcart.length > 0) {
                            res.json({success: 1,cart1:xcart.length,cart2:ycart.length})
                       
                    }
                    else {
                         if(ycart.length>0){
                            res.json({success: 1,cart1:0,cart2:ycart.length,})
                        }else{
                            res.json({success: 1,cart1:0,cart2:0})
                        }

                    }
                })
                })
            })
        }
    })
}


exports.cartpo= function(req,res) {
    console.log(req.body.sure)
    if (req.body.sure) {
        if (typeof(req.body.sure) === 'string') {
            var s = req.body.sure
            Cart.findOne({_id: s}, function (err, cart) {
                if (err) console.log(err)
                console.log(cart)
                cart.state=2
                cart.save(function (err, cart) {
                    User.findByIdAndUpdate(req.session.user._id,{$inc:{cart:-1}},{new:true},function(err,user){
                        req.session.user = user
                        res.redirect('/cart/buy')
                    })

                })
            })
        }
        if (typeof (req.body.sure) === 'object') {
            var s = req.body.sure
            var ep = new eventproxy()
            ep.after('ca', s.length, function (ca) {
                var slength = s.length

                User.findByIdAndUpdate(req.session.user._id,{$inc:{cart:-s.length}},{new:true},function(err,user){
                    req.session.user = user
                    res.redirect('/cart/buy')
                })

            })
            for (var i = 0; i < s.length; i++) {
                Cart.findById(s[i], function (err, cart) {
                    if (err) console.log(err)
                    cart.state = 2
                    cart.save(function (err, cart) {
                        ep.emit('ca', i)
                    })
                })
            }
        }
    } else {
        res.redirect('/')    }
}

exports.cartbuy = function(req,res) {
    var ep =new eventproxy()
    ep.all('carts','addresses',function(carts,addresses){
     
           var brands =new Array()
            for(var i =0;i<carts.length;i++) {
              //  console.log(carts[i].brand_id._id)
                brands.push(carts[i].brand_id._id+'-'+carts[i].brand_id.brandName)
            }
            var xbrands = dedupe(brands)
      //  console.log(xbrands)
       // console.log(xbrands.length)
      //  console.log(carts)
       var total = orderTotal(carts)
       // console.log(carts)
        res.render('carttoorder',{
            user:req.session.user,
            carts:carts,
            xbrands:xbrands,
            addresses:addresses,
            total:total
        })
    })
    Cart
        .find({user_id: req.session.user._id,state:2})
        .populate('brand_id')
        .populate('differ_id')
        .populate('product_id')
        .exec(function (err, carts) {
            // console.log(carts[0].differs[0])
            //     res.render('testCart',{
            //       user:req.session.user,
            //     carts:carts
            //   })
            ep.emit('carts',carts)
        })
    Address.find({user_id:req.session.user._id},function(err,addresses){
        ep.emit('addresses',addresses)
    })
}

function orderTotal(arr){
    var sum=0
    for (var i=0;i<arr.length;i++){
        sum+=arr[i].differ_id.differPrice*arr[i].num
    }
    return sum
}

function subTotal(price,num){
    return parseFloat(price*num).toFixed(2)
}