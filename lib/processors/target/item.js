class TargetItem
{
    constructor(item, state)
    {
        this._dn = item.dn;
        this._node = item.node;
        this._state = state;
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