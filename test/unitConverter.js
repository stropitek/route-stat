'use strict';
const converter = require('../src/unitConverter');
describe('unit parsing', function () {
    it('parse length', function () {
        converter.parse('1m').should.eql({type: 'length', dimension: [1,0], value: 1});
        converter.parse('1dam').should.eql({type: 'length', dimension: [1,0], value: 10});
        converter.parse('2km').should.eql({type: 'length', dimension: [1,0], value: 2000})
    });

    it('parse time', function () {
        converter.parse('1s').should.eql({type: 'time', dimension: [0,1], value: 1});
        converter.parse('1.5min').should.eql({type: 'time', dimension: [0,1], value: 90});
        converter.parse('1h').should.eql({type: 'time', dimension: [0,1], value: 3600});
    });

    it('parse speed', function () {
        converter.parse('3km/h').should.eql({type: 'speed', dimension: [1,-1], value: 3*1000/3600});
        converter.parse('2.3/h.km').should.eql({type: 'speed', dimension: [1,-1], value: 2.3*1000/3600});
    });

    it('parse pace', function () {
        converter.parse('3min/km').should.eql({type: 'pace', dimension: [-1,1], value: 3 * 60 / 1000});
    });
});
describe('unit conversion', function () {
    it('convert distances', function () {
        converter.convert('1.2km', 'm').should.equal(1200);
    });

    it('convert durations', function () {
        converter.convert('1h', 's').should.equal(3600);
        converter.convert('3600s', 'h').should.equal(1);
    });
});

describe('unit arithmetics', function () {
    it('divides', function () {
        converter.divide('72km/h', 2).should.equal('10m/s');
        converter.divide(1, '0.1m/s').should.equal('10s/m');
        converter.divide('10km', '100s').should.equal('100m/s');
    });
});