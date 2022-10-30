import _ from 'the-lodash'
import { Scope } from '../../spec/target/scope'
import { ScriptItem } from '../script-item';
import { LogicItem } from '../../spec/target/logic-item';
import { KeyValueDict, LogicLocationType } from '../../spec/target/types';
import { Evaluator } from './evaluator'
import { mapLogicItemName } from '../name-helpers'
import { ExecutionState } from '../execution-state';
import { NodeKind } from '@kubevious/entity-meta/dist';

export interface QueryResult {
    success: boolean
    messages: string[]
    items: FinalItems[]
}

export interface FinalItems {
    dn: string
    kind: string
}

export interface ExecutorNode {
    prevs: ScriptItem[]
    targetSelector: LogicItem
}

export class QueryFetcher
{
    private _executionState : ExecutionState;
    private _scope: Scope;

    private _result: QueryResult = {
        success: false,
        items: [],
        messages: [],
    };
    private _executorNodes: ExecutorNode[] = [];
    private _finalItems: {
        [dn: string]: FinalItems
    } = {};

    constructor(executionState : ExecutionState, scope: Scope)
    {
        this._executionState = executionState;
        this._scope = scope;
    }

    execute(): QueryResult {
      
        try
        {
            this._acceptChainItems([new ScriptItem(NodeKind.root, this._executionState.state)], this._scope);

            this._executorNodeR();
            
            this._result.items = _.values(this._finalItems)
            this._result.success = this._result.messages.length == 0;
        }
        catch(reason: any)
        {
            this._result.success = false
            this._addError(reason?.message || "Unknown error happened")
            console.error("QUERY FETCHER ERROR: ", reason);
        }

        return this._result
    }

    private _acceptChainItems(items: ScriptItem[], scope: Scope) {
        // console.log("[_acceptChainItems] :: count: " + items.length);

        for (let x of scope._chain) {
            this._executorNodes.push({
                prevs: items,
                targetSelector: x as LogicItem,
            })
        }
    }

    private _executorNodeR(): any {
        // console.log("[_executorNodeR] count: " + this._executorNodes.length);

        if (this._executorNodes.length == 0) {
            return
        }

        let executorNode = _.head(this._executorNodes)
        this._executorNodes.splice(0, 1)

        this._executorNode(executorNode!);
        this._executorNodeR();
    }

    private _executorNode(executorNode: ExecutorNode)
    {
        // console.log("[_executorNode] LOGIC ITEM: ");
        // executorNode.targetSelector.debugOutput();

        const targetSelector = executorNode.targetSelector;
        for(const x of executorNode.prevs)
        {
            const allItems = this._executeTargetSelector(targetSelector, x);
            // console.log("[_executorNode] allItems: " + allItems.length);

            const items = this._filterItems(targetSelector, x, allItems)
            // console.log("[_executorNode] items: " + items.length);

            if (items && (items.length > 0))
            {
                if (executorNode.targetSelector._scope._chain.length == 0) {
                    this._acceptFinalItems(items as ScriptItem[])
                } else {
                    this._acceptChainItems(
                        items,
                        executorNode.targetSelector._scope
                    )
                }
            }

        }
    }

    private _executeTargetSelector(targetSelector: LogicItem, prev: ScriptItem) : ScriptItem[]
    {
        // console.log("[_executeTargetSelector] :: " + targetSelector.constructor.name);
        
        let result : string[] | undefined = undefined;
        if (this.isMySelector(targetSelector))  // TODO: Check why we do that...
        {
            result = this._executeLogicItem(targetSelector, prev);
        }

        // console.log("[_executeTargetSelector] result: ", result);

        if (!result) {
            return []
        }
        return result.map(
            (x) => new ScriptItem(x, this._executionState.state)
        );
    }

    private isMySelector(targetSelector: LogicItem) : boolean
    {
        return (targetSelector.constructor.name == 'LogicItem' || 
                targetSelector.constructor.name == 'QueryableLogicItem');
    }

    private _executeLogicItem(targetSelector: LogicItem, prev: ScriptItem) : string[]
    {
        // console.log("[_executeLogicItem] :: " + targetSelector._params.kind + " :: " + targetSelector._location);

        switch(targetSelector._location)
        {
            case LogicLocationType.descendant:
                {
                    const results = prev.descendants(targetSelector._params.kind!);
                    return results.map(x => x._dn);
                }
                break;

            case LogicLocationType.child:
                {
                    const results = prev.children(targetSelector._params.kind!);
                    return results.map(x => x._dn);
                }
                break;

            case LogicLocationType.parent:
                {
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
                break;


            case LogicLocationType.ancestor:
                {
                    if (targetSelector._params.kind) {
                        const ancestors = prev.ancestors(targetSelector._params.kind);
                        return ancestors.map(x => x._dn);
                    }
                }
                break;

            case LogicLocationType.link:
                {
                    const results = prev.links(targetSelector._params.link);
                    return results.map(x => x._dn);
                }
                break;
        }

        return [];
    }


    private _filterItems(
        targetSelector: LogicItem,
        prev: ScriptItem,
        items: ScriptItem[]
    ) : ScriptItem[]
    {
        if (!this.isMySelector(targetSelector)) { // TODO: Check why we do that...
            return [];
        }
        return items.filter(item => {
            const shouldInclude = this._filterLogicItem(
                targetSelector,
                prev,
                item
            );

            return shouldInclude;
        });
    }

    private _filterLogicItem(
        targetSelector: LogicItem,
        prev: ScriptItem,
        item: ScriptItem
    ) : boolean {
        let filters = [
            () => this._filterLogicItemByName(targetSelector, prev, item),
            () => this._filterLogicItemByLabel(targetSelector, prev, item),
            () => this._filterLogicItemByAnnotation(targetSelector, prev, item),
            () =>
                this._filterLogicItemByCustomFilter(targetSelector, prev, item),
        ]

        for(const filter of filters)
        {
            if (!filter()) {
                return false;
            }
        }
        return true;
    }

    private _filterLogicItemByName(
        targetSelector: LogicItem,
        prev: ScriptItem,
        item: ScriptItem
    ) : boolean {
        let evaluator = new Evaluator<string>(
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
    ) : boolean {
        let evaluator = new Evaluator<KeyValueDict>(
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
    ) : boolean {
        let evaluator = new Evaluator<KeyValueDict>(
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
    ) : boolean {
        let evaluator = new Evaluator<boolean>(
            targetSelector,
            prev,
            item,
            targetSelector._customFilters
        )
        return evaluator.doesAnyMatch(x => x)
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

    private _addError(msg: string) {
        this._result.messages.push(msg)
    }
}