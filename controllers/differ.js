var mongoose = require('mongoose')
var Differ = mongoose.model('Differ')
var eventproxy = require('eventproxy')

var moment = require('moment')

exports.save = function(product_id,differs){
    var ep = new eventproxy()
    ep.after('differ',differs.length,function(differ){
        res.send('success')
    })
    for (var i = 0; i < differs.length; i++) {
        differs[i].product_id = product_id
        var _differ = differs[i]
        _differ.differPrice=parseInt(_differPrice*100)
        _differ.marketPrice=parseInt(_differPrice*100)

        var differ = new Differ(_differ)
        differ.save(function(err,differ){
            ep.emit('got_file', content);
        })
    }
}


exports.new = function(req,res){
    var _differ = {
        product_id :'5535b57ea14e15f14ab97472',
        differName:'100ml',
        differDesp:'2瓶',
        differPrice:89.5,
        amount:99
    }
    var differ = new Differ(_differ)
    differ.save(function(err, differ) {
        if (err) {
            console.log(err)
        }
        res.send('success')

    })
}



exports.list=function(req,res){
res.render('differlist')
}

exports.line=function(req,res){
   // console.log(req)
  //  console.log(req.query.draw)
  //  console.log(req.query.start)
   var draw = parseInt(req.body.draw)
   // console.log(draw)
    var start = parseInt(req.body.start)
    var length=parseInt(req.body.length)
    var query ={}
    if(req.body.action){
         if(req.body.differ_id){
            query._id=req.body.differ_id
         }
         console.log(query)
    }


   // console.log(req.body.order)
 //  console.log(req.query.order[0].column)
  //  var _column=parseInt(req.body.order[0].column)
       //  var _column=parseInt(Math.random()*6)
       var _column=parseInt(req.body.order[0].column)
       var _dir =req.body.order[0].dir
       //  var _dir='asc'
         var dir
         var str ={}
            if(_dir=='desc'){
                dir=-1
            }else{
                dir=1
            }

    switch(_column){
        case 1:{str._id=dir;break}
        case 2:{str.differName=dir;break}
        case 3:{str.product_id=dir;break}
        case 4:{str.differPrice=dir;break}
        case 5:{str.amount=dir;break}
        case 6:{str.createAt=dir;break}
        case 7:{str.state=dir;break}
        default:{str._id=dir;break}
    }
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
                ep.after('differs',ids.length,function(differs){
                    export_list(start,length,str,draw,function(err,data){
                                    res.json(data)
                                })
                })
                for (var i=0;i<ids.length;i++){
                    var options= {$set:{'state':state}}
                    Differ.findByIdAndUpdate(ids[i],options,function(err,differ){
                                ep.emit('differs',1)    
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

    console.log(str)
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
       Differ.count({product_id:{$not:null}},function(err,sum){
        ep.emit('sum',sum)
       })


        Differ.find({product_id:{$not:null}})
            .populate({
                path:'product_id',
                select:'_id productName'
                })
            .skip(start)
            .limit(length)
            .sort(str)
            .exec(function(err,differs){

                ep.after('datas',differs.length,function(datas){
                //   console.log(datas)
                    ep.emit('datasss',datas)
                })

 var statArr=[{'color':'danger','info':'Deleted'},{'color':'success','info':'Publish...'}
                    ,{'color':'info','info':'Not Published...'},{'color':'warning','info':'Erroring...'}
                    ]
                for (var i =0;i<differs.length;i++){
                    var data=[]
                    data.push("<input type=\"checkbox\" name=\"id[]\" value=\""+differs[i]._id+"\">")
                    data.push(differs[i]._id)
                    data.push(differs[i].differName)
                    data.push("<a href=\"/product?id="+differs[i].product_id._id+"\">"+differs[i].product_id.productName+"</a>")
                    data.push(differs[i].differPrice)
                    data.push(differs[i].amount)
                    data.push(moment(differs[i].createAt).format('MM/DD/YYYY'))
                   
                    data.push("<span class=\"label label-sm label-"+statArr[differs[i].state].color+"\">"+statArr[differs[i].state].info+"<\/span>")
                
                data.push("<a href=\"/admin/product/modify?id="+differs[i].product_id._id+"\" class=\"btn btn-xs default btn-editable\"><i class=\"fa fa-pencil\"><\/i> Edit<\/a>")
             //   console.log(data)
                ep.emit('datas',data)                

                }

            })

}


exports.delete=function(req,res){
    var id=req.query.id
    Differ.findOne({_id:id},function(err,differ){
        differ.state=0
        differ.save(function(err,differ){
            res.json({success:1})
        })
    })
}