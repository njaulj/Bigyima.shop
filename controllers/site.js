var mongoose = require('mongoose')
var Product= mongoose.model('Product')
var Search =  mongoose.model('Search')
var eventproxy = require('eventproxy')
var Score = mongoose.model('Score')

exports.index = function(req,res){
    res.render('index',{
        user:req.session.user
    })
}

exports.search=function(req,res){
	 var method = req.method.toLowerCase()
	 var keywords
	 if(method=='get'){
	 	 keywords=req.query.keywords?req.query.keywords:''
	 }else if(method=='post'){
	 	 keywords=req.body.keywords?req.body.keywords:''
	 }
	
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
		        case '3':{str.productSold=dir;break}
		        default:{str._id=dir;break}
		    }

		    var ep = new eventproxy()

		    ep.all('sum','resultss',function(sum,resultss){
		    	// console.log(sum)
				var resultsss=[]
				if(resultss.length<(limit+1)){
					resultsss=resultss
					console.log(resultss.length)
				}else{
					resultsss=resultss.splice((page-1)*limit,limit)
					console.log(resultss.length)
				}
				

		    	res.render('search',{
		    		user:req.session.user,
		    		keywords:keywords,
		    		page:page,
		    		sum:sum,
		    		results:resultsss,
		    		sort:sort,
		    		order:order,
		    		limit:limit
		    	})

		    })

		    Search.count({productName:new RegExp(keywords),differState:{$gt:0}},function(err,sum){
		    	Search.count({brandName:new RegExp(keywords),differState:{$gt:0}},function(err,sum1){
		    		ep.emit('sum',sum+sum1)
		    	})
		    })

//可以分解搜索字符串			split(/\s+/g)

		    Search.find({productName:new RegExp(keywords),differState:{$gt:0}})
		    		.exec(function(err,results){
		    		//	console.log(results)
		    		Search.find({brandName:new RegExp(keywords),differState:{$gt:0}},function(err,result1){
		    				ep.emit('resultss',results.concat(result1))
		    		})
		    		})
}


exports.intro=function(req,res){
	var isajax=req.query.isajax
	var amount=req.query.amount?parseInt(req.query.amount):5


	Search.find({differState:{$gt:0}})
		.limit(amount)
		.sort({pv:-1})
		.exec(function(err,results){
			res.json(results)
		})

}

exports.top=function(req,res){
	var isajax=req.query.isajax
	var amount=req.query.amount?parseInt(req.query.amount):10

	Search.find({differState:{$gt:0}})
		.limit(amount)
		.sort({sold:-1})
		.exec(function(err,results){
			res.json(results)
		})
}


exports.profile = function(req,res){
	var id = req.query.id
	var teacher = req.query.teacher

	var ep = new eventproxy()
	ep.all('score','scores',function(score,scores){
		//console.log(score)
		res.render('profile',{
			score:score,
			scores:scores,
			teacher:teacher
		})
	})

	Score
	.findOne({comNo:id})
	.exec(function(err,score){
		ep.emit('score',score)
	})

	Score.find()
	.sort({score:-1})
	.exec(function(err,scores){
		ep.emit('scores',scores)
	})
	
}

exports.score = function(req,res){

	var id = parseInt(req.query.id)
	var _score = req.body.score
	var teacher = req.query.teacher

	Score
	.findOne({comNo:id})
	.exec(function(err,score){	
		score.scores.push(parseFloat(_score).toFixed(2))
		score.score=parseFloat(eval(score.scores.join('+'))/5).toFixed(2);
		score.save(function(err,s){
			
		res.json({'id':id,teacher:teacher})
		})	
	})
	
}


exports.ranking = function(req,res){
	Score.find()
	.sort({score:-1})
	.exec(function(err,scores){
		res.render('ranking',{
			scores:scores
		})
	})
	
}


exports.paiwei = function(req,res){
	Score.find()
	.sort({name:-1})
	.exec(function(err,scores){
		res.render('paiwei',{
			scores:scores
		})
	})
}


exports.paiweino = function(req,res){
	var id = req.query.id
	var comNo = req.query.comno

	Score.findOne({_id:id},function(err,score){
		score.comNo = comNo
		score.save(function(err,s){
			res.json({success:1})
		})
	})


}
