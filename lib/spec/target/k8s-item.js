const DebugUtils = require('../utils/debug');

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
        this._customFilters = [];
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

    filter(value)
    {
        this._customFilters.push(value);
        return this;
    }

    resource(kind, apiGroup)
    {
        return this._scope.resource(kind, apiGroup);
    }

    debugOutput(indent)
    {
        if (!indent) {
            indent = 0;
        }
        var header = "  ".repeat(indent);

        var id = this._kind;
        if (this._apiGroup) {
            id = id + ':' + this._apiGroup;
        }
        console.log(header + '* K8sItem ' + id)

        if (this._namespaceFilters.length > 0) {
            for(var filter of this._namespaceFilters)
            {
                console.log(header + '    - Namespace: ' + DebugUtils.stringify(filter));

            }
        }
        if (this._nameFilters.length > 0) {
            for(var filter of this._nameFilters)
            {
                console.log(header + '    - Name: ' + DebugUtils.stringify(filter));

            }
        }
        if (this._labelFilters.length > 0) {
            for(var filter of this._labelFilters)
            {
                console.log(header + '    - Label: ' + DebugUtils.stringify(filter));

            }
        }
        if (this._customFilters.length > 0) {
            for(var filter of this._customFilters)
            {
                console.log(header + '    - CustomFilter: ' + DebugUtils.stringify(filter));

            }
        }

        this._scope.debugOutput(indent + 1);
    }
}

module.exports = K8sItem;