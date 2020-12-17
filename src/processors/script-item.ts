import _ from 'the-lodash'
import DnUtils from '@kubevious/helpers/dist/dn-utils'
import { RegistryState } from '@kubevious/helpers/dist/registry-state'
import { mapLogicItemName } from './name-helpers'

export class ScriptItem {
    public _dn: string
    public _state: RegistryState

    constructor(dn: string, state: RegistryState) {
        this._dn = dn
        this._state = state

        if (!this._dn) {
            throw new Error('Missing DN')
        }
        if (!this._state) {
            throw new Error('Missing RegistryState')
        }
    }

    get parent() {
        var parentDn = DnUtils.parentDn(this._dn)
        if (!parentDn) {
            return null
        }
        return new ScriptItem(parentDn, this._state)
    }

    get node() {
        var node = this._state.getNode(this._dn)
        if (!node) {
            return null
        }
        return node;
    }

    get name(){
        var node = this.node
        if (!node) {
            return null;
        }
        return node.name;
    }

    get props() {
        return this.getProperties('properties')
    }

    get config() {
        return this.getProperties('config')
    }

    get labels() {
        return this.getProperties('labels')
    }

    get annotations() {
        return this.getProperties('annotations')
    }

    children(kind: string) : ScriptItem[] {
        kind = mapLogicItemName(kind)
        let children = this._state.childrenByKind(this._dn, kind)
        let childrenDns = _.keys(children);
        return childrenDns.map((x: string) => new ScriptItem(x, this._state))
    }

    hasChildren(kind: string) : boolean {
        kind = mapLogicItemName(kind)
        let children = this._state.childrenByKind(this._dn, kind)
        let childrenDns = _.keys(children);
        return childrenDns.length > 0
    }

    descendants(kind: string) : ScriptItem[] {
        kind = mapLogicItemName(kind)
        let descendants = this._state.scopeByKind(this._dn, kind)
        let descendantDns = _.keys(descendants);
        return descendantDns.map((x: string) => new ScriptItem(x, this._state))
    }

    hasDescendants(kind: string) : boolean {
        kind = mapLogicItemName(kind)
        var descendants = this._state.scopeByKind(this._dn, kind)
        return _.keys(descendants).length > 0
    }

    getProperties(name: string) : any {
        var propsGroup = this._state.getProperties(this._dn)
        if (!propsGroup) {
            return {}
        }
        let props = propsGroup[name]
        if (!props) {
            return {}
        }
        if (!props.config) {
            return {}
        }
        return props.config;
    }
}
