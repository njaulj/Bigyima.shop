var mongoose = require('mongoose')
var Detail =mongoose.model('Detail')
var eventproxy=require('eventproxy')
var moment = require('moment')


exports.list=function(req,res){
    res.render('detaillist')
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
        case 2:{str.order_id=dir;break}
        case 3:{str.product_id=dir;break}
        case 4:{str.brand_id=dir;break}
      	case 5:{str.user_id=dir;break}
        case 6:{str.detailPrice=dir;break}
        case 7:{str.num=dir;break}
        case 8:{str.subtotal=dir;break}
        case 9:{str.createAt=dir;break}
        case 10:{str.updateAt=dir;break}
        case 11:{str.state=dir;break}
        default:{str._id=dir;break}
    }
    console.log(str)
   // console.log(typeof(str))
   // console.log(str)
  //  console.log(req.query.order[0].dir)
 //   var _dir=req.body.order[0].dir
//console.log(str)

    if(req.body.customActionType) {
        var customActionType=req.body.customActionType
        var customActionName=req.body.customActionName
      //  console.log(customActionName)
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
                ep.after('details',ids.length,function(details){
                    export_list(start,length,str,draw,function(err,data){
                                    res.json(data)
                                })
                })
                for (var i=0;i<ids.length;i++){
                    var options= {$set:{'state':state}}
                    Detail.findByIdAndUpdate(ids[i],options,function(err,detail){
                                ep.emit('details',1)    
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
       Detail.count(function(err,sum){
        ep.emit('sum',sum)
       })


        Detail.find({})
            .populate({
                path:'user_id',
                select:'userName'
                })
            .populate({
            	 path:'product_id',
                select:'_id productName'
            })
            .populate({
            	 path:'differ_id',
                select:'_id differName'
            })
            .populate({
            	 path:'brand_id',
                select:'_id brandName'
            })
            .skip(start)
            .limit(length)
            .sort(str)
            .exec(function(err,details){
                console.log(details.length)
                ep.after('datas',details.length,function(datas){
                  //  console.log(datas)
                    ep.emit('datasss',datas)
                })

var statArr=[{'color':'danger','info':'Deleted'},{'color':'warning','info':'Paying...'}
                    ,{'color':'info','info':'Processing...'},{'color':'info','info':'Delivering...'}
                    ,{'color':'success','info':'Finished'}]
                for (var i =0;i<details.length;i++){
                    var data=[]
                    data.push("<input type=\"checkbox\" name=\"id[]\" value=\""+details[i]._id+"\">")
                    data.push("<a href=\"/detail?id="+details[i]._id+"\">"+details[i]._id+"</a>")
                    data.push("<a href=\"/order?id="+details[i].order_id+"\">"+details[i].order_id+"</a>")
                    data.push("<a href=\"/product?id="+details[i].product_id._id+"\">"+details[i].product_id.productName+"["+details[i].differ_id.differName+"]"+"</a>")
                    data.push("<a href=\"/brand?id="+details[i].brand_id._id+"\">"+details[i].brand_id.brandName+"</a>")
                    data.push(details[i].user_id.userName)
                    data.push((details[i].detailPrice/100).toFixed(2))
                    data.push(details[i].num)
                    data.push((details[i].subtotal/100).toFixed(2))
                    data.push(moment(details[i].createAt).format('MM/DD/YYYY'))
                    data.push(moment(details[i].updateAt).format('MM/DD/YYYY'))
                    
                        data.push("<span class=\"label label-sm label-"+statArr[details[i].state].color+"\">"+statArr[details[i].state].info+"<\/span>")
                
                data.push("<a href=\"/admin/product/modify?id="+details[i]._id+"\" class=\"btn btn-xs default btn-editable\"><i class=\"fa fa-pencil\"><\/i> Edit<\/a>")
             //   console.log(data)
                ep.emit('datas',data)                

                }

            })

}
