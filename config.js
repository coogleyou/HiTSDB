/**
 * Created by Lxy on 14-6-11.
 */
var pkg = require('./package.json');
var path = require('path');

var config = {
    debug: true,
    name: 'HITSDB',
    version: pkg.version,

    host: 'localhost',
    upload_dir: path.join(__dirname, 'tmp'),
    db: 'mongodb://127.0.0.1/tsdb',
    db_name: 'tsdb',
    session_secret: 'hitsdb',
    auth_cookie_name: 'hitsdb',
    port: 3000,

    opentsdb: {
        host_ip: "172.17.253.207",
        port: 4242,
        host: "http://172.17.253.207:4242"
    }
}

module.exports = config;
module.exports.config = config;