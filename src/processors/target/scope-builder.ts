import _ from 'the-lodash'
import { NodeKind } from '@kubevious/entity-meta'
import { ExecutionState } from '../execution-state';
import { Scope } from '../../spec/target/scope'
import { K8sTarget } from '../../spec/target/root/k8s-target';
import { TopLevelQuery, TOP_LEVEL_GRAPH_ROOTS } from '../../spec/target/root/types';
import { RootScopeBuilder } from '../scope-builders'

export function makeTargetRootScope(rootScopeBuilder : RootScopeBuilder, scope: Scope, executionState: ExecutionState)
{
    for(const x of _.keys(TopLevelQuery))
    {
        rootScopeBuilder.setup(x, () => {
            return scope.child(TOP_LEVEL_GRAPH_ROOTS[x]);
        });
    }

    rootScopeBuilder.setup(TopLevelQuery.select, (kind: string) => {
        return scope.child(NodeKind.logic)
                    .descendant(kind)
    });

    rootScopeBuilder.setup(TopLevelQuery.ApiVersion, (apiVersion: string) => {
        const target = new K8sTarget(scope, executionState);
        return target.ApiVersion(apiVersion);
    });

    rootScopeBuilder.setup(TopLevelQuery.Api, (apiOrNone?: string) => {
        const target = new K8sTarget(scope, executionState);
        return target.Api(apiOrNone);
    });
}
