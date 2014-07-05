/**
 * Created by Lxy on 14-5-19.
 */
function QueryObj(queryObj) {
    this.start = queryObj.start;
    this.end = queryObj.end;  //default current time
    this.queries = queryObj.queries;  //m or tsuids  see subQuery
    this.noAnnotations = queryObj.noAnnotations || true;  //default true
    this.globalAnnotations = queryObj.globalAnnotations || false; //default false
    this.msResolution = queryObj.msResolution || false;  //default false
    this.showTSUIDs = queryObj.showTSUIDs || false;  //default false
};
exports.QueryObj = QueryObj;