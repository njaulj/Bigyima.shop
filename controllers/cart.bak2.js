var mongoose = require('mongoose')
var Cart = mongoose.model('Cart')
var User = mongoose.model('User')
var _= require('underscore')
var eventproxy = require('eventproxy')
var ainb = require('../libs/ainb')


exports.addCart = function(req,res){
    // console.log(_cart)
    //  console.log(req.session.user)

    var bid = req.params.bid
    Cart.findOne({user_id:req.session.user._id,brand_id:bid},function(err,cart){
        if(err)console.log(err)
        else{
            if(cart){
                var ep =new eventproxy()
                ep.after('differs',cart.differs.length,function(differs){
                    var did = req.params.did
                    var k = ainb.aatb(did,differs)
                    if(k>0){
                        cart.differs[k-1].num = parseInt(req.params.num,10)
                        cart.save(function(err,cart){
                            if (err)console.log(err)
                        //    console.log('表示购物车已存在该商品,并且更新数量')
                            res.json({success:2}) //表示购物车已存在该商品
                        })
                    }else{
                        var _differ={
                            differ_id:req.params.did,
                            product_id:req.params.pid,
                            num:req.params.num,
                            pic_id:req.params.picid
                        }
                        cart.differs.push(_differ)
                        cart.save(function(err,cart){
                            if(err) console.log(err)
                          //  console.log('添加成功')
                            User.findByIdAndUpdate({_id:req.session.user._id},{$inc:{cart:1}},{new: true},function(err,user){
                           //     console.log('+1')
                           //     console.log(user.cart)
                                req.session.user=user
                                res.json({success:1})
                            })
                        })
                    }
                })

                for (var i=0;i<cart.differs.length;i++){
                    ep.emit('differs',cart.differs[i].differ_id.toString())
                }


            }
            else{
                var _cart = {
                    user_id:req.session.user._id,
                    brand_id:bid
                }
                var xcart =new Cart(_cart)
                xcart.save(function(err,xcart){
                    var _differ =  {
                        product_id:req.params.pid,
                        differ_id:req.params.did,
                        num:parseInt(req.params.num,10),
                        pic_id:req.params.picid
                    }
                    console.log(_differ)
                    xcart.differs.push(_differ)
                    xcart.save(function(err,xcart){
                        if(err)console.log(err)
                        console.log('第一次创建购物车')
                        User.findByIdAndUpdate({_id:req.session.user._id},{$inc:{cart:1}},{new: true},function(err,user){
                          //  console.log('+1')
                         //   console.log(user.cart)
                            req.session.user=user
                            res.json({success:1})

                        })
                    })
                })
            }
        }
    })

}


exports.cart = function(req,res){
    Cart
        .find({user_id:req.session.user._id})
        .populate('brand_id')
        .populate('differs.differ_id')
        .populate('differs.product_id')
        .populate('differs.pic_id')
        .exec(function(err,carts){
           // console.log(carts[0].differs[0])
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
   // console.log(req.params)
    var cid = req.params.cid;
    Cart.findById(cid,function(err,cart){
        if(err) console.log(err)
        if(cart){
          //  console.log(cart)
            var ep =new eventproxy()
            ep.after('differs',cart.differs.length,function(differs){
                var did = req.params.did
                var k = ainb.aatb(did,differs)
                if(k>0){
                    var num = cart.differs[k-1].num+1
                    if(num<1000){
                    cart.differs[k-1].num = parseInt(num,10)
                    cart.save(function(err,cart){
                        if (err)console.log(err)
                        console.log('成功加1')
                        res.json({success:1}) //表示购物车已存在该商品
                    })
                    }else{
                        res.json({success:9})//商品数量最大了
                    }

                }else{

                        res.json({success:2})//查无此商品

                }
            })
            for (var i=0;i<cart.differs.length;i++){
                ep.emit('differs',cart.differs[i].differ_id.toString())
            }

        }
    })

}


exports.minusOnce= function(req,res){
    var cid = req.params.cid;
    Cart.findById(cid,function(err,cart){
        if(err) console.log(err)
        if(cart){
            //  console.log(cart)
            var ep =new eventproxy()
            ep.after('differs',cart.differs.length,function(differs){
                var did = req.params.did
                var k = ainb.aatb(did,differs)
                if(k>0){
                    var num = cart.differs[k-1].num-1
                    if(num>0) {
                        cart.differs[k - 1].num = parseInt(num, 10)
                        cart.save(function (err, cart) {
                            if (err)console.log(err)
                           // console.log('表示购物车已存在该商品,并且更新数量')
                            res.json({success: 1}) //表示购物车已存在该商品
                        })
                    }else{
                        res.json({success:9})//商品数量最小了
                    }

                }else{

                    res.json({success:2})//查无此商品

                }
            })
            for (var i=0;i<cart.differs.length;i++){
                ep.emit('differs',cart.differs[i].differ_id.toString())
            }

        }
    })
}

exports.delOnce= function(req,res){
    var cid = req.params.cid;
    Cart.findById(cid,function(err,cart){
        if(err) console.log(err)
        if(cart){
            //  console.log(cart)
            var ep =new eventproxy()
            ep.after('differs',cart.differs.length,function(differs){
                var did = req.params.did
                var k = ainb.aatb(did,differs)
                if(k>0){
                        cart.differs.splice(k-1,1)
                        if(cart.differs.length>0){
                        cart.save(function (err, cart) {
                            if (err)console.log(err)
                            // console.log('表示购物车已存在该商品,并且更新数量')
                            User.findByIdAndUpdate({_id:req.session.user._id},{$inc:{cart:-1}},{new: true},function(err,user){
                               // console.log('-1')
                               // console.log(user.cart)
                                req.session.user=user
                                res.json({success:1})

                            })
                      //      res.json({success: 1}) //表示购物车已存在该商品
                        })}
                    else{
                       //     var query = {"_id": cart._id};
                        //    cart = _.extend(cart,Cart)
                         //   cart.findByIdAndRemove(query,function(err,cart){
                          //      console.log('success delete')
                           // })
                            cart.remove({_id:cart._id},function(err,cart){
                                if(err)console.log(err)
                                User.findByIdAndUpdate({_id:req.session.user._id},{$inc:{cart:-1}},{new: true},function(err,user){
                                  //  console.log('-1')
                                 //   console.log(user.cart)
                                    req.session.user=user
                                    res.json({success:9})
                                })
                           //     res.json({success:9})//全删了
                            })

                        }
                }else{
                    res.json({success:2})//查无此商品

                }
            })
            for (var i=0;i<cart.differs.length;i++){
                ep.emit('differs',cart.differs[i].differ_id.toString())
            }

        }
    })
}