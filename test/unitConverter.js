'use strict';
const convert = require('../src/unitConverter');
describe('unit conversion', function () {
    it('convert distances', function () {
        convert('1.2km', 'm').should.equal(1200);
    });

    it('convert durations', function () {
        convert('1hour', 'second').should.equal(3600);
    });
});