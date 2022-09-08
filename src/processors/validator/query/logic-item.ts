import { LogicItem, LogicItemParams } from '../../../spec/target/logic-item';
import { LogicLocationType } from '../../../spec/target/types';
import { ExecutionState } from '../../execution-state';
import { QueryableScope } from './scope';
import { executeScopeQueryCount, executeScopeQueryMany, executeScopeQuerySingle } from './scope-executor';

export class QueryableLogicItem extends LogicItem {

    private _rootScope: QueryableScope;

    constructor(location: LogicLocationType, params: LogicItemParams, executionState : ExecutionState, rootScope: QueryableScope) {
        super(location, params);

        this._scope = new QueryableScope(executionState, rootScope);
        this._rootScope = rootScope;
    }

    many()
    {
        return executeScopeQueryMany(this._rootScope, this._rootScope.executionState);
    }

    single()
    {
        return executeScopeQuerySingle(this._rootScope, this._rootScope.executionState);
    }

    count()
    {
        return executeScopeQueryCount(this._rootScope, this._rootScope.executionState);
    }

}