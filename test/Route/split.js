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

    it('split rules elevation', function () {
        var route = Route.fromSegments(segmentsRemainder);
        var split = route.split('1km@elevation+2km@elevation');
        split.should.have.length(2);
        split.map(s => s.segments.length).should.eql([2,1]);
        split = route.split('1km@elevation+*');
        split.should.have.length(2);
        split.map(s => s.segments.length).should.eql([2,2]);
        split = route.split('0.5km@elevation+2km@elevation+*');
        split.should.have.length(3);
        split.map(s => s.segments.length).should.eql([2,1,1]);
    });

    it('split rule duration', function () {
        var route = Route.fromSegments(segmentsRemainder);
        var split = route.split('1h+6h');
        split.should.have.length(2);
        split.map(s => s.segments.length).should.eql([1,1]);
    });

    it('split rule mixed', function () {
        var route = Route.fromSegments(segmentsRemainder);
        var split = route.split('5km+4h+0.51km@elevation');
        split.should.have.length(3);
        split.map(s => s.segments.length).should.eql([1,1,1]);
    });

    it('threshold split rule (speed)', function () {
        var route = Route.fromSegments(segmentsRemainder);
        var split = route.split('*{speed,1.99km/h}');
        split.should.have.length(3);
        split.map(s => s.segments.length).should.eql([1,1,2]);
    });

    it('threshold split rule (elevation speed)', function () {
        var route = Route.fromSegments(segmentsRemainder);
        var split = route.split('*{elevationSpeed,1.99km/h}');
        split.should.have.length(2);
        split.map(s => s.segments.length).should.eql([3,1]);
    });

    it('threshold split rule (pace)', function () {
        var route = Route.fromSegments(segmentsRemainder);
        var split = route.split('*{pace,0.51h/km}');
        split.should.have.length(3);
        split.map(s => s.segments.length).should.eql([1,1,2]);
    });
});