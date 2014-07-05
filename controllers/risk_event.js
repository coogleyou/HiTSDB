/**
 * Created by Lxy on 14-6-11.
 */
var config = require('../config').config;

var RiskEvent = require('../proxy').RiskEvent;

var validator = require('validator');
var moment = require('moment');
var fs = require('fs');
var csv = require('csv');
var iconv = require('iconv-lite');
require('moment-range');
moment.lang('zh-cn');
var _ = require('underscore');
var EventProxy = require('eventproxy');

function getAllBuss(){
    return ['POS', 'ONLINE', 'NONCARD', 'epos', 'DAIKOU', 'WTJS', 'CORE', 'SYS'];
}

exports.show = function(req, res, next){
    res.render('risk_event/show');
}
exports.showAdd = function(req, res, next){
    res.render('risk_event/add');
}

/**
 * 请求添加事件
 * @param req
 * @param res
 * @param next
 */
exports.add = function(req, res, next) {
    var occur_time = validator.trim(req.body.occur_time);
    var duration_time = validator.trim(req.body.duration_time);
    var bussiness = validator.trim(req.body.bussiness);
    var comment = validator.trim(req.body.comment);
    if (!occur_time || !duration_time || !bussiness || bussiness.split(',').length < 1) {
        res.render('risk_event/add', {error: "数据不完整。", occur_time: occur_time, duration_time: duration_time, bussiness: bussiness, comment: comment});
        return;
    }
    if(!validator.isDate(occur_time) || validator.isAfter(occur_time)){
        res.render('risk_event/add', {error: "occurTime格式不正确或者晚于现在时间", occur_time: occur_time, duration_time: duration_time, bussiness: bussiness, comment: comment});
        return;
    }
    if(!validator.isInt(duration_time) || duration_time < 0){
        res.render('risk_event/add', {error: "请输入正整数", occur_time: occur_time, duration_time: duration_time, bussiness: bussiness, comment: comment});
        return;
    }
    bussiness = bussiness.split(',');
    var busss = getAllBuss();
    bussiness = _.intersection(bussiness, busss);
    if(bussiness.length < 1){
        res.render('risk_event/add', {
            error: '请选择正确的bussiness'
        });
    }
    RiskEvent.newAndSave(occur_time, duration_time, bussiness, comment, function(err){
        if(err){
            return next(err);
        }
        res.render('risk_event/add', {
            success: '添加成功 '
        });
    });
}
/**
 * 批量导入功能
 * @param req
 * @param res
 * @param next
 */
exports.import = function(req, res, next){
    if (req.files && req.files.csvfile != 'undifined'){
        var temp_path = req.files.csvfile.path;
        if (temp_path) {
            var filesuffix = temp_path.substring(temp_path.lastIndexOf('.')+1,temp_path.length);
            if(filesuffix != 'csv'){
                res.json({message: '上传文件非csv文件！'});
            }
            csv().from.path(temp_path, {header: true, columns: true})
                //.stream(fs.createReadStream(temp_path), {header: true, columns: true})
                .on('record', function(row,index){
                    row = checkRow(row);
                    if(!row){
                        res.json({message: "请检查数据格式，并确保文件编码为UTF-8"});
                        throw new Error('error on import row index #'+index+' '+JSON.stringify(row));
                    }
                    console.log('import row index #'+index+' '+JSON.stringify(row));
                    RiskEvent.newAndSave(row.occur_time, row.duration_time, row.bussiness, row.comment, function(err){
                        if(err){
                            return next(err);
                        }
                    });
                })
                .on('end', function(count){
                    console.log('Number of lines: '+count);
                    fs.unlink(temp_path);
                    res.json({message: '导入成功！'});
                })
                .on('error', function(error){
                    fs.unlink(temp_path);
                    return next(error);
                });
        }
    }
}

