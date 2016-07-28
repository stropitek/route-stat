'use strict';
const parseRule = require('../src/parseRule');
describe('Parse rule: units', function () {
    // Parser returns duration in hours and distance in km
    it('meters', function () {
        parseRule('5m').should.deepEqual([
            {type: 'length', value: '5m'}
        ]);

        parseRule('5.067m').should.deepEqual([
            {type: 'length', value: '5.067m'}
        ]);
    });

    it('kilometers', function () {
        parseRule('1km').should.deepEqual([
            {type: 'length',  value: '1km'}
        ]);
        parseRule('1.005km').should.deepEqual([
            {type: 'length', value: '1.005km'}
        ]);
    });
    
    it('seconds', function () {
        parseRule('2s').should.deepEqual([
            {type: 'time', value: '2s'}
        ]);

        parseRule('2.4s').should.deepEqual([
            {type: 'time', value: '2.4s'}
        ]);
    });

    it('minutes', function () {
        parseRule('1min').should.deepEqual([
            {type: 'time', value: '1min'}
        ]);

        parseRule('1.5min').should.deepEqual([
            {type: 'time',  value: '1.5min'}
        ]);
    });

    it('hours', function () {
        parseRule('1h').should.deepEqual([
            {type: 'time', value: '1h'}
        ]);
        parseRule('.05h').should.deepEqual([
            {type: 'time', value: '.05h'}
        ]);
    });

    it('no value means 1', function () {
        parseRule('min').should.deepEqual([
            {type: 'time', value: 'min'}
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
            {type: 'time', value: '1min'},
            {type: 'length', value: '1km'}
        ]);
    });
});

describe('Parse rule: repetition', function () {
    it('single element repetition', function () {
        parseRule('[3s, 3]').should.deepEqual([
            {type: 'time', value: '3s'},
            {type: 'time', value: '3s'},
            {type: 'time', value: '3s'}
        ]);
    });

    it('multiple element repetition', function () {
        parseRule('[1.3min,1km,0.2h, 2]').should.deepEqual([
            {type: 'time', value: '1.3min'},
            {type: 'length',  value: '1km'},
            {type: 'time', value: '0.2h'},
            {type: 'time', value: '1.3min'},
            {type: 'length',  value: '1km'},
            {type: 'time', value: '0.2h'}
        ]);
    });
});

describe('Parse rule: valid usage of joker', function () {
    it('just the joker', function () {
        parseRule('*').should.deepEqual([
            {type: 'joker', value: '*'}
        ]);
    });

    it('joker at the end', function () {
         parseRule('m+min+*').should.deepEqual([
             {type: 'length', value: 'm'},
             {type: 'time', value: 'min'},
             {type: 'joker', value: '*'}
         ]);
    });
});

describe('threshold based split rules', function () {
    it('threshold based rule', function () {
        parseRule('*{cumulDistance, 5km, 10km}').should.deepEqual([
            {
                type: 'joker',
                value: '*',
                thresholds: {
                    property: 'cumulDistance',
                    stops: [
                        {type: 'length', value: '5km'},
                        {type: 'length', value: '10km'}
                    ]
                }}
        ]);
    });
});

describe('Parse rule: errors', function () {
    it('no units', function () {
        (function () {
            parseRule('1');
        }).should.throw(/Invalid unit/);
    });

    it('invalid unit', function () {
        (function () {
            parseRule('12aaa');
        }).should.throw(/Invalid unit/);
    });

    it('invalid unit type', function () {
        (function () {
            parseRule('12km/h');
        }).should.throw(/Invalid unit type/);
    });

    it('invalid repetition', function () {
        (function () {
            parseRule('[1min, 1km');
        }).should.throw(/Invalid expression/);
    });

    it('joker at the beginning', function () {
        (function () {
            parseRule('*+min+km');
        }).should.throw(/Invalid joker usage/);
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

