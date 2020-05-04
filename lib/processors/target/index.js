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
            return Promise.resolve(this._executeTargetSelector(executorNode.targetSelector, x))
                .then(items => this._filterItems(executorNode.targetSelector, x, items))
                .then(items => {
                    // console.log(items);
                    if (!items) {
                        return;
                    }
                    if (!items.length) {
                        return;
                    }
                    if (executorNode.targetSelector._scope._chain.length == 0)
                    {
                        this._acceptFinalItems(items);
                    }
                    else
                    {
                        this._acceptChainItems(items, executorNode.targetSelector._scope);
                    }
                })
        })
    }

    _executeTargetSelector(targetSelector, prev)
    {
        // console.log("[_executeTargetSelector] :: " + item.constructor.name);

        return Promise.resolve()
            .then(() => {
                if (targetSelector.constructor.name == 'LogicItem') {
                    return this._executeLogicItem(targetSelector, prev)
                } else if (targetSelector.constructor.name == 'K8sItem') {
        
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

    _filterItems(targetSelector, prev, items)
    {
        return Promise.resolve()
            .then(() => {
                if (targetSelector.constructor.name == 'LogicItem') {
                    return Promise.serial(items, item => {
                        return this._filterLogicItem(targetSelector, prev, item)
                            .then(shouldInclude => {
                                if (shouldInclude) {
                                    return item;
                                } 
                                return null;
                            })
                    });
                } else if (targetSelector.constructor.name == 'K8sItem') {
                    return items;
                } 
            })
            .then(newItems => newItems.filter(x => x));
    }

    _filterLogicItem(targetSelector, prev, item)
    {
        return Promise.resolve()
            .then(() => this._filterLogicItemByName(targetSelector, prev, item))
            .then(shouldAdd => {
                if (!shouldAdd) {
                    return false;
                }
                return true;
            })
            ;
    }

    _filterLogicItemByName(targetSelector, prev, item)
    {
        return this._doesAnyMatch(targetSelector, prev, targetSelector._nameFilters, 
            (value) => {
                if (item.node.name == value) {
                    return true;
                }
                return false;
            });
    }

    _doesAnyMatch(targetSelector, prev, matchers, cb)
    {
        if (matchers.length == 0) {
            return true;
        }
        return this._tryNextAnyMatcher(targetSelector, prev, matchers, cb, 0);
    }

    _tryNextAnyMatcher(targetSelector, prev, matchers, cb, index)
    {
        if (index >= matchers.length) {
            return false;
        }
        var matcher = matchers[index];
        
        return this._resolveMatcherValue(matcher, prev)
            .then(matcherValue => {
                return cb(matcherValue);
            })
            .then(didMatch => {
                if (didMatch) {
                    return true;
                }
                return this._tryNextAnyMatcher(targetSelector, prev, matchers, cb, index + 1);
            })
    }

    _resolveMatcherValue(matcher, prev)
    {
        if (_.isFunction(matcher))
        {
            return Promise.resolve(() => matcher(prev));
        }
        else
        {
            return Promise.resolve(matcher);
        }
    }

    _executeLogicItem(targetSelector, prev)
    {
        var mappedKind = this._mapLogicItemName(targetSelector._kind);

        // console.log("[_executeLogicItem] :: " + targetSelector._kind + "(" + mappedKind + ") :: " + targetSelector._location);

        if (targetSelector._location == 'descendant')
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
        else if (targetSelector._location == 'child')
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
            this._executorNodes.push({ prevs: items, targetSelector: x });
        }
    }

    _loadModule()
    {
        return Promise.resolve()
            .then(() => {
                var compilerValues = {
                    select: (kind) => {
                        return this._scope.descendant(kind);
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

        for(var targetSelector of scope._chain)
        {
            this._validateTargetSelector(targetSelector);
        }
    }

    _validateTargetSelector(targetSelector)
    {
        this._validateScope(targetSelector._scope);
    }

}

module.exports = TargetProcessor;