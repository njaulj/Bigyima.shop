var mongoose = require('mongoose')
var eventproxy = require('eventproxy')
var Order = mongoose.model('Order')
var User= mongoose.model('User')
var Cart=mongoose.model('Cart')
var moment=require('moment')


exports.index=function(req,res){
	var ep = new eventproxy()
	ep.all('orders','carts','user',function(orders,carts,user){
		res.render('myzone',{
			orders:orders,
			carts:carts,
			user:user
		})
	})

	Order
		.find({user_id:req.session.user._id})
		.limit(7)
		.sort({createAt:-1})
			.exec(function(err,orders){
				ep.emit('orders',orders)
			})

	Cart
		.find({user_id:req.session.user._id})
			.populate('product_id','_id productName')
			.populate('differ_id','_id differName differPrice')
			.sort({createAt:-1})
			.limit(7)
			.exec(function(err,carts){
			//	console.log(carts)
				ep.emit('carts',carts)
			})


	User.findById(req.session.user._id,function(err,user){
		ep.emit('user',user)
	})
}

exports.anaorder=function(req,res){
	var id=req.query.id
	var today=Date.now().valueOf()
	console.log(today)

	Order.find({user_id:id,state:{$gt:0}},{'createAt':1,'total':1})
	.sort({createAt:1})
	.exec(function(err,orders){
		if(orders.length>0){
		var ep = new eventproxy()

		ep.after('datas',orders.length,function(datas){
			res.json(datas)
		})

		for(var i=0;i<orders.length;i++){
			var data=[]
			data.push(moment(orders[i].createAt).format('DD/MM/YYYY'))
			data.push((orders[i].total/100).toFixed(2))
			ep.emit('datas',data)
		}
	}else{
		res.json([[moment(Date.now()).format('MM/YYYY'),0]])
	}
			
	})

}