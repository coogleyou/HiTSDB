
/*
 * GET home page.
 */
var crypto = require('crypto'),
    Metric = require('../models/metric.js'),
    Charts = require('../models/charts.js'),
    http = require('http');


module.exports = function(app){
    app.get('/', function(req, res) {
        res.render('index', {title: 'TTSD'});
    });

    app.get('/put', function(req, res) {
        res.render('put', {title: 'PUT'});
    });

    app.post('/put', function(req,res) {
        var metric = req.body.metric,
            timestmp = req.body.timestmp,
            value = req.body.value,
            tagk = req.param('tags.tagk'),
            tagv = req.param('tags.tagv');

        var tags = {};
        tags[tagk] = tagv;

        var jsonput = {
            'metric': metric,
            'timestamp': timestmp,
            'value': value,
            'tags': tags
        };
        var options = {
            host: '172.17.253.207',
            port: 4242,
            path: '/api/put?details',
            method: 'post',
            headers: {
                "Content-Type": 'application/json',
                "Content-Length": Buffer.byteLength(JSON.stringify(jsonput))
            }
        };
        var req = http.request(options, function (res) {
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.on('data',function (chunk) {
                console.log('BODY: ' + chunk);
            });
        });

        req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });
        req.write(JSON.stringify(jsonput));
        req.end();
        res.redirect('/put');

    });

    app.get('/query', function(req, res) {
        res.render('query', {
        });
    });

    app.post('/query', function(req, res) {

        var query = req.body;

        var metric = req.body.metric,
            start = req.body.start,
            end = req.body.end,
            aggregator = req.body.aggregator,
            downsample = req.body.downsample,
            queries = new Array(),
            tags = req.body.tags;
        var timespan = req.body.timespan;
        var subQuery = {
            metric: metric,
            aggregator: aggregator == null ? "sum" : aggregator
        };
        if(downsample != null){
            subQuery.downsample = downsample;
        }
        if(tags != null){
            subQuery.tags = tags;
        }
        queries.push(subQuery);

//        var subQuery = {
//            'metric': metric,
//            'aggregator': aggregator,
//            'tags': tags,
//            'downsample':downsample
//        };
        var query = {
            'start': start,
            'queries': queries
        };
        if(end != null){
            query.end = end;
        }
        var options = {
            host: '172.17.253.207',
            port: 4242,
            path: '/api/query',
            method: 'post',
            headers: {
                "Content-Type": 'application/json',
                "Content-Length": Buffer.byteLength(JSON.stringify(query))
            }
        };

        var req = http.request(options, function (resp) {
            var statusCode = resp.statusCode;
            if(statusCode == 200){
                resp.on('data',function (chunk) {
                    console.log('BODY: '+chunk);
                    var resdata = new Array(chunk);
                    var subres = JSON.parse(resdata[0]);

                    //生成categories
                    var ctg = subres[0].dps;
                    for(var i = 0; i<subres.length; i++){
                        if(ctg.length < subres[i].dps.length)
                            ctg = subres[i].dps;
                    }
                    var result = {};
                    result.categories = new Array();
                    if(timespan == 'year'){
                        for(var c in ctg){
                            var unixstamp = (c*1000).toLocaleString();
                            var time = new Date();
                            time.setTime(unixstamp);
                            result.categories.push(time.getUTCFullYear() + '年' + (time.getMonth() + 1) + '月');
                        }
                    }
                    //生成series
                    result.series = new Array();
                    for(var i = 0; i < subres.length; i++){
                        var name = subres[i].tags.year;
                        var data = new Array();
                        var dps = subres[i].dps;
                        for(var d in dps){
                            data.push(dps[d].toFixed(4)*100);
                        }
                        result.series.push({
                            'name': name,
                            'data': data
                        });
                    }
                    result.title = '系统可用性';
                    console.log(JSON.stringify(result));
                    res.json(JSON.stringify(result));
                });
            }else if(statusCode == 400){
                console.log(resp);
            }
        });
        req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });
        req.write(JSON.stringify(query));
        req.end();

    });
};
