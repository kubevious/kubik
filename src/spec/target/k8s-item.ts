import { stringify } from '../utils/debug'
import { Scope } from './scope'

export interface FilterItem {
    [name: string]: string
}

export class K8sItem {
    public _kind: string
    public _scope: Scope
    public _namespaceFilters: (string | FilterItem | Function)[]
    public _nameFilters: (string | FilterItem | Function)[]
    public _labelFilters: (string | FilterItem | Function)[]
    public _customFilters: (string | FilterItem | Function)[]
    public _apiGroup: string

    constructor(kind: string, apiGroup: string) {
        this._kind = kind
        this._apiGroup = apiGroup

        this._scope = new Scope(this)

        this._namespaceFilters = []
        this._nameFilters = []
        this._labelFilters = []
        this._customFilters = []
    }

    namespace(value: string) {
        this._namespaceFilters.push(value)
        return this
    }

    name(value: string) {
        this._nameFilters.push(value)
        return this
    }

    label(key: string, value: string) {
        return this.labels({ key, value })
    }

    labels(value: string | { [name: string]: string }) {
        this._labelFilters.push(value)
        return this
    }

    filter(value: string) {
        this._customFilters.push(value)
        return this
    }

    resource(kind: string, apiGroup: string) {
        return this._scope.resource(kind, apiGroup)
    }

    debugOutput(indent: number) {
        if (!indent) {
            indent = 0
        }
        var header = '  '.repeat(indent)

        var id = this._kind
        if (this._apiGroup) {
            id = id + ':' + this._apiGroup
        }
        console.log(header + '* K8sItem ' + id)

        if (this._namespaceFilters.length > 0) {
            for (var filter of this._namespaceFilters) {
                console.log(header + '    - Namespace: ' + stringify(filter))
            }
        }
        if (this._nameFilters.length > 0) {
            for (var filter of this._nameFilters) {
                console.log(header + '    - Name: ' + stringify(filter))
            }
        }
        if (this._labelFilters.length > 0) {
            for (var filter of this._labelFilters) {
                console.log(header + '    - Label: ' + stringify(filter))
            }
        }
        if (this._customFilters.length > 0) {
            for (var filter of this._customFilters) {
                console.log(header + '    - CustomFilter: ' + stringify(filter))
            }
        }

        this._scope.debugOutput(indent + 1)
    }
}
