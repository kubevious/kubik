import _ from 'the-lodash'
import { ExecutionState } from '../execution-state';
import { TopLevelQuery, TOP_LEVEL_GRAPH_ROOTS } from '../../spec/target/root/types';
import { RootScopeBuilder } from '../scope-builders'
import { QueryableScope } from './query/scope';
import { QueryableK8sTarget } from './query/k8s-target';
import { ScriptItem } from '../script-item';

export function makeValidatorRootScope(rootScopeBuilder : RootScopeBuilder, item: ScriptItem, executionState: ExecutionState)
{
    for(const x of _.keys(TopLevelQuery))
    {
        rootScopeBuilder.setup(x, () => {
            const scope = new QueryableScope(executionState);
            return scope.child(TOP_LEVEL_GRAPH_ROOTS[x]);
        });
    }

    rootScopeBuilder.setup(TopLevelQuery.ApiVersion, (apiVersion: string) => {
        const scope = new QueryableScope(executionState);

        const target = new QueryableK8sTarget(scope, executionState, item);
        const builder = target.ApiVersion(apiVersion);

        return builder;
    });

    rootScopeBuilder.setup(TopLevelQuery.Api, (apiOrNone?: string) => {
        const scope = new QueryableScope(executionState);

        const target = new QueryableK8sTarget(scope, executionState, item);
        const builder = target.Api(apiOrNone);

        return builder;
    });
}
