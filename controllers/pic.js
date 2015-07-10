var mongoose = require('mongoose')
var Differ = mongoose.model('Differ')
var Pic=mongoose.model('Pic')
var fs =require('fs')
var uploader = require('../libs/uploader')
var eventproxy = require('eventproxy')
var Brand=mongoose.model('Brand')

exports.upload=function(req,res){
    var _differ =new Differ()
    _differ.save(function(err,differ){
        var tmpPath = req.files.file.path
        var targetPath = '../public/uploads/product/' + differ._id+'.'+req.files.file.extension

        fs.rename(tmpPath, targetPath , function(err) {
            if (err) {
                console.log(err)
            }
           // console.log(req.files.file.path)
          //  differ.picPath = targetPath
          differ.picPath = differ._id+'.'+req.files.file.extension
            var ep =new eventproxy()

            ep.all('differ','qiniu',function(differ,qiniu){
                res.json({result:'OK',filePath:differ._id+'.'+req.files.file.extension,differ_id:differ._id})
            })
            differ.save(function(err,dd){
                ep.emit('differ',dd)
            })
            uploader.uploadFile(targetPath,'/product/'+differ._id+'.'+req.files.file.extension,function(err,qiniu){
                ep.emit('qiniu',qiniu)
            })
        })


    })
}



exports.blog=function(req,res){
    var _pic =new Pic()
    _pic.save(function(err,pic){
        var tmpPath = req.files.file.path
        var targetPath = '../public/uploads/blog/' + pic._id+'.'+req.files.file.extension

        fs.rename(tmpPath, targetPath , function(err) {
            if (err) {
                console.log(err)
            }
            // console.log(req.files.file.path)
            pic.picPath = targetPath
            var ep =new eventproxy()

            ep.all('pic','qiniu',function(pic,qiniu){
                res.json({url:'http://7xioyb.com1.z0.glb.clouddn.com/@/blog/'+pic._id+'.'+req.files.file.extension})
            })
            pic.save(function(err,pp){
                ep.emit('pic',pp)
            })
            uploader.uploadFile(targetPath,'/blog/'+pic._id+'.'+req.files.file.extension,function(err,qiniu){
                ep.emit('qiniu',qiniu)
            })
        })


    })
}



exports.brand=function(req,res){
    var id=req.body.id
    var _pic =new Pic()
    _pic.save(function(err,pic){
        var tmpPath = req.files.file.path
        var targetPath = '../public/uploads/brand/' + pic._id+'.'+req.files.file.extension
        var brandPic=pic._id+'.'+req.files.file.extension

        fs.rename(tmpPath, targetPath , function(err) {
            if (err) {
                console.log(err)
            }
            // console.log(req.files.file.path)
            pic.picPath = targetPath

            var ep =new eventproxy()

            ep.all('pic','qiniu',function(pic,qiniu){
                res.json({url:'http://7xioyb.com1.z0.glb.clouddn.com/@/brand/'+pic._id+'.'+req.files.file.extension})
            })
            pic.save(function(err,pp){
                ep.emit('pic',pp)
            })
            uploader.uploadFile(targetPath,'/brand/'+pic._id+'.'+req.files.file.extension,function(err,qiniu){
                 Brand.findOne({_id:id},function(err,brand){
                brand.brandPic=brandPic
                brand.save(function(err,brand){
                    console.log(brand)
                ep.emit('qiniu',qiniu)

                })
            })
            })
        })


    })
}




