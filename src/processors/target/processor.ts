import _ from 'the-lodash'
import { Promise } from 'the-promise'
import { Compiler } from '../compiler'
import { Scope } from '../../spec/target/scope'
import { Evaluator } from './evaluator'
import { mapLogicItemName } from '../name-helpers'
import { ScriptItem } from '../script-item'
import { K8sItem } from '../../spec/target/k8s-item'
import { LogicItem } from '../../spec/target/logic-item'
import { RegistryState } from '@kubevious/helpers/dist/registry-state'
import { KeyValueDict } from '../../spec/target/types'

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
        var result = {
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
        var result: TargetResult = {
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

    _executorNodeR(): any {
        if (this._executorNodes.length == 0) {
            return
        }

        var executorNode = _.head(this._executorNodes)
        this._executorNodes.splice(0, 1)

        return Promise.resolve()
            .then(() => this._executorNode(executorNode!))
            .then(() => this._executorNodeR())
    }

    _executorNode(executorNode: ExecutorNode) {
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

    _executeTargetSelector(targetSelector: LogicItem, prev: ScriptItem) {
        // console.log("[_executeTargetSelector] :: " + item.constructor.name);

        return Promise.resolve()
            .then(() => {
                if (targetSelector.constructor.name == 'LogicItem') {
                    return this._executeLogicItem(targetSelector, prev)
                } else if (targetSelector.constructor.name == 'K8sItem') {
                }
            })
            .then((result) => {
                // console.log(result);
                if (!result) {
                    return []
                }
                return _.keys(result).map(
                    (x) => new ScriptItem(x, this._state!)
                )
            })
    }

    _filterItems(
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
                } else if (targetSelector.constructor.name == 'K8sItem') {
                    return items
                }
            })
            .then((newItems) => newItems!.filter((x) => x))
    }

    _filterLogicItem(
        targetSelector: LogicItem,
        prev: ScriptItem,
        item: ScriptItem
    ) {
        var filters = [
            () => this._filterLogicItemByName(targetSelector, prev, item),
            () => this._filterLogicItemByLabel(targetSelector, prev, item),
            () => this._filterLogicItemByAnnotation(targetSelector, prev, item),
            () =>
                this._filterLogicItemByCustomFilter(targetSelector, prev, item),
        ]

        var isMatched = true
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

    _filterLogicItemByName(
        targetSelector: LogicItem,
        prev: ScriptItem,
        item: ScriptItem
    ) {
        var evaluator = new Evaluator<string>(
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

    _filterLogicItemByLabel(
        targetSelector: LogicItem,
        prev: ScriptItem,
        item: ScriptItem
    ) {
        var evaluator = new Evaluator<KeyValueDict>(
            this._state!,
            targetSelector,
            prev,
            item,
            targetSelector._labelFilters
        )
        return evaluator.doesAnyMatch((dict) => {
            for (var key of _.keys(dict)) {
                if (item.labels[key] != dict[key]) {
                    return false
                }
            }
            return true
        })
    }

    _filterLogicItemByAnnotation(
        targetSelector: LogicItem,
        prev: ScriptItem,
        item: ScriptItem
    ) {
        var evaluator = new Evaluator<KeyValueDict>(
            this._state!,
            targetSelector,
            prev,
            item,
            targetSelector._annotationFilters
        )
        return evaluator.doesAnyMatch((dict) => {
            for (var key of _.keys(dict)) {
                if (item.annotations[key] != dict[key]) {
                    return false
                }
            }
            return true
        })
    }

    _filterLogicItemByCustomFilter(
        targetSelector: LogicItem,
        prev: ScriptItem,
        item: ScriptItem
    ) {
        var evaluator = new Evaluator<boolean>(
            this._state!,
            targetSelector,
            prev,
            item,
            targetSelector._customFilters
        )
        return evaluator.doesAnyMatch(x => x)
    }

    _executeLogicItem(targetSelector: LogicItem, prev: ScriptItem) {
        var mappedKind = mapLogicItemName(targetSelector._kind)

        // console.log("[_executeLogicItem] :: " + targetSelector._kind + "(" + mappedKind + ") :: " + targetSelector._location);

        if (targetSelector._location == 'descendant') {
            if (prev) {
                var result = this._state!.scopeByKind(prev._dn, mappedKind)
                return result
            } else {
                return this._state!.findByKind(mappedKind)
            }
        } else if (targetSelector._location == 'child') {
            if (prev) {
                return this._state!.childrenByKind(prev._dn, mappedKind)
            }
        }
    }

    _acceptFinalItems(items: ScriptItem[]) {
        // console.log("[_acceptFinalItems] :: count: " + items.length);
        // console.log(items);
        for (var item of items!) {
            this._finalItems![item._dn] = {
                dn: item._dn,
                kind: 'logic',
            }
        }
    }

    _acceptChainItems(items: (ScriptItem | null)[], scope: Scope) {
        // console.log("[_acceptChainItems] :: count: " + items.length);

        for (var x of scope._chain) {
            this._executorNodes.push({
                prevs: items as ScriptItem[],
                targetSelector: x as LogicItem,
            })
        }
    }

    _loadModule() {
        return Promise.resolve().then(() => {
            var compilerValues = {
                select: (kind: string) => {
                    return this._scope.descendant(kind)
                },
                resource: (kind: string, apiGroup: string) => {
                    return this._scope.resource(kind, apiGroup)
                },
            }

            var compiler = new Compiler(
                this._src,
                'RULE_TARGET',
                compilerValues
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

    _validateScope(scope: Scope) {
        if (this._scope._chain.length > 1) {
            this._addError('Fanout targets are not supported.')
            return
        }

        for (var targetSelector of scope._chain) {
            this._validateTargetSelector(targetSelector)
        }
    }

    _validateTargetSelector(targetSelector: K8sItem | LogicItem) {
        this._validateScope(targetSelector._scope)
    }

    _addError(msg: string) {
        this._errorMessages.push(msg)
    }
}
