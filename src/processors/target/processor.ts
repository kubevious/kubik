import _ from 'the-lodash'
import { Promise } from 'the-promise'
import { Compiler } from '../compiler'
import { Scope } from '../../spec/target/scope'
import { Evaluator } from './evaluator'
import { ScriptItem } from '../script-item'
import { LogicItem } from '../../spec/target/logic-item'
import { RegistryState, RegistryStateNode } from '@kubevious/state-registry'
import { KeyValueDict, LogicLocationType } from '../../spec/target/types'
import { makeRootScope } from '../../spec/target/root'
import { parentDn } from '@kubevious/entity-meta'
import { mapLogicItemName } from '../name-helpers'

export interface FinalItems {
    [prop: string]: string
}

export interface TargetResult {
    success: boolean
    messages: string[]
    items: FinalItems[]
}

export interface ExecutorNode {
    prevs: ScriptItem[]
    targetSelector: LogicItem
}

export class TargetProcessor {
    private _state: RegistryState | null
    private _src: string
    private _errorMessages: string[]
    private _executorNodes: ExecutorNode[]
    private _scope: Scope
    private _finalItems?: {
        [key: string]: {
            dn: string
            kind: string
        }
    }

    constructor(src: string) {
        this._src = src
        this._scope = new Scope(null)
        this._errorMessages = []
        this._executorNodes = []
        this._state = null
    }

    get scope() {
        return this._scope
    }

    prepare() {
        this._errorMessages = []
        let result = {
            success: false,
            messages: this._errorMessages,
        }

        return this._loadModule()
            .then((runnable) => runnable.run())
            .then(() => {
                this._validate()
                result.success = result.messages.length == 0
            })
            .catch((reason) => {
                result.success = false
                this._addError(reason.message)
            })
            .then(() => result)
    }

    execute(state: RegistryState): Promise<any> {
        this._errorMessages = []
        let result: TargetResult = {
            success: false,
            items: [],
            messages: this._errorMessages,
        }

        this._state = state
        this._executorNodes = []
        this._acceptChainItems([null], this._scope)
        this._finalItems = {}

        return Promise.resolve()
            .then(() => this._executorNodeR())
            .then(() => {
                result.items = _.values(this._finalItems)
                result.success = result.messages.length == 0
                return result
            })
            .catch((reason) => {
                result.success = false
                this._addError(reason.message)
            })
    }

    private _executorNodeR(): any {
        if (this._executorNodes.length == 0) {
            return
        }

        let executorNode = _.head(this._executorNodes)
        this._executorNodes.splice(0, 1)

        return Promise.resolve()
            .then(() => this._executorNode(executorNode!))
            .then(() => this._executorNodeR())
    }

    private _executorNode(executorNode: ExecutorNode) {
        return Promise.serial(executorNode.prevs, (x) => {
            return Promise.resolve(
                this._executeTargetSelector(executorNode.targetSelector, x)
            )
                .then((items) =>
                    this._filterItems(executorNode.targetSelector, x, items)
                )
                .then((items) => {
                    if (!items) {
                        return
                    }
                    if (!items.length) {
                        return
                    }
                    if (executorNode.targetSelector._scope._chain.length == 0) {
                        this._acceptFinalItems(items as ScriptItem[])
                    } else {
                        this._acceptChainItems(
                            items,
                            executorNode.targetSelector._scope
                        )
                    }
                })
        })
    }

    private _executeTargetSelector(targetSelector: LogicItem, prev: ScriptItem)
    {
        // console.log("[_executeTargetSelector] :: " + item.constructor.name);

        return Promise.resolve()
            .then(() => {
                if (targetSelector.constructor.name == 'LogicItem') {
                    return this._executeLogicItem(targetSelector, prev)
                }
            })
            .then((result) => {
                // console.log(result);
                if (!result) {
                    return []
                }
                return result.map(
                    (x) => new ScriptItem(x, this._state!)
                )
            })
    }

    private _filterItems(
        targetSelector: LogicItem,
        prev: ScriptItem,
        items: ScriptItem[]
    ) {
        return Promise.resolve()
            .then(() => {
                if (targetSelector.constructor.name == 'LogicItem') {
                    return Promise.serial(items, (item) => {
                        return this._filterLogicItem(
                            targetSelector,
                            prev,
                            item
                        ).then((shouldInclude) => {
                            if (shouldInclude) {
                                return item
                            }
                            return null
                        })
                    })
                } 
                return [];
            })
            .then((newItems) => newItems!.filter((x) => x))
    }

    private _filterLogicItem(
        targetSelector: LogicItem,
        prev: ScriptItem,
        item: ScriptItem
    ) {
        let filters = [
            () => this._filterLogicItemByName(targetSelector, prev, item),
            () => this._filterLogicItemByLabel(targetSelector, prev, item),
            () => this._filterLogicItemByAnnotation(targetSelector, prev, item),
            () =>
                this._filterLogicItemByCustomFilter(targetSelector, prev, item),
        ]

        let isMatched = true
        return Promise.serial(filters, (filter) => {
            if (!isMatched) {
                return
            }
            return filter().then((result) => {
                if (!result) {
                    isMatched = false
                }
            })
        }).then(() => isMatched)
    }

