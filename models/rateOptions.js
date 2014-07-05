/**
 * Created by Lxy on 14-5-19.
 */
function RateOptions(rateOptions) {
    this.counter = rateOptions.counter;  //false
    this.counterMax = rateOptions.counterMax;  //MaxValue
    this.resetValue = rateOptions.resetValue;  //default 0
};

module.exports = RateOptions;