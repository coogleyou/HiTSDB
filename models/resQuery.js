/**
 * Created by Lxy on 14-5-19.
 */
function ResQuery(resQuery) {
    this.metric = resQuery.metric;
    this.tags = resQuery.tags;
    this.aggregatedTags = resQuery.aggregatedTags;  //default false
    this.dps = resQuery.dps;
    this.annotations = resQuery.annotations;
    this.globalAnnotations = resQuery.globalAnnotations;
};

module.exports = ResQuery;