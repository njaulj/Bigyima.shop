var mongoose = require('mongoose')
var Product = mongoose.model('Product')
var Brand = mongoose.model('Brand')
var Differ = mongoose.model('Differ')
var Comment = mongoose.model('Comment')
var Cart = mongoose.model('Cart')
var Pic = mongoose.model('Pic')
var fs = require('fs')
var _ = require('underscore')
var eventproxy = require('eventproxy')
var Category = mongoose.model('Category')
var Group = mongoose.model('Group')
var moment = require('moment')
var Search = mongoose.model('Search')


exports.showProduct = function(req,res){
 
    var product_id = req.query.id
    var did=req.query.did
   // console.log(did)


   // console.log(req.session.user)
    var ep =new eventproxy()
    ep.all('product','differs',function(product,differs){
        var data=[]
        for(var i=0;i<differs.length;i++){
            data.push(differs[i]._id)
        }
                console.log(data)

        if(did && did !=undefined){
                    console.log(data)

            if(inarray(did,data)==1){
                did=product.differShow._id
            }else{
                did=did

            }
        }else{
             did=product.differShow._id

        }
        var ep2=new eventproxy()
        ep2.all('differShow','similaries',function(differShow,similaries){

            res.render('shopitem',{
            user:req.session.user,
            product:product,
            differs:differs,
            differShow:differShow,
            similaries:similaries
        })
        })


        Differ.findById(did,function(err,differShow){
            ep2.emit('differShow',differShow)

        })

        Search.find({brand_id:product.brand_id,differState:{$gt:0}})
            .limit(8)
            .sort({sold:-1})
            .exec(function(err,similaries){
                ep2.emit('similaries',similaries)
            })
        
    })
/*
    Product.findById(product_id,function(err,product){
        ep.emit('product',product)
    })
*/

    Product.update({_id:product_id},{$inc:{pv:1}},function(err){
        if(err)
            console.log(err)
    })
    Product
        .findOne({_id:product_id})
        .populate({
            path:'brand_id',
            select:'_id brandName brandPic brandDesp'
        })
        .populate('differShow')
        .exec(function(err,product){
            if (err) {
                console.log(err)
            }
        //    console.log(product)
            ep.emit('product',product)
        })


        
            Differ
                .find({product_id:product_id,state:1})
                .exec(function(err,differs){
                    ep.emit('differs',differs)
                })
         

}

exports.showupload = function(req,res) {
    Brand.fetch(function(err,brands){
        console.log(brands)
        res.render('test',{
            brands:brands
        })
    })

}

exports.upload= function(req,res){
    console.log(req.body)

    var _product = req.body.product;
    var differs = req.body.differs;

    console.log(req.files.pics)
    console.log(req.files.pics.length)

    var ep = new eventproxy()
    var product = new Product(_product)
    product.save(function(err, product) {
        if (err) {
            console.log(err)
        }

        ep.all('differ','pic',function(differ,pic){
            product.save(function(err,product){
                res.send('success')
            })

        })
        ep.after('differs',differs.length,function(differ){

            ep.emit('differ',differs)

        })
        for (var i = 0; i < differs.length; i++) {
            differs[i].product_id = product._id
            var _differ = differs[i]
            var differ = new Differ(_differ)
            differ.save(function(err,differ){
                ep.emit('differs', differ);
            })
        }

        ep.after('pics',req.files.pics.length,function(pics){

            ep.emit('pic',pics)
            console.log(product.productPic)

        })
        for (var i = 0; i < req.files.pics.length; i++) {
            var _pic = {
                product_id:product._id,
                picName:req.files.pics[i].name,
                picPath:req.files.pics[i].path
            }
            var pic = new Pic(_pic)
            pic.save(function(err,pic){
                product.productPic.push(pic._id)
                ep.emit('pics', pic);
            })
        }


    })

}

exports.edit = function(req,res){
    var ep = new eventproxy()
    ep.all('groups','categories','brands',function(groups,categories,brands){

        res.render('edit',{
            groups:groups,
            categories:categories,
            brands:brands
        })
    })

    Group.find({},function(err,groups){
        ep.emit('groups',groups)
    })
    Category.find({},function(err,categories){
        ep.emit('categories',categories)
    })
    Brand.find({},function(err,brands){
        ep.emit('brands',brands)
    })
}


