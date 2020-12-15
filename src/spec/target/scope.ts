import { K8sItem } from './k8s-item'
import { LogicItem } from './logic-item'

export class Scope {
    public _chain: (K8sItem | LogicItem)[]
    private _owner: any

    constructor(owner: any) {
        this._owner = owner
        this._chain = []
    }

    descendant(kind: string) {
        return this._add(new LogicItem(kind, 'descendant'))
    }

    child(kind: string) {
        return this._add(new LogicItem(kind, 'child'))
    }

    resource(kind: string, apiGroup: string) {
        return this._add(new K8sItem(kind, apiGroup))
    }

    _add(value: K8sItem | LogicItem) {
        this._chain.push(value)
        return value
    }

    debugOutput(indent: number) {
        for (var child of this._chain) {
            child.debugOutput(indent)
        }
    }
}
