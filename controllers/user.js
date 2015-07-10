var mongoose = require('mongoose')
var User = mongoose.model('User')

//signup
exports.showSignup = function(req, res) {
    res.render('signup', {
        title: '注册页面'
    })
}

exports.showSignin = function(req, res) {
    res.render('signin', {
        title: '登录页面'
    })
}


exports.signup = function(req, res) {
    console.log(req.body)
    var _user = req.body.user
   // console.log(req.body.user)

    User.findOne({userName: _user.userName},  function(err, user) {
        if (err) {
            console.log(err)
        }

        if (user) {
            return res.redirect('/signin')
        }
        else {
            user = new User(_user)
            console.log(user)
            user.save(function(err, user) {
                if (err) {
                    console.log(err)
                }
            req.session.user=user
                res.redirect('/')
            })
        }
    })
}

// signin
exports.signin = function(req, res) {
    var _user = req.body.user
    var userName = _user.userName
    var password = _user.password

    console.log(_user)

    User.findOne({userName: userName}, function(err, user) {
        if (err) {
            console.log(err)
        }

        if (!user) {
            return res.redirect('/signup')
        }

        user.comparePassword(password,function(err, isMatch) {
        //    console.log(user.password)
            if (err) {
                console.log(err)
            }

            if (isMatch) {
                req.session.user = user
              //  console.log(req.session.user)
                return res.redirect('/')
            }
            else {
                return res.redirect('/signin')
            }
        })
    })
}

// logout
exports.logout =  function(req, res) {
    delete req.session.user
    //delete app.locals.user
    console.log(req.session.user)
    res.redirect('/')
}

// midware for user
exports.signinRequired = function(req, res, next) {
    var user = req.session.user
    console.log(user)
    if (!user || user==undefined) {
        console.log(req.query.isajax)
        if(req.query.isajax){
            res.json({success:403}) //userrequi
            return
        }else{
        res.redirect('/signin')

        return 
    }
}

    next()
}

exports.adminRequired = function(req, res, next) {
    var user = req.session.user

    if (user.role <= 10) {
        return res.redirect('/signin')
    }

    next()
}

exports.new = function(req,res){
    var _user = {
        userName:'13182821382',
        password:'cdmagprs',
        role:'1'
    }
    var user = new User(_user)
    user.save(function(err, user) {
        if (err) {
            console.log(err)
        }

       res.send('success')
    })
}







