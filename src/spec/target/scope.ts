import { LogicItem } from './logic-item'
import { LogicLocationType } from './types'

export class Scope {
    public _chain: (LogicItem)[]
    private _owner: any

    constructor(owner: any) {
        this._owner = owner
        this._chain = []
    }

    descendant(kind: string) {
        return this._add(new LogicItem(kind, LogicLocationType.descendant))
    }

    child(kind: string) {
        return this._add(new LogicItem(kind, LogicLocationType.child))
    }

    _add(value: LogicItem) {
        this._chain.push(value)
        return value
    }

    debugOutput(indent?: number) {
        for (let child of this._chain) {
            child.debugOutput(indent)
        }
    }
}