exports.update=function(req,res){
   var _product= req.body.product
    var _differs = req.body.differ
    console.log(req.body)
    console.log(_product)
 //   console.log(differs)

    
    var product = new Product(_product)
    product.save(function(err, product) {
        if (err) {
            console.log(err)
        }
        if(typeof(_differs.did)=='object'){
            var ep = new eventproxy()
        ep.after('differs',_differs.differName.length,function(differs){

            res.redirect('/admin/product/list')

        })
     //   console.log(_differs.differName.length)

        for (var i = 0; i < _differs.differName.length; i++) {
           // var query = {_id:_differs.did[i]}
            var options = {$set:{
                product_id:product._id,
                differName:_differs.differName[i],
                marketPrice:parseInt(_differs.marketPrice[i]*100),
                differPrice:parseInt(_differs.differPrice[i]*100),
                amount:_differs.amount[i]
            }}

            Differ.findByIdAndUpdate(_differs.did[i],options,{new:true},function(err,differ) {
                    ep.emit('differs',differ)
            })

        }
    }else if(typeof(_differs.did)=='string'){
       // var query = {_id:_differs.did}
            var options = {$set:{
                product_id:product._id,
                differName:_differs.differName,
                marketPrice:parseInt(_differs.marketPrice*100),
                differPrice:parseInt(_differs.differPrice*100),
                amount:_differs.amount
            }}

            Differ.findByIdAndUpdate(_differs.did,options,{new:true},function(err,differ) {
                    res.redirect('/admin/product/list')
            })
    }

    })
}


exports.list=function(req,res){
res.render('productlist')
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
     //  console.log(req.body)
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
        case 2:{str.productName=dir;break}
        case 3:{str.brand_id=dir;break}
        case 4:{str.pv=dir;break}
        case 5:{str.sold=dir;break}
        case 6:{str.createAt=dir;break}
        default:{str._id=dir;break}
    }
   // console.log(typeof(str))
  //  console.log(str)
  //  console.log(req.query.order[0].dir)
 //   var _dir=req.body.order[0].dir
