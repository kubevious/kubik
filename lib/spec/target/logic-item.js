
class LogicItem
{
    constructor(kind, location)
    {
        this._kind = kind;
        this._location = location;

        const Scope = require('./scope');
        this._scope = new Scope(this);

        this._nameFilters = [];
        this._labelFilters = [];
        this._customFilters = [];
    }

    filter(value)
    {
        this._customFilters.push(value);
        return this;
    }

    name(value)
    {
        this._nameFilters.push(value);
        return this;
    }

    label(key, value)
    {
        return this.labels({ key, value });
    }

    labels(value)
    {
        this._labelFilters.push(value);
        return this;
    }

    descendent(kind)
    {
        return this._scope.descendent(kind);
    }

    child(kind)
    {
        return this._scope.child(kind);
    }

    resource(kind, apiGroup)
    {
        return this._scope.resource(kind, apiGroup);
    }
}

module.exports = LogicItem;