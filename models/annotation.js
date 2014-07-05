/**
 * Created by Lxy on 14-5-19.
 */
function Annotation(annotation) {
    this.startTime = annotation.startTime; //required
    this.endTime = annotation.endTime;
    this.tsuid = annotation.tsuid;
    this.description = annotation.description;
    this.notes = annotation.notes;
    this.custom = annotation.custom;
};

module.exports = Annotation;