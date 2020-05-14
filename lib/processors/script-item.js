const DnUtils = require('kubevious-helpers').DnUtils;
const _ = require('the-lodash');
const NameHelpers = require('./name-helpers');

class ScriptItem
{
    constructor(dn, state)
    {
        this._dn = dn;
        this._state = state;

        if (!this._dn) {
            throw new Error('Missing DN');
        }
        if (!this._state) {
            throw new Error('Missing RegistryState');
        }
    }

    get parent()
    {
        var parentDn = DnUtils.parentDn(this._dn);
        if (!parentDn) {
            return null;
        }
        return new ScriptItem(parentDn, this._state);
    }

    get props() {
        return this.getProperties('properties');
    }

    get config() {
        return this.getProperties('config');
    }

    children(kind)
    {
        kind = NameHelpers.mapLogicItemName(kind);
        var children = this._state.childrenByKind(this._dn, kind);
        children = _.keys(children);
        return children.map(x => new ScriptItem(x, this._state));
    }

    hasChildren(kind)
    {
        kind = NameHelpers.mapLogicItemName(kind);
        var children = this._state.childrenByKind(this._dn, kind);
        children = _.keys(children);
        return children.length > 0;
    }

    getProperties(name)
    {
        var assets = this._state.getAssets(this._dn);
        if (!assets) {
            return {};
        }
        var props = assets.props[name];
        if (!props) {
            return {}
        }
        if (!props.config) {
            return {}
        }
        return props.config;
    }
}

module.exports = ScriptItem;