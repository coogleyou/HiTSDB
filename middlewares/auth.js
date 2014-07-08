/**
 * Created by Lxy on 14-7-7.
 */
var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy
    , User = require('../proxy').User;
var MD5 = require('MD5');

exports.ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login')
}

exports.ensureAdmin = function(req, res, next) {
    if(req.user && req.user.admin === true)
        next();
    else
        res.send(403);
}

passport.use('local', new LocalStrategy(
    function (username, password, done) {
        User.getUserByUsername(username, function(err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false, { message: '用户名不存在 ' + username }); }
            if(user.password == MD5(password)){
                return done(null, user);
            }else{
                return done(null, false, { message: '密码错误 ' });
            }
        });
    }
));

passport.serializeUser(function (user, done) {//保存user对象
    done(null, user._id);//可以通过数据库方式操作
});

passport.deserializeUser(function (id, done) {//删除user对象
    User.getUserById(id, function (err, user) {
        done(err, user);
    });
});
