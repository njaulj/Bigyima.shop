var mongoose = require('mongoose')
var Brand = mongoose.model('Brand')
var eventproxy =require('eventproxy')
var Category = mongoose.model('Category')
var Group = mongoose.model('Group')

exports.new = function(req,res){
    var _brand = {
        category_id :'555c8b317dd17709028513c0',
        brandName:'SNP',
        brandDesp:'韩国面膜第一品牌',
        brandPic:'http://www.snpmask.com/static/img/logo.gif'
    }
    var brand = new Brand(_brand)
    brand.save(function(err, brand) {
        if (err) {
            console.log(err)
        }

        res.send('success')
    })
}

exports.getParent = function(brandid,num,callback){

        Brand.findById(brandid, function (err, brand) {
            if (err) {
                console.log(err)
               // next(err)
            }
            if(num ==1 ) {
              //  console.log(brand)
                callback(err,brand)
              //  next(err, brand)
            }else if(num >1){
                Category.findById(brand.category_id, function (err, category) {
                    if (err) {
                        console.log(err)
                  //      next(err)
                    }
                    if(num ==2){
                    //    console.log(brand,category)
                        callback(err,brand,category)
                   //     next(err,brand,category)
                    }else if(num==3){
                        Group.findById(category.group_id,function(err,group){
                            if (err) {
                                console.log(err)
                      //          next(err)
                            }
                     //       console.log(brand,category,group)
                           callback(err,brand,category,group)
                      //      next(err,brand,category,group)
                        })

                    }
                })
                }
        })

}

exports.tree=function(req,res){
    res.render('tree')
}


exports.node =function(req,res){
var parent= req.query.id
console.log(typeof(parent))

console.log(parent)
    if(parent == '0'){
        Group.find({})
            .exec(function(err,groups){
              //  console.log(groups)
                var ep=new eventproxy()
                ep.after('data',groups.length,function(data){
                    var output={}
                    output.nodes=data
                    res.json(output)

                })

             //   {"id":"1432302884:1","parent":"0","name":"Node - 1 - 1","level":1,"type":"folder"}

                for(var i=0;i<groups.length;i++){
                    var obj={}
                    obj.id='g_'+groups[i]._id
                    obj.parent="0"
                    obj.name=groups[i].groupName
                    obj.level=1
                    obj.type="folder"
                    ep.emit('data',obj)
                }
                //console.log(data)

            })
    }else{
        if(parent.substring(0,2)=='g_'){
            Category.find({group_id:parent.substring(2)})
                .exec(function(err,categories){
                    var ep=new eventproxy()
                    ep.after('data',categories.length,function(data){
                         var output={}
                    output.nodes=data
                    res.json(output)

                    })

                    for(var i=0;i<categories.length;i++){
                        var obj={}
                    obj.id='c_'+categories[i]._id
                    obj.parent=parent
                    obj.name=categories[i].categoryName
                    obj.level=2
                    obj.type="folder"
                        ep.emit('data',obj)
                    }

                })

        }
        else{
            Brand.find({category_id:parent.substring(2)})
                .exec(function(err,brands){
                    var ep=new eventproxy()
                    ep.after('data',brands.length,function(data){
                         var output={}
                    output.nodes=data
                    res.json(output)

                    })

                    for(var i=0;i<brands.length;i++){
                        var obj={}
                        obj.id='c_'+brands[i]._id
                        obj.parent=parent
                        obj.name=brands[i].brandName
                        obj.level=3
                        obj.type="folder"
                        ep.emit('data',obj)
                    }

                })
        }
    }
}

exports.brandPic=function(req,res){
    Brand.find({},{_id:1,brandName:1,brandPic:1},function(err,brands){
        res.render('brandpic',{
            brands:brands
        })
    })
}




exports.ajaxbrand=function(req,res){
    var isajax=parseInt(req.query.isajax)
    console.log(typeof(isajax))
    if(isajax==1){
        var id=req.query.id
        Brand.findOne({_id:id},{_id:1,brandPic:1},function(err,brand){

            res.json(brand)
        })

    }else{
        res.json({success:500})
    }
}

exports.ajaxbrands=function(req,res){
     var isajax=parseInt(req.query.isajax)
    console.log(typeof(isajax))
    if(isajax==1){

        Brand.find({})
            .limit(10)
            .exec(function(err,brands){
                console.log(brands.length)
            res.json(brands)
        })

    }else{
        res.json({success:500})
    }


}