exports.showEdit = function(req, res, next){
    var eid = req.param('eid');
    RiskEvent.findById(eid, function(err, event){
        if(err) return next(err);
        var occur_time = moment(event.occur_time).format('YYYY-MM-DD HH:mm');
        res.render('risk_event/add', {eid: event._id, occur_time: occur_time, duration_time: event.duration_time, bussiness: event.bussiness, comment: event.comment});
    });
}

exports.edit = function(req, res, next){
    var eid = validator.trim(req.body.eid);
    var occur_time = validator.trim(req.body.occur_time);
    var duration_time = validator.trim(req.body.duration_time);
    var bussiness = validator.trim(req.body.bussiness);
    var comment = validator.trim(req.body.comment);
    if (!occur_time || !duration_time || !bussiness || bussiness.split(',').length < 1) {
        res.render('risk_event/add', {error: "数据不完整。",eid: eid, occur_time: occur_time, duration_time: duration_time, bussiness: bussiness, comment: comment});
        return;
    }
    if(!validator.isDate(occur_time) || validator.isAfter(occur_time)){
        res.render('risk_event/add', {error: "occurTime格式不正确或者晚于现在时间",eid: eid,  occur_time: occur_time, duration_time: duration_time, bussiness: bussiness, comment: comment});
        return;
    }
    if(!validator.isInt(duration_time) || duration_time < 0){
        res.render('risk_event/add', {error: "请输入正整数",eid: eid,  occur_time: occur_time, duration_time: duration_time, bussiness: bussiness, comment: comment});
        return;
    }
    bussiness = bussiness.split(',');
    var busss = getAllBuss();
    bussiness = _.intersection(bussiness, busss);
    if(bussiness.length < 1){
        res.render('risk_event/add', {
            error: '请选择正确的bussiness'
        });
    }
    RiskEvent.findByIdAndUpdate(eid, {occur_time: occur_time, duration_time: duration_time, bussiness: bussiness, comment: comment}, function(err){
        if(err){
            return next(err);
        }
        res.render('risk_event/add', {
            success: '修改成功'
        });
    });

}

/**
 * 请求查询展示图表
 * @param req
 * @param res
 * @param next
 */
