var mongoose = require('mongoose')
var Brand = mongoose.model('Brand')
var eventproxy =require('eventproxy')
var Category = mongoose.model('Category')
var Group = mongoose.model('Group')



exports.tree=function(req,res){
    res.render('tree')
}


exports.node =function(req,res){
var parent= req.query.id
console.log(typeof(parent))

console.log(parent)
    if(parent == '0'){
        Group.find({'state':1})
            .exec(function(err,groups){
              //  console.log(groups)
                var ep=new eventproxy()
                ep.after('data',groups.length,function(data){
                	if(data.length!=0){
                		 var output={}
	                    output.nodes=data
	                    res.json(output)
                	}else{
                		var group=new Group()
                		group.groupName='第一个分组'
                		group.save(function(err,group){
                			var obj={}
		                    obj.id='g_'+group._id
		                    obj.parent="0"
		                    obj.name=group.groupName
		                    obj.level=1
		                    obj.type="folder"

		                    var data=[]
		                    data.push(obj)
		                    var output={}
		                    output.nodes=data
		                    res.json(output)
                		})
                	}
                   

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
            Category.find({group_id:parent.substring(2),state:1})
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
            Brand.find({category_id:parent.substring(2),state:1})
                .exec(function(err,brands){
                    var ep=new eventproxy()
                    ep.after('data',brands.length,function(data){
                         var output={}
                    output.nodes=data
                    res.json(output)

                    })

                    for(var i=0;i<brands.length;i++){
                        var obj={}
                        obj.id='b_'+brands[i]._id
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


exports.update=function(req,res){
	var id=req.query.id
	if(id.substring(0,2)=='g_'){
		var name = req.body.name
		var parent=req.body.parent
		var query={'_id':id.substring(2)}

Group.findOne(query,function(err,group){
	group.groupName=name
	group.save(function(err,group){
		var obj={}
                    obj.id='g_'+group._id
                    obj.name=group.groupName
                    obj.level=1
                    obj.type="folder"
                    res.json(obj)
	})
})

	}else{
		if(id.substring(0,2)=='c_'){
			var name = req.body.name
		var parent=req.body.parent
		var query={'_id':id.substring(2)}

		Category.findOne(query,function(err,category){
				category.categoryName=name
				category.save(function(err,category){
					var obj={}
			                    obj.id='g_'+category._id
			                    obj.name=category.categoryName
			                    obj.level=1
			                    obj.type="folder"
			                    res.json(obj)
				})
			})

		}
		else{
			var name = req.body.name
		var parent=req.body.parent
		var query={'_id':id.substring(2)}

		Brand.findOne(query,function(err,brand){
				brand.brandName=name
				brand.save(function(err,brand){
					var obj={}
			                    obj.id='g_'+brand._id
			                    obj.name=brand.brandName
			                    obj.level=1
			                    obj.type="folder"
			                    res.json(obj)
				})
			})
		}
	}

	

}

exports.create=function(req,res){
	var parent=req.body.parent
		console.log(typeof(parent))

	console.log(parent)
	if(parent == '0'){
		console.log(parent)
		var name=req.body.name
		var group =  new Group()
		group.groupName=name
		group.save(function(err,group){
						var obj={}
						obj.id='g_'+group._id
                        obj.parent="0"
                        obj.name=group.groupName
                        obj.level=1
                        obj.type="folder"
                        res.json(obj)
		})
	}
	else{
		if(parent.substring(0,2)=='g_'){
			var name=req.body.name
			var category=new Category()
			category.group_id=parent.substring(2)
			category.categoryName=name
			category.save(function(err,category){
						var obj={}
						obj.id='c_'+category._id
                        obj.parent="0"
                        obj.name=category.categoryName
                        obj.level=2
                        obj.type="folder"
                        res.json(obj)
			})


		}else{
			var name=req.body.name
			var brand=new Brand()
			brand.category_id=parent.substring(2)
			brand.brandName=name
			brand.save(function(err,brand){
						var obj={}
						obj.id='b_'+brand._id
                        obj.parent="0"
                        obj.name=brand.brandName
                        obj.level=3
                        obj.type="folder"
                        res.json(obj)
			})



		}

	}
}

exports.delete=function(req,res){
	var id=req.query.id
	if(id.substring(0,2)=='g_'){
		var name = req.body.name
		var parent=req.body.parent
		var query={'_id':id.substring(2)}

		Group.findOne(query,function(err,group){
			group.state=0
			group.save(function(err,group){
				var obj={}
		                    obj.id='g_'+group._id
		                    obj.name=group.groupName
		                    obj.level=1
		                    obj.type="folder"
		                    res.json(obj)
			})
		})

	}else{
		if(id.substring(0,2)=='c_'){
			var name = req.body.name
		var parent=req.body.parent
		var query={'_id':id.substring(2)}

		Category.findOne(query,function(err,category){
				category.state=0
				category.save(function(err,category){
					var obj={}
			                    obj.id='g_'+category._id
			                    obj.name=category.categoryName
			                    obj.level=1
			                    obj.type="folder"
			                    res.json(obj)
				})
			})

		}
		else{
			var name = req.body.name
		var parent=req.body.parent
		var query={'_id':id.substring(2)}

		Brand.findOne(query,function(err,brand){
				brand.state=0
				brand.save(function(err,brand){
					var obj={}
			                    obj.id='g_'+brand._id
			                    obj.name=brand.brandName
			                    obj.level=1
			                    obj.type="folder"
			                    res.json(obj)
				})
			})
		}
	}

}