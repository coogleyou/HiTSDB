/**
 * Created by Lxy on 14-6-11.
 */
var models = require('../models');
var RiskEvent = models.RiskEvent;
var moment = require('moment');
/**
 * 查找时间段内的风险事故
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {Date} from 查询起始时间
 * @param {Date} to 查询结束时间
 * @param {Function} callback 回调函数
 */
exports.getRiskEventsByQuery = function(model, callback){
    var q = model.search ||{};
    RiskEvent.find(q, callback);

};
/**
 * 根据bussiness，查找属于该bussiness的风险事故
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} bussiness 业务
 * @param {Function} callback 回调函数
 */
exports.getRiskEventsByBussiness = function(bussiness, callback){
    RiskEvent.find({bussiness: bussiness}, callback);
};
/**
 * 添加风险事故
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {Date} occur_time 发生时间
 * @param {Number} duration_time 持续时间，分钟数
 * @param {String} bussiness 业务
 * @param {String} coment 备注
 * @param {Function} callback 回调函数
 */
exports.newAndSave = function (occur_time, duration_time, bussiness, comment, callback) {
    var riskEvent = new RiskEvent();
    riskEvent.occur_time = moment(occur_time).toISOString();
    riskEvent.duration_time = duration_time;
    riskEvent.bussiness = bussiness;
    riskEvent.comment = comment;
    riskEvent.end_time = moment(occur_time).add('minutes', duration_time).toISOString();
    riskEvent.save(callback);
};

exports.getFirstRiskEvent = function(bussiness, callback) {
    var reagg =  RiskEvent.aggregate();
    if(bussiness && bussiness.indexOf('ALL') == -1){
        reagg = reagg.match({bussiness: {$elemMatch: {$in: bussiness}}});
    }
    reagg.sort('occur_time').limit(1).exec(callback);
};

//TODO  服务端分页，修改为服务端查询
exports.findPagination = function(obj, callback){
    var q = obj.search ||{},
        col = obj.columns || null,
        pageNumber = obj.page.num || 1,
        resultsPerPage = obj.page.limit || 10;
    var skipFrom = (pageNumber * resultsPerPage) - resultsPerPage;
    var query = RiskEvent.find(q,col).sort('-occur_time').skip(skipFrom).limit(resultsPerPage);
    query.exec(function(error, results) {
        if (error) {
            callback(error, null, null);
        } else {
            RiskEvent.count(q, function(error, count) {
                if (error) {
                    callback(error, null, null);
                } else {
                    var pageCount = Math.ceil(count / resultsPerPage);
                    callback(null, pageCount, results);
                }
            });
        }
    });
};

//TODO 客户端分页，服务端不分页的方法
exports.findEvents = function(obj, callback){
    var q = obj.search ||{},
        col = obj.columns || null;
    var query = RiskEvent.find(q,col).sort('-occur_time');
    query.exec(function(error, results) {
        if (error) {
            callback(error, null, null);
        } else {
            callback(null, null, results);
        }
    });
};
/**
 * 根据ID删除
 * @param id
 * @param callback
 */
exports.removeById = function(id, callback){
    RiskEvent.remove({_id: id}, callback);
}

exports.findById = function(id, callback){
    RiskEvent.findById(id, callback);
}

exports.findByIdAndUpdate = function(id, data, callback){
    data['end_time'] = moment(data.occur_time).add('minutes', data.duration_time).toISOString();
    RiskEvent.findByIdAndUpdate(id, data, callback);
}