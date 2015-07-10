var mongoose = require('mongoose')
var Group = mongoose.model('Group')
var Category = mongoose.model('Category')
var Brand=mongoose.model('Brand')
var Differ =mongoose.model('Differ')
var eventproxy=require('eventproxy')

exports.new = function(req,res){
    var _group = {
        groupName:'生活超市',
        groupDesp:'让生活从此无忧'
    }
    var group = new Group(_group)
    group.save(function(err, group) {
        if (err) {
            console.log(err)
        }

        res.end('success')
    })
}


exports.getChild=function(gid){
    Category.find({'group_id':gid},function(err,categories){
        if(err){
            console.log(err)
        }
        console.log(categories)
    })
}

exports.manage=function(req,res){
    var page = req.query.page?parseInt(req.query.page):1
    console.log(page)
    //res.send(page)
    Differ
        .find({})
        .skip((page-1)*10)
        .limit(10)
        .exec(function(err,groups){
            res.render('group',{
                groups:groups
            })
        })
}

exports.showtree=function(req,res){
    var parent= req.query.parent
    if(parent=='#'){
        Group.find({state:1})
            .exec(function(err,groups){
              //  console.log(groups)
                var ep=new eventproxy()
                ep.after('data',groups.length,function(data){
                   res.json(data)

                })

                for(var i=0;i<groups.length;i++){
                    var obj={}
                    obj.id='g_'+groups[i]._id
                    obj.icon="fa fa-folder icon-lg icon-state-info"
                    obj.text=groups[i].groupName
                    obj.children=true
                    obj.type="root"
                    ep.emit('data',obj)
                }
                //console.log(data)

            })
    }else{
        if(parent.substring(0,2)=='g_'){
            Category.find({group_id:parent.substring(2),state:1})
                .exec(function(err,categories){
                    var ep=new eventproxy()
                    ep.after('data',categories.length,function(data){
                        console.log(data)
                        res.json(data)

                    })

                    for(var i=0;i<categories.length;i++){
                        var obj={}
                        obj.id='c_'+categories[i]._id
                        obj.icon="fa fa-file icon-lg icon-state-success"
                        obj.text=categories[i].categoryName
                        obj.children=true
                        ep.emit('data',obj)
                    }

                })

        }
        else{
            Brand.find({category_id:parent.substring(2),state:1})
                .exec(function(err,brands){
                    var ep=new eventproxy()
                    ep.after('data',brands.length,function(data){
                        console.log(data)
                        res.json(data)

                    })

                    for(var i=0;i<brands.length;i++){
                        var obj={}
                        obj.id='b_'+brands[i]._id
                        obj.icon="fa fa-file icon-lg icon-state-warning"
                        obj.text=brands[i].brandName
                        obj.children=false
                        obj.state=false
                        ep.emit('data',obj)
                    }

                })
        }
    }


   // console.log(req.query.parent)

//    [{"id":"node_143220814680470","icon":"fa fa-file icon-lg icon-state-info","text":"Node 1432208146","children":false},{"id":"node_143220814667607","icon":"fa fa-folder icon-lg icon-state-info","text":"Node 1432208146","children":true}]

}