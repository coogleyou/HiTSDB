
/**
 * Module dependencies.
 */
var config = require('./config').config;
var fs = require('fs');
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    auth = require('./middlewares/auth');
var _ = require('underscore');

var staticDir = path.join(__dirname, 'public');
var urlinfo = require('url').parse(config.host);
config.hostname = urlinfo.hostname || config.host;


/*var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var MD5 = require('MD5');
var conn = mongoose.createConnection('mongodb://127.0.0.1/tsdb');
var UserSchema = new Schema({
    username: {type: String, required: true, unique: true },
    password: {type: String, required: true},
    reg_time: {type: Date},
    is_admin: {type: Boolean}
});
var User = conn.model('User',UserSchema);
var admin = new User({username: "admin", password: MD5('sysadmin'), reg_time: new Date(), is_admin: true});
admin.save(function(err){
    console.log(err);
});
conn.close();*/

var app = express();
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));

app.use(express.bodyParser({uploadDir: config.upload_dir}));
app.use(express.methodOverride());

app.use(express.cookieParser());

//connect-mongo 存储session 暂时不用
app.use(express.session({
    secret: config.session_secret,
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30}  //30天
}));
app.use(passport.initialize());
app.use(passport.session());

/*app.use(
    function(req, res, next){
        res.locals.session = req.session;
        next();
    });*/
app.use(function(req, res, next){
    res.locals.user = req.user;
    next();
});

//app.use(app.router); routes(app)？
app.use('/', express.static(staticDir));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true}));
}
routes(app);
app.listen(config.port, function(){
    console.log("HiTSDB listening on port %d in %s mode", config.port, app.settings.env);
    console.log("God bless love....");
    console.log("You can debug your app with http://" + config.hostname + ':' + config.port);
});

module.exports = app;
