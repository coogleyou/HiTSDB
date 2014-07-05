/**
 * Created by Lxy on 14-5-19.
 */
function SubQuery(subQuery) {
    this.aggregator = subQuery.aggregator;
    this.metric = subQuery.metric;
    this.rate = subQuery.rate || false;  //default false
    this.rateOptions = subQuery.rateOptions || null;
    this.downsample = subQuery.downsample;
    this.tags = subQuery.tags;
};

exports.SubQuery = SubQuery;
