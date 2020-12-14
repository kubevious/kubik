const Lodash = require('the-lodash');
const _ = Lodash.default;


class UnitConverter
{
    constructor()
    {

    }

    memory(value)
    {
        var x = parseMemory(value);
        return {
            in: (unit) => {
                var y = convertMemory(x, unit);
                return y;
            }
        }
    }

    percentage(value)
    {
        return parseFloat(value);
    }
}

const MEMORY_MULTIPLIER = {
    'k': Math.pow(1000, 1),
    'kb': Math.pow(1000, 1),
    'm': Math.pow(1000, 2),
    'mb': Math.pow(1000, 2),
    'g': Math.pow(1000, 3),
    'gb': Math.pow(1000, 3),
    't': Math.pow(1000, 4),
    'tb': Math.pow(1000, 4),
    'p': Math.pow(1000, 5),
    'pb': Math.pow(1000, 5),
    'e': Math.pow(1000, 6),
    'eb': Math.pow(1000, 6),
    'ki': Math.pow(1024, 1),
    'mi': Math.pow(1024, 2),
    'gi': Math.pow(1024, 3),
    'ri': Math.pow(1024, 4),
    'pi': Math.pow(1024, 5),
    'ei': Math.pow(1024, 6),
}

function parseMemory(value) {
    value = _.toLower(value);
    var unit = value.slice(-1);
    if (unit == 'i' || unit == 'b') {
        unit = value.slice(-2);
        value = value.substring(0, value.length - 2);
    } else {
        value = value.substring(0, value.length - 1);
    }
    value = parseFloat(value);
    if (MEMORY_MULTIPLIER[unit]) {
        value = value * MEMORY_MULTIPLIER[unit];
    }
    value = Math.floor(value);
    return value;
}

function convertMemory(value, unit) {
    var unit = _.toLower(unit);
    var multiplier = MEMORY_MULTIPLIER[unit];
    if (!multiplier) {
        throw new Error('Unknown unit: '+ unit);
    }
    value = value / multiplier;
    return value;
}

module.exports = UnitConverter;