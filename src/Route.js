'use strict';
const parseRule = require('./parseRule');
const converter = require('./unitConverter');
const SG = require('ml-savitzky-golay');
const GpxHelper = require('./GpxHelper');

const SGDefault = {
    windowSize: 31,
    pad: 'pre',
    derivative: 0
};

class Route {
    constructor(segments, options) {
        options = options || {};
        // Make a deep copy
        this.segments = segments.map(segment => {
            return {
                distance: segment.distance,
                duration: segment.duration,
                elevation: segment.elevation
            };
        });
        this._timeUnit = options.timeUnit || 'h';
        this._lengthUnit = options.distanceUnit || 'km';
        this._speedUnit = this._lengthUnit + '/' + this._timeUnit;
        this._paceUnit = this._timeUnit + '/' + this._lengthUnit;
        if(options.SG) {
            this._SG = Object.assign({}, SGDefault, options.SG);
        }
    }

    get distance() {
        return this.segments.map(segment => segment.distance);
    }

    get duration() {
        return this.segments.map(segment => segment.duration);
    }

    get elevation() {
        return this.segments.map(segment => segment.elevation);
    }

    _getComputedProperty(property) {
        var prop = '_' + property;
        if(!this[prop]) {
            this._compute();
        }
        return this[prop];
    }

    get speed() {
        return this._getComputedProperty('speed');
    }

    get elevationSpeed() {
        return this._getComputedProperty('elevationSpeed');
    }

    get meanSpeed() {
        return this._getComputedProperty('meanSpeed');
    }

    get meanPace() {
        return this._getComputedProperty('meanPace');
    }

    get totalDuration() {
        return this._getComputedProperty('totalDuration');
    }

    get totalDistance() {
        return this._getComputedProperty('totalDistance');
    }

    get totalElevation() {
        return this._getComputedProperty('totalElevation');
    }

    get totalUp() {
        return this._getComputedProperty('totalUp');
    }

    get totalDown() {
        return this._getComputedProperty('totalDown');
    }

    get cumulDuration() {
        return this._getComputedProperty('cumulDuration');
    }

    get cumulDistance() {
        return this._getComputedProperty('cumulDistance');
    }

    get cumulElevation() {
        return this._getComputedProperty('cumulElevation');
    }

    split(splitRule) {
        var that = this;
        var distances = this.cumulDistance;
        var times = this.cumulDuration;
        var elevations = this.cumulElevation;
        var remainderD = 0;
        var remainderT = 0;
        var remainderE = 0;

        function getNextIdx(type, property, idx, val) {
            var measures, remainder;
            if (type === 'joker' && val === '*') return distances.length - 1;
            if (property === 'cumulDistance') {
                val = converter.convert(val, that._lengthUnit);
                measures = distances;
                remainder = remainderD;
            } else if (property === 'cumulDuration') {
                val = converter.convert(val, that._timeUnit);
                measures = times;
                remainder = remainderT;
            } else if (property === 'cumulElevation') {
                val = converter.convert(val, that._lengthUnit);
                measures = elevations;
                remainder = remainderE;
            }
            var i = idx;
            var comp = val - remainder;

            while (i < measures.length - 1) {
                if (comp <= measures[i] - measures[idx]) {
                    var f = (measures[i] - measures[i - 1]) / (measures[i] - measures[idx] - val + remainder);
                    if (property === 'cumulDistance') {
                        remainderD = distances[i] - distances[idx] - val + remainder;
                        remainderT = (times[i] - times[i - 1]) / f;
                        remainderE = (elevations[i] - elevations[i - 1]) / f;
                    } else if (property === 'cumulDuration') {
                        remainderT = times[i] - times[idx] - val + remainder;
                        remainderD = (distances[i] - distances[i - 1]) / f;
                        remainderE = (elevations[i] - elevations[i - 1]) / f;
                    } else {
                        remainderE = elevations[i] - elevations[idx] - val + remainder;
                        remainderT = (times[i] - times[i - 1]) / f;
                        remainderD = (distances[i] - distances[i - 1]) / f;
                    }
                    break;
                }
                i++;
            }
            return i;
        }

        function getNextAutoIdx(route, thresholds, from) {
            var to = route.segments.length - 1;
            var property = thresholds[0].property;
            var unitProperty = '_' + thresholds[0].type + 'Unit';
            // convert thresholds to matching units
            for (var i = 0; i < thresholds.length; i++) {
                thresholds[i].value = converter.convert(thresholds[i].value, route[unitProperty]);
            }
            var condition = getAutoCondition(thresholds.map(t => t.value), route[property][from]);
            ++from;
            while (condition(route[property][from]) && from <= to) {
                ++from;
            }
            return from;
        }

        var serie = parseRule(splitRule);
        var parts = [];

        var idx = 0, from;
        for (var i = 0; i < serie.length; i++) {
            from = idx;
            idx = getNextIdx(serie[i].type, serie[i].property, idx, serie[i].value);
            parts.push({from, to: idx});
        }

        var split = new Array(parts.length);
        for (var i = 0; i < parts.length; i++) {
            split[i] = Route.fromSegments(this.segments.slice(parts[i].from, parts[i].to), {
                timeUnit: that._timeUnit,
                distanceUnit: that._lengthUnit
            });

            if (serie[i].thresholds) {
                var fromTo = [];
                from = 0;
                while (from < split[i].cumulDistance.length - 1) {
                    var thresholds = serie[i].thresholds.slice().map(obj => Object.assign({}, obj));
                    var f = from;
                    from = getNextAutoIdx(split[i], thresholds, from);
                    fromTo.push({from: f, to: from});
                }
                var subsplit = new Array(fromTo.length);
                for (var j = 0; j < fromTo.length; j++) {
                    subsplit[j] = Route.fromSegments(split[i].segments.slice(fromTo[j].from, fromTo[j].to));
                }
                split[i] = subsplit;
            }
        }


        return flatten(split);
    }

