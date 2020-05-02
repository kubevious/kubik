const _ = require('the-lodash');
const Promise = require('the-promise');
const Compiler = require('../compiler');
const Scope = require('../../spec/target/scope');
const KubeviousHelpersDocs = require('kubevious-helpers').Docs;

var LOGIC_ITEM_KIND_REVERSE_MAPPINNG = {};
for(var x of _.keys(KubeviousHelpersDocs.KIND_TO_USER_MAPPING))
{
    LOGIC_ITEM_KIND_REVERSE_MAPPINNG[KubeviousHelpersDocs.KIND_TO_USER_MAPPING[x]] = x;
}

class TargetProcessor
{
    constructor(src)
    {
        this._src = src;
        this._scope = new Scope(null);
        this._compilerMessages = [];
        this._executorNodes = [];
        this._state = null;
    }

    get scope() {
        return this._scope;
    }

    prepare()
    {
        this._compilerMessages = [];
        var result = {
            success: false,
            messages: this._compilerMessages
        };

        return this._loadModule()
            .then(() => {
                this._validate();
                result.success = (result.messages.length == 0);
            })
            .catch(reason => {
                result.success = false;
                result.messages.push(reason.message);
            })
            .then(() => result)
            ;
    }

    execute(state)
    {
        this._state = state;
        this._executorNodes = [];
        this._acceptChainItems([null], this._scope);
        this._finalItems = {};

        return Promise.resolve()
            .then(() => this._executorNodeR())
            .then(() => _.values(this._finalItems))
            ;
    }

    _executorNodeR()
    {
        if (this._executorNodes.length == 0) {
            return;
        }

        var executorNode = _.head(this._executorNodes);
        this._executorNodes.splice(0, 1);

        return Promise.resolve()
            .then(() => this._executorNode(executorNode))
            .then(() => this._executorNodeR())
            ;
    }

    _executorNode(executorNode)
    {
        return Promise.serial(executorNode.prevs, x => {
            return Promise.resolve(this._executeItem(executorNode.item, x))
                .then(result => {
                    // console.log(result);
                    if (!result) {
                        return;
                    }
                    if (!result.length) {
                        return;
                    }
                    if (executorNode.item._scope._chain.length == 0)
                    {
                        this._acceptFinalItems(result);
                    }
                    else
                    {
                        this._acceptChainItems(result, executorNode.item._scope);
                    }
                })
        })
    }

    _executeItem(item, prev)
    {
        // console.log("[_executeItem] :: " + item.constructor.name);

        return Promise.resolve()
            .then(() => {
                if (item.constructor.name == 'LogicItem') {
                    return this._executeLogicItem(item, prev)
                } else if (item.constructor.name == 'K8sItem') {
        
                } 
            })
            .then(result => {
                // console.log(result);
                if (!result) {
                    return [];
                }
                return _.keys(result).map(x => ({
                    dn: x,
                    node: result[x]
                }));
            })
    }

    _executeLogicItem(item, prev)
    {
        var mappedKind = this._mapLogicItemName(item._kind);

        // console.log("[_executeLogicItem] :: " + item._kind + "(" + mappedKind + ") :: " + item._location);

        if (item._location == 'descendent')
        {
            if (prev)
            {
                var result = this._state.scopeByKind(prev.dn, mappedKind);
                return result;
            }
            else
            {
                return this._state.findByKind(mappedKind);
            }
        }
        else if (item._location == 'child')
        {
            if (prev)
            {
                return this._state.childrenByKind(prev.dn, mappedKind);
            }
        }
    }

    _mapLogicItemName(kind)
    {
        var value = LOGIC_ITEM_KIND_REVERSE_MAPPINNG[kind];
        if (value) {
            return value;
        }
        return _.toLower(kind);
    }

    _acceptFinalItems(items)
    {
        // console.log("[_acceptFinalItems] :: count: " + items.length);
        // console.log(items);
        for(var item of items)
        {
            this._finalItems[item.dn] = item;
        }
    }

    _acceptChainItems(items, scope)
    {
        // console.log("[_acceptChainItems] :: count: " + items.length);

        for(var x of scope._chain)
        {
            this._executorNodes.push({ prevs: items, item: x });
        }
    }

    _loadModule()
    {
        return Promise.resolve()
            .then(() => {
                var compilerValues = {
                    select: (kind) => {
                        return this._scope.descendent(kind);
                    },
                    resource: (kind, apiGroup) => {
                        return this._scope.resource(kind, apiGroup);
                    }
                };
        
                var compiler = new Compiler(this._src, 'RULE_TARGET', compilerValues);
                return compiler.compile();
            });
    }

    _validate()
    {
        if (this._scope._chain.length == 0) {
            this._compilerMessages.push("No target specified.");
            return;
        }

        this._validateScope(this._scope);
    }

    _validateScope(scope)
    {
        if (this._scope._chain.length > 1) {
            this._compilerMessages.push("Fanout targets are not supported.");
            return;
        }

        for(var item of scope._chain)
        {
            this._validateItem(item);
        }
    }

    _validateItem(item)
    {
        this._validateScope(item._scope);
    }

}

module.exports = TargetProcessor;