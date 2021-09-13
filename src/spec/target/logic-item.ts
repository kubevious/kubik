import { ScriptItem } from '../../processors/script-item'
import { stringify } from '../utils/debug'
import { Scope } from './scope'

import { GenericFilter, GenericFilterFunc, KeyValueDict } from './types';

export class LogicItem {
    public _kind: string
    public _scope: Scope
    public _nameFilters: GenericFilter<string>[]
    public _labelFilters: GenericFilter<KeyValueDict>[]
    public _annotationFilters: GenericFilter<KeyValueDict>[]
    public _customFilters: GenericFilterFunc<boolean>[]
    public _location: string

    constructor(kind: string, location: string) {
        this._kind = kind
        this._location = location

        this._scope = new Scope(this)

        this._nameFilters = []
        this._labelFilters = []
        this._annotationFilters = []
        this._customFilters = []
    }

    name(value: string) {
        this._nameFilters.push(value)
        return this
    }

    label(key: string, value: string) {
        let filter: KeyValueDict = {};
        filter[key] = value;
        return this.labels(filter)
    }

    labels(value: KeyValueDict) {
        this._labelFilters.push(value)
        return this
    }

    annotation(key: string, value: string) {
        let filter: KeyValueDict = {}
        filter[key] = value
        return this.annotations(filter)
    }

    annotations(value: KeyValueDict) {
        this._annotationFilters.push(value)
        return this
    }

    filter(value: GenericFilterFunc<boolean>) {
        this._customFilters.push(value)
        return this
    }

    descendant(kind: string) {
        return this._scope.descendant(kind)
    }

    child(kind: string) {
        return this._scope.child(kind)
    }

    resource(kind: string, apiGroup: string) {
        return this._scope.resource(kind, apiGroup)
    }

    debugOutput(indent?: number) {
        if (!indent) {
            indent = 0
        }
        let header = '  '.repeat(indent)

        console.log(header + '* LogicItem ' + this._kind)
        if (this._nameFilters.length > 0) {
            for (let filter of this._nameFilters) {
                console.log(header + '    - Name: ' + stringify(filter))
            }
        }
        if (this._labelFilters.length > 0) {
            for (let filter of this._labelFilters) {
                console.log(header + '    - Label: ' + stringify(filter))
            }
        }
        if (this._annotationFilters.length > 0) {
            for (let filter of this._annotationFilters) {
                console.log(header + '    - Annotation: ' + stringify(filter))
            }
        }
        if (this._customFilters.length > 0) {
            for (let filter of this._customFilters) {
                console.log(header + '    - CustomFilter: ' + stringify(filter))
            }
        }

        this._scope.debugOutput(indent + 1)
    }
}
