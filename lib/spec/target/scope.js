const LogicItem = require('./logic-item');
const K8sItem = require('./k8s-item');

class Scope
{
    constructor(owner)
    {
        this._owner = owner;
        this._chain = [];
    }

    descendent(kind)
    {
        return this._add(new LogicItem(kind, 'descendent'));
    }

    child(kind)
    {
        return this._add(new LogicItem(kind, 'child'));
    }

    resource(kind, apiGroup)
    {
        return this._add(new K8sItem(kind, apiGroup));
    }

    _add(value)
    {
        this._chain.push(value);
        return value;
    }

    debugOutput(indent)
    {
        for(var child of this._chain)
        {
            child.debugOutput(indent);
        }
    }

}

module.exports = Scope;