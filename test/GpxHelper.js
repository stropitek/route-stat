'use strict';

const fs = require('fs');
const path = require('path');
const GpxHelper = require('../src/GpxHelper.js');
const testGpx = fs.readFileSync(path.join(__dirname, 'data/test.gpx'));
describe('load gpx', function () {
    it('load gpx', function () {
        var h = new GpxHelper(testGpx);
        return h._init;
    });

    it('get sizes', function () {
        var h = new GpxHelper(testGpx);
        return h.countWaypoints().then(sizes => {
            sizes.should.deepEqual([[4]])
        });
    });

    it('get size', function () {
        var h = new GpxHelper(testGpx);
        return h.countWaypoints(0,0).then(size => {
            size.should.equal(4);
        })
    });

    it('gets the elevation', function () {
        var h = new GpxHelper(testGpx);
        return h.getElevation(0,0).then(data => {
            data.should.have.length(4);
        })
    });

    it('get computed values', function () {
        var h = new GpxHelper(testGpx);
        return h.compute(0,0).then(data => {
            data.should.have.length(3);
        })
    });

    it('get latitude', function () {
        var h = new GpxHelper(testGpx);
        return h.getLatitude(0,0).then(data => {
            data.should.have.length(4);
        });
    });

    it('get longitude', function () {
        var h = new GpxHelper(testGpx);
        return h.getLongitude(0,0).then(data => {
            data.should.have.length(4);
        });
    });
});