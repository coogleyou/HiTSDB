/**
 * Created by Lxy on 14-6-11.
 */
var config = require('../config').config;
var EventProxy = require('eventproxy');

exports.index = function(req, res, next){
    if(req.user){
        res.render('index', { user: req.user });
    }else{
        res.redirect('/login');
    }
}
