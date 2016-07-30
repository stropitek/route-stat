'use strict';

const properties = {
    cumulDistance: 'length',
    cumulDuration: 'time',
    distance: 'length',
    duration: 'time',
    elevation: 'length',
    cumulElevation: 'length',
    speed: 'speed',
    elevationSpeed: 'speed'
};

const validIntervalProperties = ['distance', 'duration', 'elevation'];
const defaultIntervalProperties = {
    length: 'cumulDistance',
    time: 'cumulDuration'
};
const validThresholdProperties = ['speed', 'elevationSpeed', 'pace', 'elevationPace'];


module.exports = {properties, validIntervalProperties, defaultIntervalProperties, validThresholdProperties};