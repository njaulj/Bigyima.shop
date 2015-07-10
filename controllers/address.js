var mongoose = require('mongoose')
var Address = mongoose.model('Address')


exports.new = function(req,res){

    var address = new Address()
    address.who=req.body.who
    address.where=req.body.where
    address.contact=req.body.contact
    address.user_id=req.session.user._id
      
    
    address.save(function(err, address) {
        if (err) {
            console.log(err)
        }
        res.json(address)
    })
}