exports.showChart = function(req, res, next){
    var from = validator.trim(req.body.from);
    var to = validator.trim(req.body.to);
    var unit = validator.trim(req.body.unit);
    var bussiness = validator.trim(req.body.bussiness);
    if(from && !validator.isDate(from) || to && !validator.isDate(to)){
        res.render('risk_event/list', {error: "时间格式不正确", from: from, to: to, unit: unit});
        return;
    }
    if( from && to && validator.isAfter(from, to)){
        res.render('risk_event/list', {error: "起始时间不能晚于截止时间", from: from, to: to, unit: unit});
        return;
    }
    if(!unit){
        unit = 'months';
    }
    if(bussiness){
        bussiness = bussiness.split(',');
        var busss = getAllBuss();
        busss.push('ALL');
        bussiness = _.intersection(bussiness, busss);
    }
    if(bussiness.length == 0){
        bussiness = ['ALL'];
    }
    var search = {};
    if(from && !to){
        search = {"$or": [{occur_time: {"$lte": moment(from, 'YYYY-MM-DD').toISOString()},
            end_time: {"$gt": moment(from, 'YYYY-MM-DD').toISOString()}},
            {occur_time: {"$gte": moment(from, 'YYYY-MM-DD').toISOString()}}]};
    };
    if(!from && to){
        search = {"$or": [{occur_time: {"$lt": moment(to, 'YYYY-MM-DD').add('days',1).toISOString()},
                end_time: {"$gt": moment(to, 'YYYY-MM-DD').add('days',1).toISOString()}},
            {end_time: {"$lt": moment(to, 'YYYY-MM-DD').add('days',1).toISOString()}}]};
    };
    if(from && to){
        search = {"$or": [{occur_time: {"$lte": moment(from, 'YYYY-MM-DD').toISOString()},
            end_time: {"$gt": moment(from, 'YYYY-MM-DD').toISOString()}},
            {occur_time: {"$lt": moment(to, 'YYYY-MM-DD').add('days',1).toISOString()},
                end_time: {"$gt": moment(to, 'YYYY-MM-DD').add('days',1).toISOString()}},
            {occur_time: {"$gte": moment(from, 'YYYY-MM-DD').toISOString()},
                end_time: {"$lt": moment(to, 'YYYY-MM-DD').add('days',1).toISOString()}}]};
    };
    if(bussiness.indexOf('ALL') == -1){
        search['bussiness'] = {$elemMatch: {$in: bussiness}};
    }
    var model = {
        search: search
    };

    //查询数据库，因为要生成categories刻度，所以需要from参数
    var ep = EventProxy.create("from", function (from) {
        if(!from){
            res.json({message: '好像出错了!'});
            return;
        }
        if(!to){
            to = moment().format('YYYY-MM-DD');
        }
        var format = getFormat(from, to, unit),
            categories = getcategories(from, to, unit),
            result = {};
        result['categories'] = _.map(_.keys(categories), function(category){
                        return moment(category).format(format);
                    });
        result['series'] = new Array();

        RiskEvent.getRiskEventsByQuery(model, function(err, events){
            if(err){
                return next(err);
            }
            if(events.length == 0){
                res.json({message: '这个时间段内没有风险事件!'});
                return;
            }
            _.each(bussiness, function(bs){
                var datemap = map2date(events, bs);
                var gb = _.groupBy(datemap, function(value, date){
                    return moment(date, 'YYYY-MM-DD').startOf(unit).toISOString();
                });
                var data = _.map(_.keys(categories), function(category){
                    return Number(
                        (gb[category] ? (1 - _.reduce(
                            gb[category], function(memo, sum){return memo + sum}, 0
                        )/categories[category])*100 : 100).toFixed(3)
                    );
                });
                result.series.push({
                    name: bs,
                    data: data
                });
            });

            res.json(result);
        });

    });

    if(!from){
        RiskEvent.getFirstRiskEvent(bussiness, ep.done('from', function(first){
            if(first.length == 0){
                return null;
            }
            return moment(first[0].occur_time.getTime()).format('YYYY-MM-DD');
        }));
    }else{
        ep.emit('from', from);
    }

}

