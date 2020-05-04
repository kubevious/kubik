const _ = require('the-lodash')

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