'use strict';

var gpxParse = require('gpx-parse');

class GpxHelper {
    constructor(gpx) {
        this._init = new Promise((resolve, reject) => {
            gpxParse.parseGpx(gpx, (err, data) => {
                if (err) return reject(err);
                this.gpx = data;
                if (this.gpx.tracks.length > 1) {
                    console.warn('This gpx has more than 1 track');
                }
                if (this.gpx.tracks.some(function (track) {
                        return track.segments.length > 1
                    })) {
                    console.warn('Some of the tracks have more than 1 segment');
                }
                resolve(data);
            });
        })
    }

    compute(trackIndex, segmentIndex) {
        return this._init.then(() => {
            return getSegmentData(this.gpx.tracks[trackIndex].segments[segmentIndex]);
        });
    }

    getTime(trackIndex, segmentIndex) {
        return this._init.then(() => {
            return getProp(this.gpx, 'time', trackIndex, segmentIndex);
        });
    }

    getElevation(trackIndex, segmentIndex) {
        return this._init.then(() => {
            return getProp(this.gpx, 'elevation', trackIndex, segmentIndex);
        });
    }

    getTracks() {
        return this._init.then(() => this.gpx.tracks);
    }

    countWaypoints(trackIndex, segmentIndex) {
        return this._init.then(() => {
            if (trackIndex != undefined && segmentIndex != undefined) {
                return this.gpx.tracks[trackIndex].segments[segmentIndex].length;
            } else {
                var size = new Array(this.gpx.tracks.length);
                for (var i = 0; i < size.length; i++) {
                    size[i] = [];
                    for (var j = 0; j < this.gpx.tracks[i].segments.length; j++) {
                        size[i][j] = this.gpx.tracks[i].segments[j].length;
                    }
                }
                return size;
            }

        });
    }

    getSegments(trackIndex) {
        return this._init.then(() => {
            return this.gpx.tracks[trackIndex].segments;
        });
    }
}


module.exports = GpxHelper;

function getProp(gpx, prop, trackIndex, segmentIndex) {
    return gpx.tracks[trackIndex].segments[segmentIndex].map(wayPoint => {
        return wayPoint[prop];
    });
}


function degToRad(deg) {
    return deg * 2 * Math.PI / 360;
}

function convert(long, lat) {
    var alt = 6371 * 1000;
    var x = alt * Math.cos(lat) * Math.sin(long);
    var y = alt * Math.sin(lat);
    var z = alt * Math.cos(lat) * Math.cos(long);
    return {
        x: x,
        y: y,
        z: z
    }
}

function speedToPace(speed) {
    var min = 60 / speed | 0;
    var s = (60 / speed - min) * 60;
    return min + ' min, ' + (s.toFixed(0) + 's');
}

// Return properties for each segment between successive waypoints
function getSegmentData(wayPoints) {
    var segments = new Array(wayPoints.length - 1);
    for (var j = 0; j < segments.length; j++) {
        segments[j] = {};
        var latJ0 = wayPoints[j].lat;
        var lonJ0 = wayPoints[j].lon;
        var latJ1 = wayPoints[j + 1].lat;
        var lonJ1 = wayPoints[j + 1].lon;
        var cart0 = convert(degToRad(lonJ0), degToRad(latJ0));
        var cart1 = convert(degToRad(lonJ1), degToRad(latJ1));
        var t0 = new Date(wayPoints[j].time).getTime() / 1000 / 3600;
        var t1 = new Date(wayPoints[j + 1].time).getTime() / 1000 / 3600;
        segments[j].duration = t1 - t0;
        segments[j].distance = dist(cart1, cart0) / 1000; // Distance in km
        segments[j].elevation = (wayPoints[j + 1].elevation - wayPoints[j].elevation) / 1000;
    }
    return segments;
}

function dist(p1, p2) {
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    var dz = p2.z - p1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}