var mongoose = require('mongoose')
var Group = mongoose.model('Group')
var Category = mongoose.model('Category')
var Brand = mongoose.model('Brand')
var Product = mongoose.model('Product')
var Differ = mongoose.model('Differ')
var Search = mongoose.model('Search')

var eventproxy = require('eventproxy')


exports.combine=function(req,res){
	Differ.find({},function(err,differs){
		//console.log(differs.length)
		var ep =  new eventproxy()

		ep.after('datas',differs.length,function(datas){
			var ep2=new eventproxy()
			ep2.after('datass',datas.length,function(datass){
							console.log(datass.length)
							res.end('ok')

			})

			for(var j=0;j<datas.length;j++){

				var _search=new Search(datas[j])
				_search.save(function(err,search){
					ep2.emit('datass',j)
				})
			}
		})
	//	var data=new Search()
		for (var i =0;i<differs.length;i++){
			(function(i){
		    var data={}
		    console.log(differs[i].differName)
			data.differ_id=differs[i]._id
			data.differName=differs[i].differName
			data.differPrice=differs[i].differPrice
			data.differSold=differs[i].sold
			data.differState=differs[i].state
			data.picPath=differs[i].picPath
			Product.findOne({_id:differs[i].product_id},function(err,product){
				console.log(i)
				if(product && product !=undefined){

				data.product_id=product._id
				data.productName=product.productName
				data.pv=product.pv
				data.productState=product.state
				data.productSold=product.sold
				console.log(data)
					Brand.findOne({_id:product.brand_id},function(err,brand){
						if(brand && brand !=undefined){
					//	console.log('brand_id:'+brand._id)

						data.brand_id=brand._id
						data.brandName=brand.brandName
						Category.findOne({_id:brand.category_id},function(err,category){
							if(category && category !=undefined){
						//	console.log('category_id:'+category._id)

							data.category_id=category._id
							data.categoryName=category.categoryName
							Group.findOne({_id:category.group_id},function(err,group){
								if(group && group !=undefined){
							//	console.log('group_id:'+group._id)

								data.group_id=group._id
								data.groupName=group.groupName
								//	console.log(data)
									ep.emit('datas',data)

								
							}
							})
						}
						})
					}
					})
				}
				})
})(i)
		}
	})

}

