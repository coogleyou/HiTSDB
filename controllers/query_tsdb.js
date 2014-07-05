/**
 * Created by Lxy on 14-6-20.
 */
var config = require('../config').config;

var validator = require('validator');
var moment = require('moment');
var request = require('request');
require('moment-range');
moment.lang('zh-cn');
var _ = require('underscore');

var tsd_host_ip = config.opentsdb.host_ip;
var tsd_port = config.opentsdb.port;
var tsd_host = config.opentsdb.host;

var SubQuery = require('../models/sub_query');
var QueryObj = require('../models/query_obj');

exports.showQuery = function(req, res, next){
    res.render('tsdb/query');
}

exports.suggest = function(req, res, next){
    var path = '/api/suggest',
        uri = tsd_host + path;
    request({uri: uri, qs: req.query}, function(err, response, body){
        if(response.statusCode == 200){
            res.send(body);
        }
    });
}

exports.getAggregators = function(req, res, next){
    var path = '/api/aggregators',
        uri = tsd_host + path;
    request(uri, function(err, response, body){
        if(response.statusCode == 200){
            res.send(body);
        }
    });
}

exports.metricQuery = function(req, res, next){
    var query_obj = req.body.query_obj,
        start = validator.trim(query_obj.start),
        end = validator.trim(query_obj.end);
    if(!start || start && !validator.isDate(start) || end && !validator.isDate(end)){
        res.json({message: "出错了"});
        return;
    }
    if( start && end && validator.isAfter(start, end)){
        res.json({message: "出错了"});
        return;
    }

    //判断时间跨度，指定downsample，start end转为unix时间戳
    start= moment(start);
    end = end ? moment(end) : null;

    var end_moment = end ? end : moment(),
        downsmp_interval;
    if(end_moment.diff(start, 'years', true) > 1){
        downsmp_interval = '1w';  //大于一年，展示1周聚合后的数据  或者 30d
    } else if(end_moment.diff(start, 'days', true) > 30){
        downsmp_interval = '1d';  //
    } else if(end_moment.diff(start, 'days', true) > 2) {
        downsmp_interval = '1h';
    } else if(end_moment.diff(start, 'hours', true) > 12) {
        downsmp_interval = '5m';
    } else {
        downsmp_interval = '1m';
    }
    for(var i = 0; i < query_obj.queries.length; i++){
        var downsmp_agg = query_obj.queries[i].downsample.split('-')[1];
        query_obj.queries[i].downsample = downsmp_interval + '-' + downsmp_agg;
    }
    query_obj.start = start.unix();
    query_obj.end = end ? end.unix() : null;
    query_obj['arrays'] = true;

    var path = '/api/query',
        uri = tsd_host + path;
    request({
        uri: uri,
        json: query_obj,
        method: "POST"
    }, function(error, response, body){
        if (!error && response.statusCode == 200) {
            res.json({
                message: 'success',
                result: body
            });
        } else{
            console.log(error);
            res.json({
                message: 'error',
                result: null
            });
        }
    });

}


