import { LogicItem, LogicItemParams } from './logic-item'
import { LogicLocationType } from './types'

export type KindType = string;

export type ScopeFinalizer = () => void;

export class Scope {
    public _chain: (LogicItem)[] = []
    private _finalizers: ScopeFinalizer[] = [];

    constructor() {
    }

    descendant(kind: KindType) : LogicItem {
        return this._add(LogicLocationType.descendant, { kind: kind })
    }

    child(kind: KindType) : LogicItem {
        return this._add(LogicLocationType.child, { kind: kind })
    }

    parent(kindOrNone?: KindType) : LogicItem {
        return this._add(LogicLocationType.parent, { kind: kindOrNone })
    }

    ancestor(kind: KindType) : LogicItem {
        return this._add(LogicLocationType.ancestor, { kind: kind })
    }

    link(linkOrNone?: string) : LogicItem {
        return this._add(LogicLocationType.link, { link: linkOrNone })
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

    protected _add(location: LogicLocationType, params: LogicItemParams) {
        const item = new LogicItem(location, params);
        return this._addToChain(item);
    }

    protected _addToChain(item: LogicItem) {
        this._chain.push(item);
        return item
    }

    debugOutput(indent?: number) {
        for (let child of this._chain) {
            child.debugOutput(indent)
        }
    }
}
