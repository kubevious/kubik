import _ from 'the-lodash'
import { NodeKind } from '@kubevious/entity-meta'
import { ExecutionState } from '../../../processors/execution-state';
import { Scope } from '../scope'
import { K8sTarget } from './k8s-target';
import { TopLevelQuery, TOP_LEVEL_GRAPH_ROOTS } from './types';

export function makeRootScope(scope: Scope, executionState: ExecutionState)
{
    const roots : Record<string, any> = {};

    for(const x of _.keys(TopLevelQuery))
    {
        roots[x] = () => {
            return scope.descendant(TOP_LEVEL_GRAPH_ROOTS[x]);
        };
    }

    roots[TopLevelQuery.select] = (kind: string) => {
        return scope.descendant(NodeKind.logic)
                    .descendant(kind)
    };

    roots[TopLevelQuery.ApiVersion] = (apiVersion: string) => {
        const target = new K8sTarget(scope, executionState);
        return target.ApiVersion(apiVersion);
    },

    roots[TopLevelQuery.Api] = (apiOrNone?: string) => {
        const target = new K8sTarget(scope, executionState);
        return target.Api(apiOrNone);
    }

    return roots;
}
