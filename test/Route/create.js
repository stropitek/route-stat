'use strict';
const Route = require('../..');

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

var segmentsRemainder = [
    {
        distance: 10,
        duration: 5,
        elevation: 0
    },
    {
        distance: 5,
        duration: 3,
        elevation: 1
    },
    {
        distance: 4,
        duration: 2,
        elevation: 3
    },
    {
        distance: 3,
        duration: 1,
        elevation: 2
    }
];
var route;

describe('create routes and set their units', function () {
    beforeEach(function () {
        route = Route.fromSegments(segments);
    });
    it('get all computed properties', function () {
        route._timeUnit.should.equal('h');
        route._lengthUnit.should.equal('km');
        route._speedUnit.should.equal('km/h');
        route._paceUnit.should.equal('h/km');
        route.distance.should.deepEqual([10,5]);
        route.duration.should.deepEqual([5,3]);
        route.elevation.should.deepEqual([0,1]);
        route.speed.should.deepEqual([2, 5/3]);
        route.meanSpeed.should.equal((2+5/3)/2);
        route.meanPace.should.equal(1 / ((2+5/3)/2));
        route.cumulDistance.should.deepEqual([0,10,15]);
        route.cumulDuration.should.deepEqual([0,5,8]);
        route.cumulElevation.should.deepEqual([0,0,1]);
        route.totalDistance.should.equal(15);
        route.totalDuration.should.equal(8);
        route.totalElevation.should.equal(1);
    });

    it('changes units', function () {
        route.setUnits('m', 's');
        route._timeUnit.should.equal('s');
        route._lengthUnit.should.equal('m');
        route._speedUnit.should.equal('m/s');
        route._paceUnit.should.equal('s/m');
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
        route.meanPace.should.equal(1 / ((2+5/3)/2));
        route.cumulDistance.should.deepEqual([0,10,15]);
        route.cumulDuration.should.deepEqual([0,5,8]);
        route.cumulElevation.should.deepEqual([0,0,1]);
        route.totalDistance.should.equal(15);
        route.totalDuration.should.equal(8);
        route.totalElevation.should.equal(1);
    });

    it('create Route from route array (join)', function () {
        var route = Route.fromRoutes([Route.fromSegments(segments), Route.fromSegments(segmentsRemainder)]);
        route.segments.should.deepEqual(segments.concat(segmentsRemainder));
    });
});