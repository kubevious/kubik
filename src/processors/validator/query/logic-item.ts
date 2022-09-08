import { LogicItem, LogicItemParams } from '../../../spec/target/logic-item';
import { Scope } from '../../../spec/target/scope';
import { LogicLocationType } from '../../../spec/target/types';
import { ExecutionState } from '../../execution-state';
import { QueryFetcher } from '../../query/fetcher';
import { ScriptItem } from '../../script-item';
import { QueryableScope } from './scope';

export class QueryableLogicItem extends LogicItem {

    private _rootScope: QueryableScope;

    constructor(location: LogicLocationType, params: LogicItemParams, executionState : ExecutionState, rootScope: QueryableScope) {
        super(location, params);

        this._scope = new QueryableScope(executionState);
        this._rootScope = rootScope;
    }

    many()
    {
        // console.log("[QueryableLogicItem] ***** MANY");
        this._rootScope.finalize();

        // console.log("[QueryableLogicItem] ***** CHAIN LENGTH: ", this._rootScope._chain.length );

        if (this._rootScope._chain.length == 0) {
            return [];
        }

        const fetcher = new QueryFetcher(this._rootScope.executionState, this._rootScope);
        const result = fetcher.execute();

        // console.log("MANY QUERY RESULT: ", result)

        if (!result.success) {
            return [];
        }

        return result.items.map(x => new ScriptItem(x.dn, this._rootScope.executionState.state));
    }

}