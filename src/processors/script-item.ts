import _ from 'the-lodash'
import { NodeKind, parentDn as utilsParentDn, parseDn, PropsId } from '@kubevious/entity-meta'
import { RegistryAccessor } from '@kubevious/state-registry'
import { mapLogicItemName } from './name-helpers'

export class ScriptItem {
    public _dn: string;
    private _kind : NodeKind | null;
    public _state: RegistryAccessor;

    constructor(dn: string, state: RegistryAccessor) {
        this._dn = dn
        this._state = state

        if (!this._dn) {
            throw new Error('Missing DN')
        }
        if (!this._state) {
            throw new Error('Missing RegistryAccessor')
        }

        const dnParts = parseDn(dn);
        const lastDnPart = _.last(dnParts);
        if (lastDnPart) {
            this._kind = lastDnPart.kind;
        } else {
            this._kind = null;
        }
        
    }

    get parent() : ScriptItem | null {
        let parentDn = utilsParentDn(this._dn)
        if (!parentDn) {
            return null
        }
        return new ScriptItem(parentDn, this._state)
    }

    get kind() : NodeKind | null {
        return this._kind;
    }

    get node() {
        let node = this._state.getNode(this._dn)
        if (!node) {
            return null
        }
        return node;
    }

    get name() {
        let node = this.node
        if (!node) {
            return null;
        }
        return node.name;
    }

    get props() {
        return this.getProperties(PropsId.properties)
    }

    get config() {
        return this.getProperties(PropsId.config)
    }

    get labels() {
        return this.getProperties(PropsId.labels)
    }

    get annotations() {
        return this.getProperties(PropsId.annotations)
    }

    children(kind: string) : ScriptItem[] {
        const kindType = mapLogicItemName(kind);
        const childrenDns = this._state.childrenByKind(this._dn, kindType)
        return childrenDns.map(x => new ScriptItem(x, this._state))
    }

    hasChildren(kind: string) : boolean {
        const items = this.children(kind);
        return (items.length > 0);
    }

    descendants(kind: string) : ScriptItem[] {
        const kindType = mapLogicItemName(kind);
        const descendantDns = this._state.scopeByKind(this._dn, kindType)
        return descendantDns.map(x => new ScriptItem(x, this._state))
    }

    hasDescendants(kind: string) : boolean {
        const items = this.descendants(kind);
        return (items.length > 0);
    }

    ancestors(kind: string) : ScriptItem[] {
        const kindType = mapLogicItemName(kind);

        let current = this.parent;
        const ancestors : ScriptItem[] = [];

        while(current)
        {
            if (current.kind === kindType)
            {
                ancestors.push(current);
            }
            current = current.parent;
        }

        return ancestors;
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

    getProperties(id: PropsId) : any {
        const props = this._state.getProperties(this._dn, id);
        if (!props.config) {
            return {}
        }
        return props.config;
    }
}

export type TargetLinksConfig = { [link: string] : { dn: string }[] };