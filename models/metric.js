/**
 * Created by Lxy on 14-5-19.
 */
function Metric(metric) {
    this.metric = metric.metric;
    this.timestamp = metric.timestamp;
    this.value = metric.value;
    this.tags = metric.tags;
};

module.exports = Metric;
