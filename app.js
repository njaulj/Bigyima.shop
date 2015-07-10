var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var fs = require('fs')
var csrf = require('csurf')
var app = express();
var multer  = require('multer')
var moment = require('moment')
var dedupe = require('dedupe')
// models loading
var models_path = __dirname + '/models'
var walk = function(path) {
    fs
        .readdirSync(path)
        .forEach(function(file) {
            var newPath = path + '/' + file
            var stat = fs.statSync(newPath)

            if (stat.isFile()) {
                if (/(.*)\.(js|coffee)/.test(file)) {
                    require(newPath)
                }
            }
            else if (stat.isDirectory()) {
                walk(newPath)
            }
        })
}
walk(models_path)



// view engine setup
app.set('views', path.join(__dirname, 'views/pages'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public

app.use(express.static(path.join(__dirname, 'public')));

//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(multer({ dest:'../public/uploads/'}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser('liujun'));
app.use(session({
    store: new RedisStore({
        host: "127.0.0.1",
        port: 6379
    }),
    secret: 'liujun'
}))

app.use(csrf())
app.use(function (req, res, next) {

    res.locals._csrf = req.csrfToken ? req.csrfToken() : ''

        next()

})
 app.locals.moment = moment
 app.locals.dedupe = dedupe

var index= require('./routes/index')
app.use('/',index)
// catch 404 and forward to error handler
/*
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
*/
// error handlers

// development error handler
// will print stacktrace

/*
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

*/

// production error handler
// no stacktraces leaked to user
/*
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

*/

module.exports = app;
