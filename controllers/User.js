/**
 * Created by Lxy on 14-7-7.
 */
var config = require('../config').config;

var User = require('../proxy').User;
var passport = require('passport');

exports.showLogin = function(req, res, next){
    res.render('login', { message: req.session.messages });
}

exports.login = function(req, res, next){
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err) }
        if (!user) {
            req.session.messages =  [info.message];
            return res.redirect('/login')
        }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            return res.redirect('/');
        });
    })(req, res, next);
}

exports.logout = function(req, res, next){
    req.logout();
    res.redirect('/');
}

exports.showSetting = function(req, res, next){
    res.render('user/setting');
}

exports.setting = function(req, res, next){
    var password = req.body.password;
    User.updateUserByUsername(req.user.username, password, function(err, user){
        if(err){
            return next(err);
        }
        req.logout();
        res.redirect('/');
    });
}
