'use strict';
const parseRule = require('./parseRule');
const converter = require('./unitConverter');

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
        this._distanceUnit = options.distanceUnit || 'km';
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

    get speed() {
        if (!this._speed)
            this._compute();
        return this._speed;
    }

    get meanSpeed() {
        if (!this._meanSpeed)
            this._compute();
        return this._meanSpeed;
    }

    get meanPace() {
        if (!this._meanPace)
            this._compute();
        return this._meanPace;
    }

    get totalDuration() {
        if (!this._totalDuration) this._compute();
        return this._totalDuration;
    }

    get totalDistance() {
        if (!this._totalDistance) this._compute();
        return this._totalDistance;
    }

    get totalElevation() {
        if (!this._totalElevation) this._compute();
        return this._totalElevation;
    }

    get cumulDuration() {
        if (!this._cumulDuration) this._compute();
        return this._cumulDuration;
    }

    get cumulDistance() {
        if (!this._cumulDistance) this._compute();
        return this._cumulDistance;
    }

    get cumulElevation() {
        if (!this._cumulElevation) this._compute();
        return this._cumulElevation;
    }

    split(splitRule) {
        function getNextIdx(type, idx, val) {
            var measures, remainder;
            if (val === '*') return distances.length - 1;
            if (type === 'distance') {
                measures = distances;
                remainder = remainderD;
            }
            else {
                measures = times;
                remainder = remainderT;
            }
            var i = idx;
            var comp = val - remainder;
            var remainderD = 0;
            var remainderT = 0;
            while (i < measures.length) {
                if (comp < measures[i] - measures[idx]) {
                    var f = (measures[i] - measures[i - 1]) / (measures[i] - measures[idx] - val + remainder);
                    if (type === 'distance') {
                        remainderD = distances[i] - distances[idx] - val + remainder;
                        remainderT = (times[i] - times[i - 1]) / f;
                    } else {
                        remainderT = times[i] - times[idx] - val + remainder;
                        remainderD = (distances[i] - distances[i - 1]) / f;
                    }
                    break;
                }
                i++;
            }
            return i;
        }

        function getNextAutoIdx(thresholds, from, to) {
            var condition = getAutoCondition(thresholds, speeds[from]);
            var c = condition(smoothSpeeds[from]);
            ++from;
            while (c === condition(smoothSpeeds[from]) && from <= to) {
                ++from;
            }
            return from;
        }

        var serie = parseRule(splitRule);
        var parts = [];

        var idx = 0;

        for (var i = 0; i < serie.length; i++) {
            var from = idx;
            idx = getNextIdx(serie[i].type, idx, serie[i].value);
            parts.push({from, to: idx});
        }
    }

    setUnits(distanceUnit, timeUnit) {
        var hasChanged = false, distanceUnitChanged = false, timeUnitChanged = false;
        if (distanceUnit && distanceUnit !== this._distanceUnit) {
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
                this.segments[i].distance = converter.convert(this.segments[i].distance + this._distanceUnit, distanceUnit);
                this.segments[i].elevation = converter.convert(this.segments[i].elevation + this._distanceUnit, distanceUnit);
            }
            this._distanceUnit = distanceUnit;
        }
        if (timeUnitChanged) {
            for (i = 0; i < this.segments.length; i++) {
                this.segments[i].duration = converter.convert(this.segments[i].duration + this._timeUnit, timeUnit);
            }
            this._timeUnit = timeUnit;
        }

        if (hasChanged && this._computeCalled) {
            console.log('compute');
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
        this._meanSpeed = 0;
        this._speed = new Array(this.segments.length);
        var cumSpeed = 0;

        for (var i = 0; i < this.segments.length; i++) {
            var segment = this.segments[i];
            this._speed[i] = segment.distance / segment.duration;
            this._totalDuration += segment.duration;
            this._totalDistance += segment.distance;
            this._totalElevation += segment.elevation;
            this._cumulDuration [i] = this._totalDuration;
            this._cumulDistance[i] = this._totalDistance;
            this._cumulElevation[i] = this._totalElevation;
            cumSpeed += this._speed[i];
        }

        this._meanSpeed = cumSpeed / this.segments.length;
        this._meanPace = 60 / this._meanSpeed;

    }

    static fromGpx(gpx) {
        throw new Error('not yet implemented');
    }

    static fromSegments(segments) {
        return new Route(segments);
    }

    static fromRule(rule) {
        throw new Error('not yet implemented');
    }
}

module.exports = Route;