/**
 * Created by Lxy on 14-7-7.
 */
var models = require('../models');
var User = models.User;
var MD5 = require('MD5');

exports.newAndSave = function (username, password, callback) {
    var user = new User();
    user.username = username;
    user.password = password;
    user.reg_time = new Date();
    user.save(callback);
};

exports.getUserByUsername = function(username, callback){
    User.findOne({username: username}, callback);
}

exports.getUserById = function (id, callback) {
    User.findOne({_id: id}, callback);
};
