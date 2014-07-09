/**
 * Created by Lxy on 14-7-7.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../config').config;
var moment = require('moment');
mongoose.set('debug', true);

var MD5 = require('MD5');

var UserSchema = new Schema({
    username: {type: String, required: true, unique: true },
    password: {type: String, required: true},
    reg_time: {type: Date},
    is_admin: {type: Boolean}
});

UserSchema.pre('save', function(next) {
    var user = this;
    if(!user.isModified('password')) return next();
    user.password = MD5(user.password);
});

UserSchema.pre('save', function(next) {
    var user = this;
    if(!user.isModified('password')) return next();
    user.password = MD5(user.password);
});

UserSchema.index({username: 1});

mongoose.model('User', UserSchema);