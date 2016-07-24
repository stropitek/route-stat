'use strict';

class Route {
    constructor(segments) {
        this.segments = segments;
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
        if(!this._speed)
            this._compute();
        return this._speed;
    }

    get meanSpeed() {
        if(!this._meanSpeed)
            this._compute();
        return this._meanSpeed;
    }

    get meanPace() {
        if(!this._meanPace)
            this._compute();
        return this._meanPace;
    }

    get totalDuration() {
        if(!this._totalDuration) this._compute();
        return this._totalDuration;
    }

    get totalDistance() {
        if(!this._totalDistance) this._compute();
        return this._totalDistance;
    }

    get totalElevation() {
        if(!this._totalElevation) this._compute();
        return this._totalElevation;
    }

    get cumulDuration() {
        if(!this._cumulDuration) this._compute();
        return this._cumulDuration;
    }

    get cumulDistance() {
        if(!this._cumulDistance) this._compute();
        return this._cumulDistance;
    }

    get cumulElevation() {
        if(!this._cumulElevation) this._compute();
        return this._cumulElevation;
    }

    split(splitRule) {

    }

    _compute() {
        this._cumulDistance = new Array(this.segments.length);
        this._cumulDuration = new Array(this.segments.length);
        this._cumulElevation = new Array(this.segments.length);
        this._totalDistance = 0;
        this._totalDuration = 0;
        this._totalElevation = 0;
        this._meanSpeed = 0;
        this._speed = new Array(this.segments.length);
        var cumSpeed = 0;

        for(var i=0; i<this.segments.length; i++) {
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