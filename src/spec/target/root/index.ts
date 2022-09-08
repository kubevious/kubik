import { NodeKind } from '@kubevious/entity-meta'
import { ExecutionState } from '../../../processors/execution-state';
import { Scope } from '../scope'
import { K8sTarget } from './k8s-target';
import { TopLevelQuery } from './types';

export function makeRootScope(scope: Scope, executionState: ExecutionState)
{
    return {

        [TopLevelQuery.Logic]: () => {
            return scope.descendant(NodeKind.logic);
        },

        [TopLevelQuery.Images]: () => {
            return scope.descendant(NodeKind.images);
        },

        [TopLevelQuery.Gateway]: () => {
            return scope.descendant(NodeKind.gateway);
        },

        [TopLevelQuery.Package]: () => {
            return scope.descendant(NodeKind.pack);
        },

        [TopLevelQuery.K8s]: () => {
            return scope.descendant(NodeKind.k8s);
        },

        [TopLevelQuery.Infra]: () => {
            return scope.descendant(NodeKind.infra);
        },

        [TopLevelQuery.RBAC]: () => {
            return scope.descendant(NodeKind.rbac);
        },

        [TopLevelQuery.ApiVersion]: (apiVersion: string) => {
            const target = new K8sTarget(scope, executionState);
            return target.ApiVersion(apiVersion);
        },

        [TopLevelQuery.Api]: (apiOrNone?: string) => {
            const target = new K8sTarget(scope, executionState);
            return target.Api(apiOrNone);
        },

        [TopLevelQuery.select]: (kind: string) => {
            return scope.descendant(NodeKind.logic)
                        .descendant(kind)
        },
        
    }
}
