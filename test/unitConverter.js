'use strict';
const converter = require('../src/unitConverter');
describe('unit conversion', function () {
    it('convert distances', function () {
        converter.convert('1.2km', 'm').should.equal(1200);
    });

    it('convert durations', function () {
        converter.convert('1hour', 'second').should.equal(3600);
    });
});