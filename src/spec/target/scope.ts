import { LogicItem } from './logic-item'
import { LogicLocationType } from './types'

export type KindType = string;

export class Scope {
    public _chain: (LogicItem)[]
    private _owner: any

    constructor(owner: any) {
        this._owner = owner
        this._chain = []
    }

    descendant(kind: KindType) {
        return this._add(new LogicItem(LogicLocationType.descendant, { kind: kind }))
    }

    child(kind: KindType) {
        return this._add(new LogicItem(LogicLocationType.child, { kind: kind }))
    }

    parent(kindOrNone?: KindType) {
        return this._add(new LogicItem(LogicLocationType.parent, { kind: kindOrNone }))
    }

    link(linkOrNone?: string) {
        return this._add(new LogicItem(LogicLocationType.link, { link: linkOrNone }))
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
