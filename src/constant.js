'use strict';

const properties = {
    cumulDistance: 'length',
    cumulDuration: 'time',
    distance: 'length',
    duration: 'time',
    elevation: 'length',
    cumulElevation: 'length',
    speed: 'speed'
};

const validIntervalProperties = ['distance', 'duration', 'elevation'];
const defaultIntervalProperties = {
    length: 'cumulDistance',
    time: 'cumulDuration'
};
const validThresholdProperties = ['speed']; // TODO: add elevation speed


module.exports = {properties, validIntervalProperties, defaultIntervalProperties, validThresholdProperties};