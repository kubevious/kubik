const Lodash = require('the-lodash');
const _ = Lodash.default;
const {Promise} = require('the-promise');
const Compiler = require('../compiler');
const Scope = require('../../spec/target/scope');
const Evaluator = require('./evaluator');
const NameHelpers = require('../name-helpers');
const ScriptItem = require('../script-item');

class TargetProcessor
{
    constructor(src)
    {
        this._src = src;
        this._scope = new Scope(null);
        this._errorMessages = [];
        this._executorNodes = [];
        this._state = null;
    }

    get scope() {
        return this._scope;
    }

    prepare()
    {
        this._errorMessages = [];
        var result = {
            success: false,
            messages: this._errorMessages
        };

        return this._loadModule()
            .then(runnable => runnable.run())
            .then(() => {
                this._validate();
                result.success = (result.messages.length == 0);
            })
            .catch(reason => {
                result.success = false;
                this._addError(reason.message);
            })
            .then(() => result)
            ;
    }

    execute(state)
    {
        this._errorMessages = [];
        var result = {
            success: false,
            items: [],
            messages: this._errorMessages
        };

        this._state = state;
        this._executorNodes = [];
        this._acceptChainItems([null], this._scope);
        this._finalItems = {};

        return Promise.resolve()
            .then(() => this._executorNodeR())
            .then(() => {
                result.items = _.values(this._finalItems);
                result.success = (result.messages.length == 0);
            })
            .catch(reason => {
                result.success = false;
                this._addError(reason.message);
            })
            .then(() => result)
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
                return _.keys(result).map(x => new ScriptItem(x, this._state));
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
        var filters = [
            () => this._filterLogicItemByName(targetSelector, prev, item),
            () => this._filterLogicItemByLabel(targetSelector, prev, item),
            () => this._filterLogicItemByAnnotation(targetSelector, prev, item),
            () => this._filterLogicItemByCustomFilter(targetSelector, prev, item)
        ]

        var isMatched = true;
        return Promise.serial(filters, filter => {
            if (!isMatched) {
                return;
            }
            return filter()
                .then(result => {
                    if (!result) {
                        isMatched = false;
                    }
                })
        })
        .then(() => isMatched);
    }

    _filterLogicItemByName(targetSelector, prev, item)
    {
        var evaluator = new Evaluator(this._state, 
            targetSelector, 
            prev, 
            item, 
            targetSelector._nameFilters);
        return evaluator.doesAnyMatch(value => {
            if (item.name != value) {
                return false;
            }
            return true;
        })
    }

    _filterLogicItemByLabel(targetSelector, prev, item)
    {
        var evaluator = new Evaluator(this._state, 
            targetSelector, 
            prev, 
            item, 
            targetSelector._labelFilters);
        return evaluator.doesAnyMatch(dict => {
            for(var key of _.keys(dict))
            {
                if (item.labels[key] != dict[key]) {
                    return false;
                }
            }
            return true;
        })
    }

    _filterLogicItemByAnnotation(targetSelector, prev, item)
    {
        var evaluator = new Evaluator(this._state, 
            targetSelector, 
            prev, 
            item, 
            targetSelector._annotationFilters);
        return evaluator.doesAnyMatch(dict => {
            for(var key of _.keys(dict))
            {
                if (item.annotations[key] != dict[key]) {
                    return false;
                }
            }
            return true;
        })
    }


    _filterLogicItemByCustomFilter(targetSelector, prev, item)
    {
        var evaluator = new Evaluator(this._state, 
            targetSelector, 
            prev, 
            item, 
            targetSelector._customFilters);
        return evaluator.doesAnyMatch();
    }

    _executeLogicItem(targetSelector, prev)
    {
        var mappedKind = NameHelpers.mapLogicItemName(targetSelector._kind);

        // console.log("[_executeLogicItem] :: " + targetSelector._kind + "(" + mappedKind + ") :: " + targetSelector._location);

        if (targetSelector._location == 'descendant')
        {
            if (prev)
            {
                var result = this._state.scopeByKind(prev._dn, mappedKind);
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
                return this._state.childrenByKind(prev._dn, mappedKind);
            }
        }
    }


    _acceptFinalItems(items)
    {
        // console.log("[_acceptFinalItems] :: count: " + items.length);
        // console.log(items);
        for(var item of items)
        {
            this._finalItems[item._dn] = {
                dn: item._dn,
                kind: 'logic'
            };
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
            this._addError("No target specified.");
            return;
        }

        this._validateScope(this._scope);
    }

    _validateScope(scope)
    {
        if (this._scope._chain.length > 1) {
            this._addError("Fanout targets are not supported.");
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

    _addError(msg)
    {
        this._errorMessages.push(msg);
    }

}

module.exports = TargetProcessor;