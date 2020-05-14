const _ = require('the-lodash');
const KubeviousHelpersDocs = require('kubevious-helpers').Docs;

var LOGIC_ITEM_KIND_REVERSE_MAPPINNG = {};
for(var x of _.keys(KubeviousHelpersDocs.KIND_TO_USER_MAPPING))
{
    LOGIC_ITEM_KIND_REVERSE_MAPPINNG[KubeviousHelpersDocs.KIND_TO_USER_MAPPING[x]] = x;
}

module.exports.mapLogicItemName = function(kind)
{
    var value = LOGIC_ITEM_KIND_REVERSE_MAPPINNG[kind];
    if (value) {
        return value;
    }
    return _.toLower(kind);
}