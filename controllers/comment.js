var mongoose = require('mongoose')
var Comment = mongoose.model('Comment')
var Product = mongoose.model('Product')

exports.ajaxcomm = function(req,res){
    var id= req.query.id
    Comment.find({product_id:id})
    .populate({
        path:'from',
        select:'_id userName'
    })
    .sort({createAt:-1})
    .exec(function(err,comments){
        res.json(comments)
    })
}


exports.save = function(req,res){
    var _comment = req.body.comment

    if (_comment.cid) {
        Comment.findById(_comment.cid, function(err, comment) {
            var reply = {
                from: _comment.from,
                to: _comment.tid,
                content: _comment.content
            }

            comment.reply.push(reply)

            comment.save(function(err, comment) {
                if (err) {
                    console.log(err)
                }

                res.send('success')
            })
        })
    }
    else {
        var comment = new Comment(_comment)

        comment.save(function(err, comment) {
            if (err) {
                console.log(err)
            }

            res.send('success')
        })
    }
}



exports.new = function(req,res){
    var _comment = {
        product_id :'55632738e35c60660e1e0274',
        from:'5560778bc5b046e207b71f2a',
        reply:[{
        from:'55605af9789d2064072dc485',
            to:'5560778bc5b046e207b71f2a',
            content:'还不错啊'
    }],
        content:'这个怎么样'
    }
    var comment = new Comment(_comment)
    comment.save(function(err, comment) {
        if (err) {
            console.log(err)
        }

        res.send('success')
    })
}