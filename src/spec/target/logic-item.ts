import { stringify } from '../utils/debug'
import { Scope, KindType } from './scope'

import { GenericFilter, GenericFilterFunc, KeyValueDict, LogicLocationType } from './types';

export class LogicItem {
    public _location: LogicLocationType
    public _params: LogicItemParams;

    public _scope: Scope = new Scope();

    public _nameFilters: GenericFilter<string>[] = [];
    public _labelFilters: GenericFilter<KeyValueDict>[] = [];
    public _annotationFilters: GenericFilter<KeyValueDict>[] = [];
    public _customFilters: GenericFilterFunc<boolean>[] = [];

    constructor(location: LogicLocationType, params: LogicItemParams) {
        this._location = location;
        this._params = params;
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

    descendant(kind: KindType) {
        return this._scope.descendant(kind)
    }

    child(kind: KindType) {
        return this._scope.child(kind)
    }

    parent(kindOrNone?: KindType) {
        return this._scope.parent(kindOrNone)
    }

    ancestor(kind: KindType) {
        return this._scope.ancestor(kind)
    }

    link(linkOrNone?: string) {
        return this._scope.link(linkOrNone)
    }

    debugOutput(indent?: number) {
        if (!indent) {
            indent = 0
        }
        let header = '  '.repeat(indent)

        console.log(header + '* LogicItem :: ' + this._location + ', Params: '  + this._params)
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

export interface LogicItemParams
{
    kind?: string | undefined;
    link?: string | undefined;
}

