'use strict';
const parseRule = require('../src/parseRule');
describe('Parse rule: units', function () {
    // Parser returns duration in hours and distance in km
    it('meters', function () {
        parseRule('5m').should.deepEqual([
            {type: 'length', value: '5m', property: 'cumulDistance'}
        ]);

        parseRule('5.067m').should.deepEqual([
            {type: 'length', value: '5.067m', property: 'cumulDistance'}
        ]);

        parseRule('3m@distance').should.deepEqual([
            {type: 'length', value: '3m', property: 'cumulDistance'}
        ]);
    });

    it('meters of elevation', function () {
        parseRule('4m@elevation').should.deepEqual([
            {type: 'length', value: '4m', property: 'cumulElevation'}
        ]);
    });

    it('kilometers', function () {
        parseRule('1km').should.deepEqual([
            {type: 'length', value: '1km', property: 'cumulDistance'}
        ]);
        parseRule('1.005km').should.deepEqual([
            {type: 'length', value: '1.005km', property: 'cumulDistance'}
        ]);
    });

    it('seconds', function () {
        parseRule('2s').should.deepEqual([
            {type: 'time', value: '2s', property: 'cumulDuration'}
        ]);

        parseRule('2.4s').should.deepEqual([
            {type: 'time', value: '2.4s', property: 'cumulDuration'}
        ]);

        parseRule('2.4s@duration').should.deepEqual([
            {type: 'time', value: '2.4s', property: 'cumulDuration'}
        ]);
    });

    it('minutes', function () {
        parseRule('1min').should.deepEqual([
            {type: 'time', value: '1min', property: 'cumulDuration'}
        ]);

        parseRule('1.5min').should.deepEqual([
            {type: 'time', value: '1.5min', property: 'cumulDuration'}
        ]);
    });

    it('hours', function () {
        parseRule('1h').should.deepEqual([
            {type: 'time', value: '1h', property: 'cumulDuration'}
        ]);
        parseRule('.05h').should.deepEqual([
            {type: 'time', value: '.05h', property: 'cumulDuration'}
        ]);
    });

    it('no value means 1', function () {
        parseRule('min').should.deepEqual([
            {type: 'time', value: 'min', property: 'cumulDuration'}
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
            {type: 'time', value: '1min', property: 'cumulDuration'},
            {type: 'length', value: '1km', property: 'cumulDistance'}
        ]);
    });
});

describe('Parse rule: repetition', function () {
    it('single element repetition', function () {
        parseRule('[3s, 3]').should.deepEqual([
            {type: 'time', value: '3s', property: 'cumulDuration'},
            {type: 'time', value: '3s', property: 'cumulDuration'},
            {type: 'time', value: '3s', property: 'cumulDuration'}
        ]);
    });

    it('multiple element repetition', function () {
        parseRule('[1.3min,1km,0.2h, 2]').should.deepEqual([
            {type: 'time', value: '1.3min', property: 'cumulDuration'},
            {type: 'length', value: '1km', property: 'cumulDistance'},
            {type: 'time', value: '0.2h', property: 'cumulDuration'},
            {type: 'time', value: '1.3min', property: 'cumulDuration'},
            {type: 'length', value: '1km', property: 'cumulDistance'},
            {type: 'time', value: '0.2h', property: 'cumulDuration'}
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
            {type: 'length', value: 'm', property: 'cumulDistance'},
            {type: 'time', value: 'min', property: 'cumulDuration'},
            {type: 'joker', value: '*'}
        ]);
    });
});

describe('threshold based split rules', function () {
    it('threshold based rule (cumulDistance)', function () {
        parseRule('*{speed, 5km/h, 10km/h}').should.deepEqual([
            {
                type: 'joker',
                value: '*',
                thresholds: [
                    {type: 'speed', value: '5km/h', property: 'speed'},
                    {type: 'speed', value: '10km/h', property: 'speed'}
                ]
            }
        ]);
    });
});

describe('Parse rule: errors', function () {
    it('invalid property', function () {
        (function () {
            parseRule('1s@distance');
        }).should.throw(/Invalid property/);

        (function () {
            parseRule('1m@duration');
        }).should.throw(/Invalid property/);

        (function () {
            parseRule('1m@noexist');
        }).should.throw(/Invalid property/);
    });

    it('invalid threshold', function () {
        (function () {
            parseRule('1m@distance{speed, 1km}');
        }).should.throw(/Invalid threshold/);

        (function () {
            parseRule('1m{noexist, 1km/h}');
        }).should.throw(/Invalid threshold/);

        (function () {
            parseRule('1m{speed}');
        }).should.throw(/Invalid threshold/);
    });
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
        (function () {
            parseRule('1min+*+200m');
        }).should.throw(/Invalid joker usage/);
    });

    it('joker appears multiple times', function () {
        (function () {
            parseRule('*+1min+*');
        }).should.throw(/Invalid joker usage/);
    });
});