//console.log(str)

    if(req.body.customActionType) {
        var customActionType=req.body.customActionType
        var customActionName=req.body.customActionName
        var ids=req.body.id

        console.log(ids)
        console.log(typeof(ids))
        var state
        switch(customActionName){
            case '0':state=0;break;
            case '1':state=1;break;
            case '2':state=2;break;
            default:state=3;break;
        }
        if(typeof(ids)=='object'){
                var ep =new eventproxy()
                ep.after('products',ids.length,function(products){
                    export_list(start,length,str,draw,function(err,data){
                                    res.json(data)
                                })
                })
                for (var i=0;i<ids.length;i++){
                  //  var query = {'_id':ids[i]}
                    var options= {$set:{'state':state}}
                    Product.findByIdAndUpdate(ids[i],options,function(err,product){
                        Differ.update({product_id:product._id},{$set:{state:state}},{multi:true},function(err,differs){

                             ep.emit('products',1) 
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
    console.log(str)

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
       Product.count(function(err,sum){
        ep.emit('sum',sum)
       })


        Product.find({})
            .populate({
                path:'brand_id',
                select:'brandName'
                })
            .skip(start)
            .limit(length)
            .sort(str)
            .exec(function(err,products){
                console.log(products.length)
                ep.after('datas',products.length,function(datas){
                  //  console.log(datas)
                    ep.emit('datasss',datas)
                })
var statArr=[{'color':'danger','info':'Deleted'},{'color':'success','info':'Publish...'}
                    ,{'color':'info','info':'Not Published...'},{'color':'warning','info':'Erroring...'}
                    ]
                for (var i =0;i<products.length;i++){
                    var data=[]
                    data.push("<input type=\"checkbox\" name=\"id[]\" value=\""+products[i]._id+"\">")
                    data.push(products[i]._id)
                    data.push("<a href=\"/product?id="+products[i]._id+"\">"+products[i].productName+"</a>")
                    data.push(products[i].brand_id.brandName)
                    data.push(products[i].pv)
                    data.push(products[i].sold)
                    data.push(moment(products[i].createAt).format('MM/DD/YYYY'))
                     
                    data.push("<span class=\"label label-sm label-"+statArr[products[i].state].color+"\">"+statArr[products[i].state].info+"<\/span>")
                
                data.push("<a href=\"/admin/product/modify?id="+products[i]._id+"\" class=\"btn btn-xs default btn-editable\"><i class=\"fa fa-pencil\"><\/i> Edit<\/a>")
             //   console.log(data)
                ep.emit('datas',data)                

                }

            })

}

exports.pack=function(req,res){
    console.log('sadf')
}




exports.modify=function(req,res){
    var id=req.query.id

    var ep=new eventproxy()

    ep.all('product','differs',function(product,differs){
        console.log(differs)
            res.render('modify',{
                product:product,
                differs:differs
            })
    })

    Product.findOne({'_id':id})
            .populate({ path:'brand_id',
            select:'_id brandName'
            })
            .exec(function(err,product){
            ep.emit('product',product)
            })

    Differ.find({'product_id':id,state:1})
            .exec(function(err,differs){
        ep.emit('differs',differs)
    })

}


exports.commit=function(req,res){
    var id=req.query.id
    var _product=req.body.product
    var _differs = req.body.differ
    console.log(_differs)
    console.log(req.body.product)
   // console.log(typeof(_product))
    Product.findOne({'_id':id},function(err,product){
      
            product.productName=_product.productName
   
            product.brand_id=_product.brand_id
        
            product.availableFrom=_product.availableFrom
            product.availableTo=_product.availableTo

            product.state=_product.state
   
            product.keywords=_product.keywords
    
            product.shortDesp=_product.shortDesp
      
            product.productDesp=_product.productDesp
            product.productMeta=_product.productMeta
     
            product.differShow=_product.differShow
            product.save(function(err,product){
            

            if(typeof(_differs.did)=='object'){
                var ep=new eventproxy()
            ep.after('differs',_differs.differName.length,function(differs){

            res.redirect('/admin/product/list')

        })
     //   console.log(_differs.differName.length)
        for (var i = 0; i < _differs.differName.length; i++) {
         //   var query = {_id:_differs.did[i]}
            var options = {$set:{
                product_id:product._id,
                differName:_differs.differName[i],
                marketPrice:parseInt(_differs.marketPrice[i]*100),
                differPrice:parseInt(_differs.differPrice[i]*100),
                amount:_differs.amount[i]
            }}

            Differ.findByIdAndUpdate(_differs.did[i],options,{new:true},function(err,differ) {
                    ep.emit('differs',differ)
            })

        }
    }else if(typeof(_differs.did)=='string'){
          //  var query = {_id:_differs.did}
            var options = {$set:{
                product_id:product._id,
                differName:_differs.differName,
                marketPrice:parseInt(_differs.marketPrice*100),
                differPrice:parseInt(_differs.differPrice*100),
                amount:_differs.amount
            }}

            Differ.findByIdAndUpdate(_differs.did,options,{new:true},function(err,differ) {
                    res.redirect('/admin/product/list')
            })

    }
        })
    })
}



exports.ajaxnewp=function(req,res){
    var limit = req.query.limit?parseInt(req.query.limit):4
    var num=req.query.num?parseInt(req.query.num):0
    var page=req.query.page?parseInt(req.query.page):1

    Product.find({state:1})
    .populate({
        path:'differShow',
        select:'_id differPrice picPath brand_id'
    })
    .skip(num*page)
    .limit(4)
    .sort({createAt:-1})
    .exec(function(err,products){
        console.log(products)
        res.json(products)
    })

}

exports.ajaxsp=function(req,res){
    var pid=req.query.pid
    var did=req.query.did

    var ep = new eventproxy()

    ep.all('product','differs',function(product,differs){
        var data=[]
        for(var i=0;i<differs.length;i++){
            data.push(differs[i]._id)
        }
                console.log(data)

        if(did && did !=undefined){
                    console.log(data)

            if(inarray(did,data)==1){
                did=product.differShow._id
            }else{
                did=did

            }
        }else{
             did=product.differShow._id

        }

        Differ.findById(did,function(err,differShow){

       res.json({product:product,differShow:differShow,differs:differs})
        })

    })
     Product.update({_id:pid},{$inc:{pv:1}},function(err){
        if(err)
            console.log(err)
    })

    Product.findById(pid,function(err,product){
        ep.emit('product',product)
    })

    Differ.find({product_id:pid,state:1},function(err,differs){
        ep.emit('differs',differs)
    })

}

exports.brandtoproduct=function(req,res){
    var id=req.query.id
    var ep=new eventproxy()


    var page= req.query.page?parseInt(req.query.page):1
    var limit=req.query.limit?parseInt(req.query.limit):9
    var order=req.query.order?req.query.order:'1'
    var sort=req.query.sort?req.query.sort:'desc'

         var dir
         var str={}
            if(order=='desc'){
                dir=-1
            }else{
                dir=1
            }

            switch(sort){
                case '1':{str._id=dir;break}
                case '2':{str.pv=dir;break}
                case '3':{str.sold=dir;break}
                default:{str._id=dir;break}
            }



    ep.all('sum','results','brand',function(sum,results,brand){
        res.render('brandtoproduct',{
            user:req.session.user,
            brand:brand,
            page:page,
            limit:limit,
            order:order,
            sort:sort,
            results:results,
            sum:sum
        })

    })

    Brand.findOne({_id:id},function(err,brand){
        ep.emit('brand',brand)
    })

    Product.count({brand_id:id,state:{$gt:0}},function(err,sum){
        ep.emit('sum',sum)
    })

    Product.find({brand_id:id,state:{$gt:0}})
        .populate({
            path:'differShow'
        })
        .skip((page-1)*limit)
        .sort(str)
        .exec(function(err,results){
            //  console.log(results)
            ep.emit('results',results)
        })

}


function inarray(a,b){
          for (i in b){
            if(b[i]==a){
              return 2
            }
          }
          return 1
        }