exports.showDateTimeChart = function(req, res, next){
    var from = validator.trim(req.body.from);
    var to = validator.trim(req.body.to);
    var unit = validator.trim(req.body.unit);
    var bussiness = validator.trim(req.body.bussiness);
    if(from && !validator.isDate(from) || to && !validator.isDate(to)){
        res.render('risk_event/list', {error: "时间格式不正确", from: from, to: to, unit: unit});
        return;
    }
    if( from && to && validator.isAfter(from, to)){
        res.render('risk_event/list', {error: "起始时间不能晚于截止时间", from: from, to: to, unit: unit});
        return;
    }
    if(!unit){
        unit = 'months';
    }
    if(bussiness){
        bussiness = bussiness.split(',');
        var busss = getAllBuss();
        busss.push('ALL');
        bussiness = _.intersection(bussiness, busss);
    }
    if(bussiness.length == 0){
        bussiness = ['ALL'];
    }
    var search = {};
    if(from && !to){
        search = {"$or": [{occur_time: {"$lte": moment(from, 'YYYY-MM-DD').toISOString()},
            end_time: {"$gt": moment(from, 'YYYY-MM-DD').toISOString()}},
            {occur_time: {"$gte": moment(from, 'YYYY-MM-DD').toISOString()}}]};
    };
    if(!from && to){
        search = {"$or": [{occur_time: {"$lt": moment(to, 'YYYY-MM-DD').add('days',1).toISOString()},
            end_time: {"$gt": moment(to, 'YYYY-MM-DD').add('days',1).toISOString()}},
            {end_time: {"$lt": moment(to, 'YYYY-MM-DD').add('days',1).toISOString()}}]};
    };
    if(from && to){
        search = {"$or": [{occur_time: {"$lte": moment(from, 'YYYY-MM-DD').toISOString()},
            end_time: {"$gt": moment(from, 'YYYY-MM-DD').toISOString()}},
            {occur_time: {"$lt": moment(to, 'YYYY-MM-DD').add('days',1).toISOString()},
                end_time: {"$gt": moment(to, 'YYYY-MM-DD').add('days',1).toISOString()}},
            {occur_time: {"$gte": moment(from, 'YYYY-MM-DD').toISOString()},
                end_time: {"$lt": moment(to, 'YYYY-MM-DD').add('days',1).toISOString()}}]};
    };
    if(bussiness.indexOf('ALL') == -1){
        search['bussiness'] = {$elemMatch: {$in: bussiness}};
    }
    var model = {
        search: search
    };

    //查询数据库，因为要生成categories刻度，所以需要from参数
    var ep = EventProxy.create("from", function (from) {
        if(!from){
            res.json({message: '好像出错了!'});
            return;
        }
        if(!to){
            to = moment().format('YYYY-MM-DD');
        }
        var format = getFormat(from, to, unit),
            categories = getcategories(from, to, unit),
            result = {};
        result['categories'] = _.map(_.keys(categories), function(category){
            return moment(category).format(format);
        });
        result['unit'] = unit;
        result['series'] = new Array();

        RiskEvent.getRiskEventsByQuery(model, function(err, events){
            if(err){
                return next(err);
            }
            if(events.length == 0){
                res.json({message: '好像出错了!'});
                return;
            }

            _.each(bussiness, function(bs){
                var datemap = map2date(events, bs);

                var gb = _.groupBy(datemap, function(value, date){
                    return moment(date, 'YYYY-MM-DD').startOf(unit).toISOString();
                });
                var data = _.map(_.keys(categories), function(category){
                    var value = [];
                    var x = +moment(category);
                    var y = Number(
                        (gb[category] ? (1 - _.reduce(
                            gb[category], function(memo, sum){return memo + sum}, 0
                        )/categories[category])*100 : 100).toFixed(3)
                    );
                    value.push(x);
                    value.push(y);
                    return value;
                });

                result.series.push({
                    "pointStart": +moment(moment(from, 'YYYY-MM-DD').format(format), format),
                    name: bs,
                    data: data
                });

            });
            res.json(result);
        });

    });

    if(!from){
        RiskEvent.getFirstRiskEvent(null, ep.done('from', function(first){
            if(first.length == 0){
                return null;
            }
            return moment(first[0].occur_time.getTime()).format('YYYY-MM-DD');
        }));
    }else{
        ep.emit('from', from);
    }
}


exports.list = function(req, res, next){
    res.render('risk_event/list');
}

/**
 * 列出事件，并实现分页
 * @param events
 * @returns {{}}
 */
exports.ajaxlist = function(req, res, next){
    var from = validator.trim(req.body.from);
    var to = validator.trim(req.body.to);
    if(from && !validator.isDate(from) || to && !validator.isDate(to)){
        res.render('risk_event/list', {error: "时间格式不正确", from: from, to: to});
        return;
    }
    if( from && to && validator.isAfter(from, to)){
        res.render('risk_event/list', {error: "起始时间不能晚于截止时间", from: from, to: to});
        return;
    }
    var search = {};
    if(from && !to){search = {occur_time: {"$gte": moment(from, 'YYYY-MM-DD').toISOString()}}};
    if(!from && to){search = {occur_time: {"$lte": moment(from, 'YYYY-MM-DD').toISOString()}}};
    if(from && to){search = {occur_time: {"$gte": moment(from, 'YYYY-MM-DD').toISOString(), "$lte": moment(to, 'YYYY-MM-DD').toISOString()}}};
    var page = {limit: 10,num: 1};
    //查看哪页
    if(req.query.p){
        page['num'] = req.query.p < 1 ? 1 : req.query.p;
    }

    var model = {
        search: search,
        //columns: 'name alias director publish images.coverSmall create_date type deploy',
        page: page
    };
//TODO 此处先这样处理，返回查询时间段内的所有数据，以后改为ajax分页
    RiskEvent.findEvents(model, function(err, pageCount, list){
        if(err){
            return next(err);
        }
        res.json({
            eventList: _.map(list, function(event){
                event = JSON.parse(JSON.stringify(event));
                event.occur_time = moment(event.occur_time).format('YYYY-MM-DD HH:mm');
                return event;
            })
        });
    });
}


