import { LogicItem } from './logic-item'
import { LogicLocationType } from './types'
import { NodeKind } from '@kubevious/entity-meta'

export type KindType = string | NodeKind;

export class Scope {
    public _chain: (LogicItem)[]
    private _owner: any

    constructor(owner: any) {
        this._owner = owner
        this._chain = []
    }

    descendant(kind: KindType) {
        return this._add(new LogicItem(kind, LogicLocationType.descendant))
    }

    child(kind: KindType) {
        return this._add(new LogicItem(kind, LogicLocationType.child))
    }

    private _add(value: LogicItem) {
        this._chain.push(value)
        return value
    }

    debugOutput(indent?: number) {
        for (let child of this._chain) {
            child.debugOutput(indent)
        }
    }
}
