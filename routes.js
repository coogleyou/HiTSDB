/**
 * Created by Lxy on 14-6-11.
 */
var config = require('./config');
var site = require('./controllers/site');
var user = require('./controllers/user');
var riskEvent = require('./controllers/risk_event');
var queryTSDB = require('./controllers/query_tsdb');
var auth = require('./middlewares/auth');
var passport = require('passport');

module.exports = function (app) {
    // home page
    app.get('/', site.index);
    app.get('/login', user.showLogin);
    app.post('/login', user.login);
    app.get('/logout', user.logout);

    //user
    app.all('/user*', auth.ensureAuthenticated);
    app.get('/user/setting', user.showSetting);
    app.post('/user/setting', user.setting);

    //riskEvent
    app.all('/risk_event*', auth.ensureAuthenticated);
    app.get('/risk_event', riskEvent.show);
    app.get('/risk_event/add', riskEvent.showAdd);
    app.post('/risk_event/add', riskEvent.add);
    app.get('/risk_event/show', riskEvent.show);
    app.post('/risk_event/show', riskEvent.showChart);
    app.post('/risk_event/show/datetime', riskEvent.showDateTimeChart);
    app.get('/risk_event/list', riskEvent.list);
    app.post('/risk_event/list', riskEvent.ajaxlist);
    app.post('/risk_event/remove', riskEvent.remove);
    app.post('/risk_event/import', riskEvent.import);
    app.get('/risk_event/edit*', riskEvent.showEdit);
    app.post('/risk_event/edit', riskEvent.edit);

    //query tsdb
    app.get('/tsdb', queryTSDB.showQuery);
    app.get('/tsdb/api/suggest', queryTSDB.suggest);
    app.get('/tsdb/api/aggregators', queryTSDB.getAggregators);
    app.post('/tsdb/api/query', queryTSDB.metricQuery);

    app.all('*', auth.ensureAuthenticated);

};
