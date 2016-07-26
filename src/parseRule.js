'use strict';

const converter = require('./unitConverter');
const constant = require('./constant');

function parseRule(rule) {
    rule = rule.trim();
    var r = [];
    var arr = rule.split('+');
    for(var i=0; i<arr.length; i++) {
        if(arr[i][0] === '[') {
            r = r.concat(expandRule(arr[i]));
        } else {
            r = r.concat(parseElement(arr[i]));
        }
    }

    var jokers = r.map((value, index) => {
        return {
            index,value
        };
    }).filter(val => {
        return val.value.type === 'joker';
    });

    if(jokers.length > 1) {
        throw new Error('Invalid joker usage. Jokers can only appear once');
    } else if(jokers.length === 1 && jokers[0].index !== 0 && jokers[0].index !== r.length-1) {
        throw new Error('Invalid joker usage. Jokers must appear at the beginning or at the end of the split rule');
    }
    return r;
}


function parseElement(element) {
    var m = /^([^\{]+)(\{(.*)\})?$/.exec(element);
    if(!m) {
        throw new Error('Invalid expression');
    }
    if(m[1] === '*') {
        var r = {
            type: 'joker',
            value: '*'
        };
    } else {
        r = {
            type: converter.getType(m[1]),
            value: m[1]
        };
        if(r.type !== 'time' && r.type !== 'length') throw new Error('Invalid type');
    }
    if(m[3]) {
        var thresholds = m[3].split(',').map(s => s.trim());
        if(thresholds.length < 2) throw new Error('Invalid threshold rule');
        var property = thresholds[0];
        console.log(property);
        thresholds.splice(0,1);
        var expectedType = constant.properties[property];
        if(!expectedType) throw new Error('Unexpected threshold property');
        for(var i=0; i<thresholds.length; i++) {
            console.log(thresholds[i]);
            thresholds[i] = {
                type: converter.getType(thresholds[i]),
                value: thresholds[i]
            };

            if(thresholds[i].type !== expectedType) {
                throw new Error('Unexpected type in thresholds');
            }
        }
        r.thresholds = {
            property,
            stops: thresholds
        };
    }
    return r;
}

function expandRule(serie) {
    var r = [];
    if(serie[serie.length-1] !== ']') {
        throw new Error('Invalid expression');
    }
    serie = serie.substr(1, serie.length -2);
    serie = serie.split(',');
    if(serie.length && serie[0] === 'auto') {
        return expandAutoRule(serie);
    }
    var rep = +serie[serie.length - 1];
    for(var i=0; i<rep; i++) {
        for(var j=0; j<serie.length -1; j++) {
            r.push(parseElement(serie[j]));
        }
    }
    return r;
}

function expandAutoRule(serie) {
    var el = parseElement(serie[serie.length - 1]);
    el.auto = true;
    el.thresholds = [];
    for(var i=1; i<serie.length -1; i++) {
        el.thresholds.push(+serie[i]);
    }
    return el;
}

module.exports = parseRule;