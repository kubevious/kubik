import { LogicItemParams } from '../../../spec/target/logic-item';
import { Scope } from '../../../spec/target/scope';
import { LogicLocationType } from '../../../spec/target/types';
import { ExecutionState } from '../../execution-state';
import { QueryableLogicItem } from './logic-item';

export class QueryableScope extends Scope {

    private _executionState : ExecutionState;
    private _rootScope: QueryableScope;

    constructor(executionState : ExecutionState, rootScope?: QueryableScope) {
        super();
        this._executionState = executionState;
        this._rootScope = rootScope ?? this;
    }

    get executionState() {
        return this._executionState;
    }

    get rootScope() {
        return this._rootScope;
    }

    protected _add(location: LogicLocationType, params: LogicItemParams) {
        const item = new QueryableLogicItem(location, params, this._executionState, this._rootScope);
        return this._addToChain(item);
    }

}