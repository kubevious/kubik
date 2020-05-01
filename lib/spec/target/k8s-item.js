class K8sItem
{
    constructor(kind, apiGroup)
    {
        this._kind = kind;
        this._apiGroup = apiGroup;

        const Scope = require('./scope');
        this._scope = new Scope(this);

        this._namespaceFilters = [];
        this._nameFilters = [];
        this._labelFilters = [];
    }

    namespace(value)
    {
        this._namespaceFilters.push(value);
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

    resource(kind, apiGroup)
    {
        return this._scope.resource(kind, apiGroup);
    }
}

module.exports = K8sItem;