    setUnits(distanceUnit, timeUnit) {
        var hasChanged = false, distanceUnitChanged = false, timeUnitChanged = false;
        if (distanceUnit && distanceUnit !== this._lengthUnit) {
            hasChanged = true;
            distanceUnitChanged = true;
        }
        if (timeUnit && this._timeUnit !== timeUnit) {
            hasChanged = true;
            timeUnitChanged = true;
        }
        if (!hasChanged) return;
        if (distanceUnitChanged) {
            for (var i = 0; i < this.segments.length; i++) {
                this.segments[i].distance = converter.convert(this.segments[i].distance + this._lengthUnit, distanceUnit);
                this.segments[i].elevation = converter.convert(this.segments[i].elevation + this._lengthUnit, distanceUnit);
            }
            this._lengthUnit = distanceUnit;
        }
        if (timeUnitChanged) {
            for (i = 0; i < this.segments.length; i++) {
                this.segments[i].duration = converter.convert(this.segments[i].duration + this._timeUnit, timeUnit);
            }
            this._timeUnit = timeUnit;
        }

        this._speedUnit = this._lengthUnit + '/' + this._timeUnit;
        this._paceUnit = this._timeUnit + '/' + this._lengthUnit;
        if (hasChanged && this._computeCalled) {
            this._compute();
        }

    }

    _compute() {
        this._computeCalled = true;
        this._cumulDistance = new Array(this.segments.length);
        this._cumulDuration = new Array(this.segments.length);
        this._cumulElevation = new Array(this.segments.length);
        this._totalDistance = 0;
        this._totalDuration = 0;
        this._totalElevation = 0;
        this._totalUp = 0;
        this._totalDown = 0;
        this._meanSpeed = 0;
        this._speed = new Array(this.segments.length);
        this._elevationSpeed = new Array(this.segments.length);
        var cumSpeed = 0;

        for (var i = 0; i < this.segments.length; i++) {
            var segment = this.segments[i];
            this._speed[i] = segment.distance / segment.duration;
            this._elevationSpeed[i] = segment.elevation / segment.duration;
            this._totalDuration += segment.duration;
            this._totalDistance += segment.distance;
            this._totalElevation += segment.elevation;
            if(segment.elevation > 0) {
                this._totalUp += segment.elevation;
            } else {
                this._totalDown += segment.elevation;
            }
            this._cumulDuration [i] = this._totalDuration;
            this._cumulDistance[i] = this._totalDistance;
            this._cumulElevation[i] = this._totalElevation;
            cumSpeed += this._speed[i];
        }

        this._meanSpeed = cumSpeed / this.segments.length;
        this._meanPace = 1 / this._meanSpeed;
        this._cumulDistance.unshift(0);
        this._cumulDuration.unshift(0);
        this._cumulElevation.unshift(0);
        if(this._SG) {
            this._speed = SG(this._speed, 1, this._SG);
            this._elevationSpeed = SG(this._elevationSpeed, 1, this._SG);
        }
    }

    static fromGpx(gpx, options) {
        var gpxHelper = new GpxHelper(gpx);
        return gpxHelper.compute(0,0).then(segments => {
            return Route.fromSegments(segments, options);
        });
    }

    static fromSegments(segments, options) {
        return new Route(segments, options);
    }

    static fromRule(rule) {
        throw new Error('not yet implemented');
    }
}

function getAutoCondition(thresholds, value) {
    thresholds = thresholds.slice();
    thresholds.unshift(Number.MIN_SAFE_INTEGER);
    thresholds.push(Number.MAX_SAFE_INTEGER);
    for (var i = 0; i < thresholds.length - 1; i++) {
        if (value > thresholds[i] && value <= thresholds[i + 1]) {
            return function (val) {
                return val > thresholds[i] && val <= thresholds[i + 1];
            };
        }
    }
}

function flatten(arr) {
    var res = [];
    for (var i = 0; i < arr.length; i++) {
        if (Array.isArray(arr[i])) {
            for (var j = 0; j < arr[i].length; j++) {
                res.push(arr[i][j]);
            }
        } else {
            res.push(arr[i]);
        }
    }
    return res;
}

module.exports = Route;