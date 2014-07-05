/**
 * Created by Lxy on 14-6-10.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../config').config;
var moment = require('moment');
mongoose.set('debug', true);

var RiskEventSchema = new Schema({
    occur_time: {type: Date},
    duration_time: {type: Number},
    end_time: {type: Date},
    bussiness: {type: Array},
    comment: {type: String}
});

RiskEventSchema.index({occur_time: 1});
RiskEventSchema.index({end_time: 1});
RiskEventSchema.index({bussiness: 1});

mongoose.model('RiskEvent', RiskEventSchema);