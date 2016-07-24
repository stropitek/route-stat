'use strict';
const Route = require('..');

var segments = [
    {
        distance: 10,
        duration: 5,
        elevation: 0
    },
    {
        distance: 5,
        duration: 3,
        elevation: 1
    }
];
var route;

describe('route-stat from segments basic tests', function () {
    beforeEach(function () {
         route = Route.fromSegments(segments);
    });
    it('get all computed properties', function () {
        route.distance.should.deepEqual([10,5]);
        route.duration.should.deepEqual([5,3]);
        route.elevation.should.deepEqual([0,1]);
        route.speed.should.deepEqual([2, 5/3]);
        route.meanSpeed.should.equal((2+5/3)/2);
        route.meanPace.should.equal(60 / ((2+5/3)/2));
        route.cumulDistance.should.deepEqual([10,15]);
        route.cumulDuration.should.deepEqual([5,8]);
        route.cumulElevation.should.deepEqual([0,1]);
        route.totalDistance.should.equal(15);
        route.totalDuration.should.equal(8);
        route.totalElevation.should.equal(1);
    });

    it('changes units', function () {
        route.setUnits('m', 's');
        route.segments.should.deepEqual([
            {distance: 10000, duration: 5*3600, elevation: 0},
            {distance: 5000, duration: 3 * 3600, elevation: 1000}
        ]);
    });

    it('change units after computation', function () {
        route.setUnits('m', 's');
        // trigger computation with getter
        var x = route.speed;
        route.setUnits('km', 'h');
        route.segments.should.deepEqual(segments);
        route.distance.should.deepEqual([10,5]);
        route.duration.should.deepEqual([5,3]);
        route.elevation.should.deepEqual([0,1]);
        route.speed.should.deepEqual([2, 5/3]);
        route.meanSpeed.should.equal((2+5/3)/2);
        route.meanPace.should.equal(60 / ((2+5/3)/2));
        route.cumulDistance.should.deepEqual([10,15]);
        route.cumulDuration.should.deepEqual([5,8]);
        route.cumulElevation.should.deepEqual([0,1]);
        route.totalDistance.should.equal(15);
        route.totalDuration.should.equal(8);
        route.totalElevation.should.equal(1);
    });
});