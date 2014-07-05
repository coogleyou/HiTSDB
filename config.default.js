/**
 * Created by Lxy on 14-6-11.
 */
var pkg = require('./package.json');

var config = {
    debug: true,
    name: 'HITSDB',
    version: pkg.version,

    host: 'localhost',

    db: 'mongodb://127.0.0.1/tsdb',
    db_name: 'tsdb',
    session_secret: 'hitsdb',
    auth_cookie_name: 'hitsdb',
    port: 3000
}

module.exports = config;
module.exports.config = config;