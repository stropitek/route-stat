'use strict';
const units = [
    {type: 'distance', name: 'meter', alias: ['m', 'meters'], value: 1},
    {type: 'distance', name: 'kilometer', alias: ['km', 'kilometers'], value: 1000},
    {type: 'duration', name: 'second', alias: ['seconds', 's'], value: 1},
    {type: 'duration', name: 'minute', alias: ['min', 'minutes'], value: 60},
    {type: 'duration', name: 'hour', alias: ['h', 'hours'], value: 3600}
];
var unitMap = {};

(function () {
    var names = units.map(unit => unit.name);
    for(var i=0; i<names.length; i++) {
        if(unitMap[names[i]]) throw new Error('Units\' names are not unique');
        unitMap[names[i]] = units[i];
        if(units[i].alias) {
            for(var j=0; j<units[i].alias.length; j++) {
                if(unitMap[units[i].alias[j]]) throw new Error('Units\' names are not unique');
                unitMap[units[i].alias[j]] = units[i];
            }
        }
    }
})();


function convert(source, targetUnit) {
    source = source.trim();
    targetUnit = targetUnit.trim();
    var sourceM = /^([\d\.]*)(.+)$/.exec(source);
    if(!sourceM) {
        throw new Error('Invalid source expression');
    }
    var sourceValue = sourceM[1];
    var sourceUnit = unitMap[sourceM[2]];
    targetUnit = unitMap[targetUnit];

    if(!sourceUnit) {
        throw new Error('Invalid source unit');
    }

    if(!targetUnit) throw new Error('Invalid target unit');

    if(targetUnit.type !== sourceUnit.type) {
        throw new Error('Source has wrong type');
    }

    return sourceValue * sourceUnit.value / targetUnit.value;
}

module.exports = convert;