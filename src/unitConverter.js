'use strict';
const expressionReg =/^([\d\.]*)(.+)$/;

const dimensions = ['length', 'time'];

const base = {
    length: {
        name: 'length',
        dimension: [1, 0]
    },
    time: {
        name: 'time',
        dimension: [0, 1]
    },
    speed: {
        name: 'speed',
        dimension: [1, -1]
    },
    pace: {
        name: 'pace',
        dimension: [-1, 1]
    }
};

const baseMap = {};
Object.keys(base).forEach(function(b) {
    baseMap[base[b].dimension.toString()] = base[b];
});

const prefixes = {
    none: {
        '': {value: 1}
    },
    short: {
        '': {value: 1},
        da: {value: 1e1},
        h: {value: 1e2},
        k: {value: 1e3}
    }
};

const units= {
    s: {
        base: base.time,
        value: 1,
        prefixes: prefixes.none
    },
    min: {
        base: base.time,
        value: 60,
        prefixes: prefixes.none
    },
    h: {
        base: base.time,
        value: 3600,
        prefixes: prefixes.none
    },
    m: {
        base: base.length,
        value: 1,
        prefixes: prefixes.short
    }
};
// const units = [
//     {type: 'distance', name: 'meter', alias: ['m', 'meters'], value: 1},
//     {type: 'distance', name: 'kilometer', alias: ['km', 'kilometers'], value: 1000},
//     {type: 'duration', name: 'second', alias: ['seconds', 's', 'sec'], value: 1},
//     {type: 'duration', name: 'minute', alias: ['min', 'minutes'], value: 60},
//     {type: 'duration', name: 'hour', alias: ['h', 'hours'], value: 3600}
// ];
// var unitMap = {};
//
// (function () {
//     var names = units.map(unit => unit.name);
//     for(var i=0; i<names.length; i++) {
//         if(unitMap[names[i]]) throw new Error('Units\' names are not unique');
//         unitMap[names[i]] = units[i];
//         if(units[i].alias) {
//             for(var j=0; j<units[i].alias.length; j++) {
//                 if(unitMap[units[i].alias[j]]) throw new Error('Units\' names are not unique');
//                 unitMap[units[i].alias[j]] = units[i];
//             }
//         }
//     }
// })();

function getType(expression) {
    var parsed = parse(expression);
    return parsed.type;

}

function toVal(unit) {
    unit = unit.trim();
    var result = null;
    var keys = Object.keys(units);
    for (var i = 0; i < keys.length; i++) {
        var u = keys[i];
        if(unit.endsWith(u)) {
            result = {};
            result.dimension = units[keys[i]].base.dimension;
            result.value = units[keys[i]].value;
            if(u.length === unit.length) {
                break;
            }
            var prefix = units[keys[i]].prefixes[unit.substr(0, unit.length - u.length)];
            if(prefix) {
                result.value *= prefix.value;
                break;
            }
            throw new Error('Invalid prefix');
        }
    }
    if(result === null) {
        throw new Error('Invalid unit');
    }
    return result;
}

function parse(expression) {
    expression = expression.trim();
    var m = expressionReg.exec(expression);
    if(!m) {
        throw new Error('Invalid expression');
    }
    var units = m[2].split('.');
    for (var i = 0; i < units.length; i++) {
        var unit = units[i];
        units[i] = units[i].split('/');
    }
    var mul = units.map(val => val[0]);
    var div = [];
    units.forEach(val => {
        div = div.concat(val.slice(1));
    });

    div = div.filter(d => d);
    mul = mul.filter(m => m);


    div = div.map(toVal);
    mul = mul.map(toVal);

    var dim = {
        dimension: [0, 0],
        value: 1
    };

    for(var i=0; i<div.length; i++) {
        dim = add(dim, neg(div[i]));
    }
    for(var i=0; i<mul.length; i++) {
        dim = add(dim, mul[i]);
    }
    var base = baseMap[dim.dimension.toString()];
    if(!base) throw new Error('Invalid unit');

    if(!m[1]) m[1] = 1;

    return {
        type: base.name,
        dimension: dim.dimension,
        value: dim.value * (+m[1])
    };
}

function add(obj1, obj2) {
    var r = Object.assign({}, obj1);
    r.dimension = obj1.dimension.slice();
    for(var i=0; i<r.dimension.length; i++) {
        r.dimension[i] += obj2.dimension[i];
    }
    r.value = r.value * obj2.value;
    return r;
}

function neg(obj) {
    var r = Object.assign({}, obj);
    r.dimension = obj.dimension.slice();
    for(var i=0; i<r.dimension.length; i++) {
        r.dimension[i] = -obj.dimension[i];
    }
    r.value = 1 / obj.value;
    return r;
}

function convert(source, target) {
    var s = parse(source);
    var t = parse(target);

    return s.value / t.value;
}

function check(expression) {
    try {
        parse(expression);
    } catch(e) {
        return false;
    }
    return true;
}

module.exports = {convert, getType, parse, check};