import { LogicItem } from './logic-item'
import { LogicLocationType } from './types'

export type KindType = string;

export type ScopeFinalizer = () => void;

export class Scope {
    public _chain: (LogicItem)[]
    private _owner: any
    private _finalizers: ScopeFinalizer[] = [];

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

    ancestor(kind: KindType) {
        return this._add(new LogicItem(LogicLocationType.ancestor, { kind: kind }))
    }

    link(linkOrNone?: string) {
        return this._add(new LogicItem(LogicLocationType.link, { link: linkOrNone }))
    }

    registerFinalizer(finalizer: ScopeFinalizer)
    {
        this._finalizers.push(finalizer);
    }

    finalize() {
        for(const finalizer of this._finalizers)
        {
            finalizer();
        }
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
