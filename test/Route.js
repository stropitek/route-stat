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
        elevation: 0
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
        route.cumulDistance.should.deepEqual([0,10,15]);
        route.cumulDuration.should.deepEqual([0,5,8]);
        route.cumulElevation.should.deepEqual([0,0,1]);
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
        route.cumulDistance.should.deepEqual([0,10,15]);
        route.cumulDuration.should.deepEqual([0,5,8]);
        route.cumulElevation.should.deepEqual([0,0,1]);
        route.totalDistance.should.equal(15);
        route.totalDuration.should.equal(8);
        route.totalElevation.should.equal(1);
    });
});

describe('route-stat split', function () {
    it('split rule with single element', function () {
        var route = Route.fromSegments(segments);
        var split = route.split('10km');
        split.should.have.length(1);
        split[0].segments[0].should.eql(segments[0]);
    });

    it('split rule with single element and end joker', function () {
        var route = Route.fromSegments(segments);
        var split = route.split('10km+*');
        split.should.have.length(2);
        split.map(s => s.segments.length).should.eql([1,1]);
        split.map(s => s.segments[0]).should.eql(segments);
    });

    it('split rule with 2 elements', function () {
        var route = Route.fromSegments(segments);
        var split = route.split('10km+5km');
        split.should.have.length(2);
        split.map(s => s.segments.length).should.eql([1,1]);
        split.map(s => s.segments[0]).should.eql(segments);
    });

    it('split rule is greedy, each part will always have one element', function () {
        var route = Route.fromSegments(segments);
        var split = route.split('10km+3km');
        split.should.have.length(2);
        split.map(s => s.segments.length).should.eql([1,1]);
    });

    it('split rule with remainder', function () {
        var route = Route.fromSegments(segmentsRemainder);
        var split = route.split('8km+10km+3km');
        split.should.have.length(3);
        split.map(s => s.segments.length).should.eql([1,2,1]);
        split = route.split('8km+11.1km+3km');
        split.should.have.length(3);
        split.map(s => s.segments.length).should.eql([1,3,0]);
    });
});