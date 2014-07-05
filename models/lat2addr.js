/**
 * Created by Lxy on 14-5-30.
 */
// 引用 http 模块
var http = require("http");
var async = require("async");
var linereader = require("line-reader");
// 引用 filestream 模块
var fs = require("fs");

// http://api.map.baidu.com/geocoder/v2/?ak=ZITp8pePDe02iREQxrzNDnP4&
// location=39.983424,116.322987&output=json&pois=1
var requrl = 'http://api.map.baidu.com/geocoder/v2/?ak=ZITp8pePDe02iREQxrzNDnP4&output=json&pois=1&location=';

linereader.open('./public/add111.csv',function(reader){
    async.whilst(function(){
        return reader.hasNextLine();
    },function(cb){
        reader.nextLine(function(line) {
            var cells = line.split(',');
            var i = cells.length;
            var location = cells[i-1].trim() + ',' + cells[i-2].trim();
            http.get(requrl+location,function(resp){
                resp.on('data',function(res){
                    console.log(res);
                    var res = JSON.parse(res).result;
                    var resString = '';
                    resString = res.location.lat + "," + res.location.lng + "," + res.formatted_address + "," + res.business + "," + res.addressComponent.city + "," + res.addressComponent.district + "," + res.addressComponent.province + "," + res.addressComponent.street + "," + res.addressComponent.street_number;
                    var pois = res.pois;
                    //console.log(pois);
                    for(var i=0; i<pois.length; i++){
                        var poi = pois[i];
                        resString += "," + poi.name + "," + poi.poiType + "," + poi.addr + "," + poi.point.x + "," + poi.point.y + "," + poi.distance;
                    }
                    //console.log(resString);
                    fs.appendFileSync('./res.txt',location + "," + resString + '\r\n');
                });
            }).on('error', function(e) {
                    console.log("Got error: " + e.message);
                });
        });
        setTimeout(cb,1500);
    })
});
