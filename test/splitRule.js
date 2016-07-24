'use strict';
const parseRule = require('../src/parseRule');
describe('Parse rule: units', function () {
    // Parser returns duration in hours and distance in km
    it('meters', function () {
        parseRule('5m').should.deepEqual([
            {type: 'distance', unit: 'meter', value: 5}
        ]);

        parseRule('5.067m').should.deepEqual([
            {type: 'distance', unit: 'meter', value: 5.067}
        ]);
    });

    it('kilometers', function () {
        parseRule('1km').should.deepEqual([
            {type: 'distance', unit: 'kilometer', value: 1}
        ]);
        parseRule('1.005km').should.deepEqual([
            {type: 'distance', unit: 'kilometer', value: 1.005}
        ]);
    });
    
    it('seconds', function () {
        parseRule('2sec').should.deepEqual([
            {type: 'duration', unit: 'second', value: 2}
        ]);
        
        parseRule('2.4s').should.deepEqual([
            {type: 'duration', unit: 'second', value: 2.4}
        ]);
    });

    it('minutes', function () {
        parseRule('1min').should.deepEqual([
            {type: 'duration', unit: 'minute', value: 1}
        ]);

        parseRule('1.5min').should.deepEqual([
            {type: 'duration', unit: 'minute', value: 1.5}
        ]);
    });

    it('hours', function () {
        parseRule('1h').should.deepEqual([
            {type: 'duration', unit: 'hour', value: 1}
        ]);
        parseRule('.05h').should.deepEqual([
            {type: 'duration', unit: 'hour', value: 0.05}
        ]);
    });

    it('no value means 1', function () {
        parseRule('min').should.deepEqual([
            {type: 'duration', unit: 'minute', value: 1}
        ]);
    });

    it('joker', function () {
        parseRule('*').should.deepEqual([
            {type: 'joker', value: '*'}
        ]);
    });
});

describe('Parse rule: concatenation', function () {
    it('+ should concatenate', function () {
        parseRule('1min+1km').should.deepEqual([
            {type: 'duration', unit: 'minute', value: 1},
            {type: 'distance', unit: 'kilometer', value: 1}
        ]);
    });
});

describe('Parse rule: repetition', function () {
    it('single element repetition', function () {
        parseRule('[3sec, 3]').should.deepEqual([
            {type: 'duration', unit: 'second', value: 3},
            {type: 'duration', unit: 'second', value: 3},
            {type: 'duration', unit: 'second', value: 3}
        ]);
    });

    it('multiple element repetition', function () {
        parseRule('[1.3min,1km,0.2h, 2]').should.deepEqual([
            {type: 'duration', unit: 'minute', value: 1.3},
            {type: 'distance', unit: 'kilometer', value: 1},
            {type: 'duration', unit: 'hour', value: 0.2},
            {type: 'duration', unit: 'minute', value: 1.3},
            {type: 'distance', unit: 'kilometer', value: 1},
            {type: 'duration', unit: 'hour', value: 0.2}
        ]);
    });
});

describe('Parse rule: valid usage of joker', function () {
    it('just the joker', function () {
        parseRule('*').should.deepEqual([
            {type: 'joker', value: '*'}
        ]);
    });

    it('joker at the beginning', function () {
        parseRule('*+min+km').should.deepEqual([
            {type: 'joker', value: '*'},
            {type: 'duration', unit: 'minute', value: 1},
            {type: 'distance', unit: 'kilometer', value: 1}
        ]);
    });

    it('joker at the end', function () {
         parseRule('m+min+*').should.deepEqual([
             {type: 'distance', unit: 'meter', value: 1},
             {type: 'duration', unit: 'minute', value: 1},
             {type: 'joker', value: '*'}
         ]);
    });
});

describe('Parse rule: errors', function () {
    it('no units', function () {
        (function () {
            parseRule('1');
        }).should.throw(/Invalid expression/);
    });

    it('invalid unit', function () {
        (function () {
            parseRule('12aaa');
        }).should.throw(/Invalid expression/);
    });

    it('invalid repetition', function () {
        (function () {
            parseRule('[1min, 1km');
        }).should.throw(/Invalid expression/);
    });

    it('joker not at the end or the beginning', function () {
        (function() {
            parseRule('1min+*+200m');
        }).should.throw(/Invalid joker usage/);
    });

    it('joker appears multiple times', function () {
        (function() {
            parseRule('*+1min+*');
        }).should.throw(/Invalid joker usage/);
    });
});