    private _filterLogicItemByName(
        targetSelector: LogicItem,
        prev: ScriptItem,
        item: ScriptItem
    ) {
        let evaluator = new Evaluator<string>(
            this._state!,
            targetSelector,
            prev,
            item,
            targetSelector._nameFilters
        )
        return evaluator.doesAnyMatch((value) => {
            if (item.name != value) {
                return false
            }
            return true
        })
    }

    private _filterLogicItemByLabel(
        targetSelector: LogicItem,
        prev: ScriptItem,
        item: ScriptItem
    ) {
        let evaluator = new Evaluator<KeyValueDict>(
            this._state!,
            targetSelector,
            prev,
            item,
            targetSelector._labelFilters
        )
        return evaluator.doesAnyMatch((dict) => {
            for (let key of _.keys(dict)) {
                if (item.labels[key] != dict[key]) {
                    return false
                }
            }
            return true
        })
    }

    private _filterLogicItemByAnnotation(
        targetSelector: LogicItem,
        prev: ScriptItem,
        item: ScriptItem
    ) {
        let evaluator = new Evaluator<KeyValueDict>(
            this._state!,
            targetSelector,
            prev,
            item,
            targetSelector._annotationFilters
        )
        return evaluator.doesAnyMatch((dict) => {
            for (let key of _.keys(dict)) {
                if (item.annotations[key] != dict[key]) {
                    return false
                }
            }
            return true
        })
    }

    private _filterLogicItemByCustomFilter(
        targetSelector: LogicItem,
        prev: ScriptItem,
        item: ScriptItem
    ) {
        let evaluator = new Evaluator<boolean>(
            this._state!,
            targetSelector,
            prev,
            item,
            targetSelector._customFilters
        )
        return evaluator.doesAnyMatch(x => x)
    }

    private _executeLogicItem(targetSelector: LogicItem, prev: ScriptItem) : string[] | undefined
    {
        // console.log("[_executeLogicItem] :: " + targetSelector._kind + "(" + mappedKind + ") :: " + targetSelector._location);

        switch(targetSelector._location)
        {
            case LogicLocationType.descendant:
                {
                    if (prev) {
                        const results = prev.descendants(targetSelector._params.kind!);
                        return results.map(x => x._dn);
                    } else {
                        const kindType = mapLogicItemName(targetSelector._params.kind!);
                        const results = this._state!.findByKind(kindType);
                        return _.keys(results);
                    }
                }
                break;

            case LogicLocationType.child:
                {
                    if (prev) {
                        const results = prev.children(targetSelector._params.kind!);
                        return results.map(x => x._dn);
                    }
                }
                break;

            case LogicLocationType.parent:
                {
                    if (prev) {
                        const parent = prev.parent;
                        if (parent) {
                            if (targetSelector._params.kind) {
                                const kindType = mapLogicItemName(targetSelector._params.kind!);
                                if (parent.kind !== kindType) {
                                    return [];
                                }
                            }

                            return [parent._dn];
                        }
                    }
                }
                break;


            case LogicLocationType.link:
                {
                    if (prev) {
                        const results = prev.links(targetSelector._params.link);
                        return results.map(x => x._dn);
                    }
                }
                break;
        }
    }

    private _acceptFinalItems(items: ScriptItem[]) {
        // console.log("[_acceptFinalItems] :: count: " + items.length);
        // console.log(items);
        for (let item of items!) {
            this._finalItems![item._dn] = {
                dn: item._dn,
                kind: 'logic',
            }
        }
    }

    private _acceptChainItems(items: (ScriptItem | null)[], scope: Scope) {
        // console.log("[_acceptChainItems] :: count: " + items.length);

        for (let x of scope._chain) {
            this._executorNodes.push({
                prevs: items as ScriptItem[],
                targetSelector: x as LogicItem,
            })
        }
    }

    private _loadModule() {
        return Promise.resolve().then(() => {
            let rootScope = makeRootScope(this._scope);

            let compiler = new Compiler(
                this._src,
                'RULE_TARGET',
                rootScope
            )
            return compiler.compile()
        })
    }

    _validate() {
        if (this._scope._chain.length == 0) {
            this._addError('No target specified.')
            return
        }

        this._validateScope(this._scope)
    }

    private _validateScope(scope: Scope) {
        if (this._scope._chain.length > 1) {
            this._addError('Fanout targets are not supported.')
            return
        }

        for (let targetSelector of scope._chain) {
            this._validateTargetSelector(targetSelector)
        }
    }

    private _validateTargetSelector(targetSelector: LogicItem) {
        this._validateScope(targetSelector._scope)
    }

    private _addError(msg: string) {
        this._errorMessages.push(msg)
    }
}
