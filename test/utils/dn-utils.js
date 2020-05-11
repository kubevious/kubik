const _ = require('the-lodash')
const DnUtils = require('kubevious-helpers').DnUtils;

module.exports.startsWithAnyOf = function(dn, options)
{
    for(var x of options)
    {
        if (_.startsWith(dn, x)) {
            return true;
        }
    }
    return false;
}

module.exports.endsWithAnyOf = function(dn, options)
{
    for(var x of options)
    {
        if (_.endsWith(dn, x)) {
            return true;
        }
    }
    return false;
}

module.exports.kind = function(dn)
{
    var parts = DnUtils.parseDn(dn);
    var lastPart = _.last(parts);
    if (!lastPart) {
        return null;
    }
    return lastPart.kind;
}