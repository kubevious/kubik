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
        return node.node
    }

    get name() {
        var node = this.node
        if (!node) {
            return null
        }
        return node.name
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

    children(kind: string) {
        kind = mapLogicItemName(kind)
        var children = this._state.childrenByKind(this._dn, kind)
        children = _.keys(children)
        return children.map((x: string) => new ScriptItem(x, this._state))
    }

    hasChildren(kind: string) {
        kind = mapLogicItemName(kind)
        var children = this._state.childrenByKind(this._dn, kind)
        children = _.keys(children)
        return children.length > 0
    }

    descendants(kind: string) {
        kind = mapLogicItemName(kind)
        var descendants = this._state.scopeByKind(this._dn, kind)
        descendants = _.keys(descendants)
        return descendants.map((x: string) => new ScriptItem(x, this._state))
    }

    hasDescendants(kind: string) {
        kind = mapLogicItemName(kind)
        var descendants = this._state.scopeByKind(this._dn, kind)
        return _.keys(descendants).length > 0
    }

    getProperties(name: string) {
        var propsGroup = this._state.getProperties(this._dn)
        if (!propsGroup) {
            return {}
        }
        var props = propsGroup[name]
        if (!props) {
            return {}
        }
        if (!props.config) {
            return {}
        }
        return props.config
    }
}
