'use strict';

const properties = {
    cumulDistance: 'length',
    cumulDuration: 'time',
    distance: 'length',
    duration: 'time',
    elevation: 'length',
    cumulElevation: 'length',
    speed: 'speed',
    elevationSpeed: 'speed',
    speedSmooth: 'speed',
    elevationSpeedSmooth: 'speed',
    paceSmooth: 'pace',
    elevationPaceSmooth: 'pace'
};

const validIntervalProperties = ['distance', 'duration', 'elevation'];
const defaultIntervalProperties = {
    length: 'cumulDistance',
    time: 'cumulDuration'
};
const validThresholdProperties = ['speed', 'elevationSpeed', 'pace', 'elevationPace', 'speedSmooth', 'elevationSpeedSmooth', 'paceSmooth', 'elevationPaceSmooth'];


module.exports = {properties, validIntervalProperties, defaultIntervalProperties, validThresholdProperties};