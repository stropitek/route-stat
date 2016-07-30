'use strict';

const converter = require('./unitConverter');
const constant = require('./constant');

function parseRule(rule) {
    rule = rule.trim();
    var r = [];
    var arr = rule.split('+');
    for (var i = 0; i < arr.length; i++) {
        if (arr[i][0] === '[') {
            r = r.concat(expandRule(arr[i]));
        } else {
            r = r.concat(parseInterval(arr[i]));
        }
    }

    var jokers = r.map((value, index) => {
        return {
            index, value
        };
    }).filter(val => {
        return val.value.type === 'joker';
    });

    if (jokers.length > 1) {
        throw new Error('Invalid joker usage. Jokers can only appear once');
    } else if (jokers.length === 1 && jokers[0].index !== r.length - 1) {
        throw new Error('Invalid joker usage. Jokers must appear at the end of the split rule');
    }
    return r;
}


function parseInterval(element) {
    var m = /^([^@\{]+)(@([^\{]*))?(\{(.*)\})?$/.exec(element);
    if (!m) {
        throw new Error('Invalid expression');
    }
    if (m[1] === '*') {
        var r = {
            type: 'joker',
            value: '*'
        };
    } else {
        r = {
            type: converter.getType(m[1]),
            value: m[1]
        };
        if (r.type !== 'time' && r.type !== 'length') throw new Error('Invalid unit type');
    }
    if (m[3] && r.type !== 'joker') {
        if (constant.validIntervalProperties.indexOf(m[3]) === -1) {
            throw new Error('Invalid property');
        }
        if(constant.properties[m[3]] !== r.type) {
            throw new Error('Invalid property');
        }
        r.property = 'cumul' + m[3].substr(0,1).toUpperCase() + m[3].substr(1);
    } else if (r.type !== 'joker') {
        r.property = constant.defaultIntervalProperties[r.type];
    }
    if (m[5]) {
        var thresholds = m[5].split(',').map(s => s.trim());

        if (thresholds.length < 2) throw new Error('Invalid threshold, at least the property name and one value expected');
        var property = thresholds[0];
        thresholds.splice(0, 1);
        if(constant.validThresholdProperties.indexOf(property) < 0) {
            throw new Error('Invalid threshold, threshold property is not valid');
        }

        if(property.match(/pace/i)) {
            property = property.replace('pace' , 'speed');
            property = property.replace('Pace', 'Speed');
            for(var i = 0; i<thresholds.length; i++) {
                thresholds[i] = converter.divide(1, thresholds[i]);
            }
        }

        var expectedType = constant.properties[property];
        for (var i = 0; i < thresholds.length; i++) {
            var type = converter.getType(thresholds[i]);
            if(type !== expectedType) {
                throw new Error('Invalid threshold, value type did not match property type');
            }
        }
        r.thresholds = thresholds.map(t => {
            return {
                property,
                type: expectedType,
                value: t
            };
        });
    }
    return r;
}

function expandRule(serie) {
    var r = [];
    if (serie[serie.length - 1] !== ']') {
        throw new Error('Invalid expression');
    }
    serie = serie.substr(1, serie.length - 2);
    serie = serie.split(',');
    if (serie.length && serie[0] === 'auto') {
        return expandAutoRule(serie);
    }
    var rep = +serie[serie.length - 1];
    for (var i = 0; i < rep; i++) {
        for (var j = 0; j < serie.length - 1; j++) {
            r.push(parseInterval(serie[j]));
        }
    }
    return r;
}

function expandAutoRule(serie) {
    var el = parseInterval(serie[serie.length - 1]);
    el.auto = true;
    el.thresholds = [];
    for (var i = 1; i < serie.length - 1; i++) {
        el.thresholds.push(+serie[i]);
    }
    return el;
}

module.exports = parseRule;