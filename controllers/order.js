var mongoose = require('mongoose')
var Order = mongoose.model('Order')
var Address = mongoose.model('Address')
var Detail = mongoose.model('Detail')
var Cart = mongoose.model('Cart')
var eventproxy =require('eventproxy')
var User= mongoose.model('User')
var moment=require('moment')


exports.pay=function(req,res){
   // console.log(req.body.sure)
    if(req.body.sure){
        if(typeof(req.body.sure)==='string'){
            var s=req.body.sure
            var aid = req.body.address
            var pay = req.body.payment
           // console.log(pay)
           // console.log(req.body.address)
          //  console.log(req.body.num[s])
            Address.findById(aid,function(err,address){
                var _order = {
                    user_id:req.session.user._id,
                        who:address.who,
                        contact:address.contact,
                        where:address.where,
                    payment:pay
                }
                var order = new Order(_order)
                order.save(function(err,norder){
                    Cart.findOne({_id:s,state:2})
                    .populate({
                        path:'differ_id',
                        select:'_id differPrice'
                    })
                    .exec(function(err,cart){
                        var _detail = {
                            order_id:norder._id,
                            user_id:cart.user_id,
                            brand_id:cart.brand_id,
                            differ_id:cart.differ_id._id,
                            product_id:cart.product_id,
                            detailPrice:cart.differ_id.differPrice,
                            num:cart.num,
                            subtotal:cart.differ_id.differPrice*cart.num
                        }
                        var detail =new Detail(_detail)
                        detail.save(function(err,detail){
                            Cart.findByIdAndUpdate(cart._id,{$set:{state:3}},{new:true},function(err,cart){
                                    
                                                Order.findByIdAndUpdate(detail.order_id,{$set:{total:detail.subtotal}},{new:true},function(err,order){

                                                    User.findByIdAndUpdate(req.session.user._id, {$inc: {order: 1, cost:order.total}},{new:true},function(err,user){
                                                        req.session.user = user

                                                        console.log('good')
                                                        res.end("String")
                                                    })
                                            
                                            })
                                        })
                            })
                        //    subtotal(detail._id)
                        })
                    })
                })
            
        }
        else if(typeof (req.body.sure)==='object'){
            var s=req.body.sure
            var aid = req.body.address
            var pay = req.body.payment
            Address.findById(aid,function(err,address){
                var _order = {
                    user_id:req.session.user._id,
                    who:address.who,
                        contact:address.contact,
                        where:address.where,
                    payment:pay
                }
                var order = new Order(_order)
                order.save(function(err,norder){
                    var ep= new eventproxy()
                    ep.after('s', s.length,function(s){
                       // console.log(norder)
                       // console.log(s)
                       
                        norder.total = orderTotal(s)
                       // console.log(norder.total)
                        norder.save(function(err,ord){
                            User.findByIdAndUpdate(req.session.user._id, {$inc: {order: 1, cost:order.total}},{new:true},function(err,user){
                                req.session.user = user
                                console.log('good')
                                res.end('object')
                            })
                        })
                   //  console.log(s)
                     //  subtotal(s)



                    })

                    for(var i =0;i< s.length;i++){
                        Cart.findOne({_id:s[i],state:2})
                        .populate({
                            path:'differ_id',
                            select:'_id differPrice'

                        })
                        .exec(function(err,cart){
                            var _detail = {
                                order_id:norder._id,
                                user_id:cart.user_id,
                                brand_id:cart.brand_id,
                                differ_id:cart.differ_id._id,
                                product_id:cart.product_id,
                                detailPrice:cart.differ_id.differPrice,
                                num:cart.num,
                                subtotal:cart.differ_id.differPrice*cart.num
                            }
                            var detail =new Detail(_detail)
                            detail.save(function(err,detail){
                                Cart.findByIdAndUpdate(cart._id,{$set:{state:3}},{new:true},function(err,cart) {
                                    
                                                ep.emit('s',detail)
                                        
                                        })
                                })
                            })
                        }
})})}
              
        
    }else {
        res.end('illegal')
    }
}


function orderTotal(arr){
    var sum=0
    for (var i=0;i<arr.length;i++){
        sum+=arr[i].subtotal
    }
    return sum
}


exports.payok = function(req,res){
    var oid = oid
    Order.findById(oid,function(err,order) {
        User.findByIdAndUpdate(req.session.user._id, {$inc: {order: 1, cost:order.total}},{new:true},function(err,user){
            req.session.user = user
            console.log('good')
        })
    })
    }




exports.list=function(req,res){
    res.render('orderlist')
}

exports.show=function(req,res){
    var id=req.query.id
    var ep =new eventproxy()
    
    ep.all('order','details',function(order,details){
        res.render('order',{
            order:order,
            details:details
        })
    })
    Order.findOne({_id:id})
         .exec(function(err,order){
         //   console.log(order)
        ep.emit('order',order)
    })
    
    Detail.find({order_id:id})
            .populate({
                path:'product_id',
                select:'_id productName'
                })
            .populate({
                path:'differ_id'
                })
            .exec(function(err,details){
             //   console.log(details)
                ep.emit('details',details)
            })


}



