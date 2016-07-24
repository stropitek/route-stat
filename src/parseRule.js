'use strict';

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
    var m = /^([\d\.]*)(s|min|h|sec|m|km|\*)$/.exec(element);
    if(!m) {
        throw new Error('Invalid expression');
    }

    if(!m[1]) m[1] = 1;
    var r = {};
    switch(m[2]) {
        case 'min': case 's': case 'h': case 'sec':
            r.type = 'duration';
            break;
        case 'm': case'km':
            r.type = 'distance';
            break;
        case '*':
            r.type = 'joker';
            break;
        default:
            throw new Error('Unreachable, please write an issue on github :-(');
    }

    switch(m[2]) {
        case 's': case 'sec':
            r.value = +m[1];
            r.unit = 'second';
            break;
        case 'km':
            r.value = +m[1];
            r.unit = 'kilometer';
            break;
        case 'min':
            r.value = +m[1];
            r.unit = 'minute';
            break;
        case 'h':
            r.value = +m[1];
            r.unit = 'hour';
            break;
        case 'm':
            r.value = +m[1];
            r.unit = 'meter';
            break;
        case '*':
            r.value = '*';
            break;
        default:
            throw new Error('Unreachable, please write an issue on github :-(');
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