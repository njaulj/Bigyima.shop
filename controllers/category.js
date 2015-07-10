var mongoose = require('mongoose')
var Category = mongoose.model('Category')
var Brand = mongoose.model('Brand')

exports.new = function(req,res){
    var _category = {
        group_id :'555efb62bd28efa603b78ddb',
        categoryName:'洗面奶',
        categoryDesp:'清洁肌肤'
    }
    var category = new Category(_category)
    category.save(function(err, category) {
        if (err) {
            console.log(err)
        }

        res.send('success')
    })
}

exports.getChild=function(cid){
    Brand.find({'category_id':cid},function(err,brands){
        if(err){
            console.log(err)
        }
        console.log(brands)
    })
}

exports.manage=function(req,res){
    var page=req.query.page?parseInt(req.query.page):1
    console.log(page)
    res.send(page)
}