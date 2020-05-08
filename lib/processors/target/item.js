const DnUtils = require('kubevious-helpers').DnUtils;

class TargetItem
{
    constructor(dn, state)
    {
        this._dn = dn;
        this._state = state;
    }

    get parent()
    {
        var parentDn = DnUtils.parentDn(this._dn);
        if (!parentDn) {
            return null;
        }
        return new TargetItem(parentDn, this._state);
    }

    get config() {
        return this.getProperties('config');
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

module.exports = TargetItem;