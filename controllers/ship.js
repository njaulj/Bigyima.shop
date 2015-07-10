var mongoose=require('mongoose')
var Ship=mongoose.model('Ship')
var Order=mongoose.model('Order')
var eventproxy=require('eventproxy')
var Detail=mongoose.model('Detail')
var moment =require('moment')
var dedupe = require('dedupe')
var rq=require('request')

function syncOrder(a,callback){
    var id =a 
    Detail.find({order_id:id},function(err,details){
            var _data =new Array()
            for(var i =0;i<details.length;i++) {
              //  console.log(carts[i].brand_id._id)
                _data.push(details[i].state)
            }
            var data = dedupe(_data)

            if(data.length==1){
                Order.findByIdAndUpdate(id,{$set:{state:data[0]}},function(err,order){
                    callback(null,'all')
                })
            }else{
                callback(null,'notall')
            }
        
    })
}

exports.save=function(req,res){
    console.log
	var _ship =req.body.ship
	//console.log(req.query.id)
	var ship = new Ship(_ship)
	ship.order_id=req.query.id
	ship.save(function(err,ship){

		if(typeof(_ship.packages)=='string'){

				Detail.findByIdAndUpdate(_ship.packages,{$set:{shipment:ship._id,state:3}},function(err,detail){
					   syncOrder(req.query.id,function(err,s){
                        res.redirect('/order?id='+ship.order_id+'#tab_4')

                        
                       })
					
				})
		}
		else if(typeof(_ship.packages)=='object'){
				var ep=new eventproxy()
				ep.after('details',_ship.packages.length,function(details){
                       syncOrder(req.query.id,function(err,s){
                        res.redirect('/order?id='+ship.order_id+'#tab_4')

                        
                       })
				})
				for (var i=0;i<_ship.packages.length;i++){
					Detail.findByIdAndUpdate(_ship.packages[i],{$set:{shipment:ship._id,state:3}},function(err,detail){
					
						ep.emit('details',1)
					
				})
				}
		}


	})

}

exports.list=function(req,res){
	var id=req.query.id
	var draw = parseInt(req.body.draw)
  //  console.log(draw)
    var start = parseInt(req.body.start)
    var length=parseInt(req.body.length)
    var ep=new eventproxy()

    ep.all('datasss','sum',function(datas,sum){
      //  console.log(datas)
      //  console.log(sum)
        var res_data={
                        "data":datas,
                        "draw":draw,
                        "recordsTotal":sum,
                        "recordsFiltered":sum
                    }
                    res.json(res_data)
             //    callback(null,res_data)
       })
       Ship.count({order_id:id},function(err,sum){
        ep.emit('sum',sum)
       })


        Ship.find({order_id:id})
            .skip(start)
            .limit(length)
            .sort({createAt:1})
            .exec(function(err,ships){
            	//console.log(orders)
               // console.log(orders.length)
                ep.after('datas',ships.length,function(datas){
                  //  console.log(datas)
                    ep.emit('datasss',datas)
                })
                console.log(ships.length)
                for (var i =0;i<ships.length;i++){
                    var a=ships[i]
                    
                    
                        
                             
                                 ep.after('b',a.packages.length,function(b){
                                         var data=[]
                                         var company
                                            data.push("<input class=\"hidden\" type=\"checkbox\" name=\"id[]\" value=\""+a._id+"\">")
                                            data.push(a.shipNo)
                                     console.log(a.com)
                                                switch(a.com){
                                                                case "sf": {company="顺丰";break;}  
                                                                case "sto":{company= "申通";break;}
                                                                case "yt": {company="圆通";break;}
                                                                case "yd": {company="韵达";break;}
                                                                case "tt": {company="天天";break;}
                                                                case "ems":{company= "EMS";break;}
                                                                case "zto":{company= "中通";break;}
                                                                case "ht": {company="汇通";break;}
                                                                case "qf": {company="全峰";break;}
                                                            }
                                            console.log(company)
                                            data.push(company)
                                            data.push(a.where+'-'+a.who+'-'+a.contact)
                                     data.push(b)
                                 data.push("<a href=\"/ship/query?id="+a._id+"\" class=\"btn btn-xs default btn-editable\"><i class=\"fa fa-th-list\"><\/i> Detail<\/a>")
                                    ep.emit('datas',data)   
                                 })

                                 for (var j=0;j<a.packages.length;j++){
                                     detailref(a.packages[j],function(err,detail){
                                        var str=''
                                           
                                            str="<a href=\"/product/?id="+detail.product_id._id+"\">"+detail.product_id.productName+'[ '+detail.differ_id.differName+' ] x '+detail.num+"</a>"
                                           ep.emit('b',str)
                                        
                                    })
                                 }
                               
                                   

                  

                    
                  //  console.log(str)
                                 

                }

            })
          
}




exports.query=function(req,res){
	var id=req.query.id
	Ship.findById(id,function(err,ship){
		if(ship){
		var url='http://v.juhe.cn/exp/index?key=d5004e357165392644f5ea7f919a6c2f&com='+ship.com+'&no='+ship.shipNo

				req.get(url,function(err,rs,data){
			        var item = JSON.parse(data)
                    console.log(item)
                    if(item.result){
			        res.render('shipline',{
			        	data:item,
			        	ship:ship
			        })
                }else{
                    var vitem={
                        'result':{
                        'company':ship.com,
                        'com':"尚未收录",
                        'no':"尚未收录",
                        'list':[{
                            'datetime':Date.now(),
                            'remark':'快递公司尚未收录'
                        }]}
                    }
                    console.log(vitem)
                    res.render('shipline',{
                        data:vitem,
                        ship:ship
                    })
                }
			})
			}
	})
}


function detailref(a,callback){
    var id=a.toString()
    Detail.findOne({'_id':id})
            .populate({
                 path:'product_id',
                select:'_id productName'
            })
            .populate({
                 path:'differ_id',
                select:'_id differName'
            })
            .exec(function(err,detail){
                callback(null,detail)
            })
}