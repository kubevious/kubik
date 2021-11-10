import _ from 'the-lodash'
import { NodeKind, parentDn as utilsParentDn, getKind, PropsId } from '@kubevious/entity-meta'
import { RegistryState } from '@kubevious/state-registry'
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

    get parent() : ScriptItem | null {
        let parentDn = utilsParentDn(this._dn)
        if (!parentDn) {
            return null
        }
        return new ScriptItem(parentDn, this._state)
    }

    get kind() : NodeKind {
        return getKind(this._dn);
    }

    get node() {
        let node = this._state.getNode(this._dn)
        if (!node) {
            return null
        }
        return node;
    }

    get name(){
        let node = this.node
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
        const kindType = mapLogicItemName(kind);
        const children = this._state.childrenByKind(this._dn, kindType)
        const childrenDns = _.keys(children);
        return childrenDns.map((x: string) => new ScriptItem(x, this._state))
    }

    hasChildren(kind: string) : boolean {
        const items = this.children(kind);
        return (items.length > 0);
    }

    descendants(kind: string) : ScriptItem[] {
        const kindType = mapLogicItemName(kind);
        const descendants = this._state.scopeByKind(this._dn, kindType)
        const descendantDns = _.keys(descendants);
        return descendantDns.map((x: string) => new ScriptItem(x, this._state))
    }

    hasDescendants(kind: string) : boolean {
        const items = this.descendants(kind);
        return (items.length > 0);
    }

    links(linkOrNone?: string) : ScriptItem[] {
        const propsValue = this.getProperties(PropsId.targetLinks);
        if (propsValue)
        {
            const linksProps = <TargetLinksConfig>propsValue;
            if (linkOrNone)
            {
                const linkItems = linksProps[linkOrNone!];
                if (linkItems)
                {
                    const dns = linkItems.map((x) => x.dn);
                    return dns.map((x) => new ScriptItem(x, this._state));
                }
            }
            else
            {
                const linkItems = _.flatten(_.values(linksProps));
                const dns = linkItems.map((x) => x.dn);
                return dns.map((x) => new ScriptItem(x, this._state));
            }
        }
        return [];
    }

    hasLinks(linkOrNone?: string) : boolean {
        const items = this.links(linkOrNone);
        return (items.length > 0);
    }

    getProperties(name: string) : any {
        const propsGroup = this._state.getProperties(this._dn)
        if (!propsGroup) {
            return {}
        }
        const props = propsGroup[name]
        if (!props) {
            return {}
        }
        if (!props.config) {
            return {}
        }
        return props.config;
    }
}

export type TargetLinksConfig = { [link: string] : { dn: string }[] };