exports.line=function(req,res){
   // console.log(req)
  //  console.log(req.query.draw)
  //  console.log(req.query.start)
 // console.log(req.body)
   var draw = parseInt(req.body.draw)
  //  console.log(draw)
    var start = parseInt(req.body.start)
    var length=parseInt(req.body.length)

   // console.log(req.body.order)
 //  console.log(req.query.order[0].column)
  //  var _column=parseInt(req.body.order[0].column)
       //  var _column=parseInt(Math.random()*6)
    //   console.log(req.body)
       var _column=parseInt(req.body.order[0].column)
       var _dir =req.body.order[0].dir
     //  console.log(_dir)
       //  var _dir='asc'
         var dir
         var str={}
            if(_dir=='desc'){
                dir=-1
            }else{
                dir=1
            }

    switch(_column){
        case 1:{str._id=dir;break}
        case 2:{str.createAt=dir;break}
        case 3:{str.user_id=dir;break}
        case 4:{str.where=dir;break}
        case 5:{str.total=dir;break}
        case 6:{str.updateAt=dir;break}
        case 7:{str.state=dir;break}
        default:{str._id=dir;break}
    }
   // console.log(typeof(str))
   // console.log(str)
  //  console.log(req.query.order[0].dir)
 //   var _dir=req.body.order[0].dir
//console.log(str)

    if(req.body.customActionType) {
        var customActionType=req.body.customActionType
        var customActionName=req.body.customActionName
    //    console.log(customActionName)
        var ids=req.body.id
        console.log(ids)
        console.log(typeof(ids))
        var state
        switch(customActionName){
            case '0':state=0;break;
            case '1':state=1;break;
            case '2':state=2;break;
            case '3':state=3;break;
            case '4':state=4;break;
            default:state=5;break;
        }
        if(typeof(ids)=='object'){
                var ep =new eventproxy()
                ep.after('orders',ids.length,function(orders){
                    export_list(start,length,str,draw,function(err,data){
                                    res.json(data)
                                })
                })
                for (var i=0;i<ids.length;i++){
                   // var query = {'_id':ids[i]}
                    var options= {$set:{'state':state}}
                    Order.findByIdAndUpdate(ids[i],options,function(err,order){
                        console.log(order)
                         Detail.update({order_id:order._id},{$set:{state:state}},{multi : true},function(err,details){
                          //  console.log(details)
                             ep.emit('orders',1)  
                        })
                          })
                }


        }
    }else{
       
           export_list(start,length,str,draw,function(err,data){
                                    res.json(data)
                                })

    }

}


function export_list(a,b,c,d,callback){
    var start = a
    var length =b
    var str =c
    var draw = d
    var ep =new eventproxy()

// console.log(str)
       ep.all('datasss','sum',function(datas,sum){
      //  console.log(datas)
      //  console.log(sum)
        var res_data={
                        "data":datas,
                        "draw":draw,
                        "recordsTotal":sum,
                        "recordsFiltered":sum
                    }
                 //   res.json(res_data)
                 callback(null,res_data)
       })
       Order.count(function(err,sum){
        ep.emit('sum',sum)
       })


        Order.find({})
            .populate({
                path:'user_id',
                select:'userName'
                })
            .skip(start)
            .limit(length)
            .sort(str)
            .exec(function(err,orders){
          //      console.log(orders.length)
                ep.after('datas',orders.length,function(datas){
                  //  console.log(datas)
                    ep.emit('datasss',datas)
                })

 var statArr=[{'color':'danger','info':'Deleted'},{'color':'warning','info':'Paying...'}
                    ,{'color':'info','info':'Processing...'},{'color':'info','info':'Delivering...'}
                    ,{'color':'success','info':'Finished'}]
                for (var i =0;i<orders.length;i++){
                    var data=[]
                    data.push("<input type=\"checkbox\" name=\"id[]\" value=\""+orders[i]._id+"\">")
                    data.push("<a href=\"/order?id="+orders[i]._id+"\">"+orders[i]._id+"</a>")
                    data.push(moment(orders[i].createAt).format('MM/DD/YYYY'))
                    data.push(orders[i].user_id.userName)
                    data.push(orders[i].where)
                    data.push((orders[i].total/100).toFixed(2))
                    data.push(moment(orders[i].updateAt).format('MM/DD/YYYY'))
                   
                        data.push("<span class=\"label label-sm label-"+statArr[orders[i].state].color+"\">"+statArr[orders[i].state].info+"<\/span>")
                
                data.push("<a href=\"/order?id="+orders[i]._id+"\" class=\"btn btn-xs default btn-editable\"><i class=\"fa fa-search\"><\/i> Details<\/a>")
             //   console.log(data)
                ep.emit('datas',data)                

                }

            })

}