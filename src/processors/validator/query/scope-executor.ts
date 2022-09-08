import _ from 'the-lodash';
import { Scope } from "../../../spec/target/scope";
import { ExecutionState } from "../../execution-state";
import { QueryFetcher } from "../../query/fetcher";
import { ScriptItem } from "../../script-item";

export function executeScopeQueryMany(scope: Scope, executionState : ExecutionState)
{
    scope.finalize();

    // console.log("[executeScopeQuery] ***** CHAIN LENGTH: ", scope._chain.length );
    // scope.debugOutput(2);

    // scope.validate(); // TODO:: 

    if (scope._chain.length == 0) {
        return [];
    }

    const fetcher = new QueryFetcher(executionState, scope);
    const result = fetcher.execute();

    // console.log("[executeScopeQuery] MANY QUERY RESULT: ", result)

    if (!result.success) {
        return [];
    }

    return result.items.map(x => new ScriptItem(x.dn, executionState.state));
}

export function executeScopeQuerySingle(scope: Scope, executionState : ExecutionState)
{
    const items = executeScopeQueryMany(scope, executionState);
    return _.head(items);
}

export function executeScopeQueryCount(scope: Scope, executionState : ExecutionState)
{
    const items = executeScopeQueryMany(scope, executionState);
    return items.length
}