/**
 * 根据id删除event
 * @param events
 * @returns {{}}
 */
exports.remove = function(req, res, next){
    var id = validator.trim(req.body.eid);
    RiskEvent.removeById(id, function(err){
        console.log(id);
        if(err){
            return next(err);
        }
        res.end();
    });
}

/**
 * 将events转换为每天的风险分钟数
 * @param events
 * @returns {{}}
 */
function map2date(events, bs){
    var datemap = {};
    events.forEach(function(event){
        if(bs != 'ALL' && event.bussiness.indexOf(bs) == -1) return;
        var start = occur_time = moment(event.occur_time),
            end_time = moment(event.end_time),
            end = moment(occur_time.format('YYYY-MM-DD')).add('day', 1);
        while(end.isBefore(end_time)){
            if(!datemap[start.format('YYYY-MM-DD')]){
                datemap[start.format('YYYY-MM-DD')] = 0;
            }
            datemap[start.format('YYYY-MM-DD')] += end.diff(start, 'minutes');
            start = moment(end);
            end.add('day', 1);
        }
        end = end_time;
        if(!datemap[start.format('YYYY-MM-DD')]){
            datemap[start.format('YYYY-MM-DD')] = 0;
        }
        datemap[start.format('YYYY-MM-DD')] += end.diff(start, 'minutes');

    });
    return datemap;
}

/**
 * 根据from，to，unit生成categorites，并返回每个categorite的分钟数
 * @param from
 * @param to
 * @param unit
 * @returns {{}}
 */
function getcategories(from, to, unit){
    var format = getFormat(from, to, unit);
    from = moment(from, 'YYYY-MM-DD').startOf(unit);
    to = moment(to, 'YYYY-MM-DD');
    var range = moment().range(from, to),
        categories = {};
    range.by(unit, function(time){
        categories[time.startOf(unit).toISOString()] = moment(time).add(unit, 1).diff(time, 'minutes');
    });
    return categories;
}

/**
 * 获取格式化字符串
 * @param from
 * @param to
 * @param unit
 * @returns {*}
 */
function getFormat(from, to, unit){
    var format;
    if(unit == 'years'){
        return 'YYYY年';
    }
    from = moment(from, 'YYYY-MM-DD');
    to = moment(to, 'YYYY-MM-DD');
    if(unit == 'months'){
        if(from.year() == to.year()){
            format = 'MM月';
        }else{
            format = 'YYYY年MM月';
        }
    }else if(unit == 'weeks'){
        if(from.year() == to.year()){
            format = '第W周';
        }else{
            format = 'YYYY年第W周';
        }
    }
    return format;
}

function checkRow(row){
    row.occur_time = validator.trim(row.occur_time);
    row.duration_time = validator.trim(row.duration_time);
    row.bussiness = validator.trim(row.bussiness);
    row.comment = validator.trim(row.comment);
    if (!row.occur_time || !row.duration_time || !row.bussiness) {
        return null;
    }
    if(!validator.isDate(row.occur_time) || validator.isAfter(row.occur_time)){
        return null;
    }
    if(!validator.isInt(row.duration_time) || row.duration_time < 0){
        return null;
    }
    var buss = getAllBuss();
    var bussiness = row.bussiness.split(/[\s,;]+/g);
    row.bussiness = _.intersection(buss, bussiness);
    if(row.bussiness.length < 1){
        return null;
    }
    if(row.comment.indexOf('�') != -1){
        console.log('errcode：----' + row.comment);
        return null;
    }
    return row;
}
