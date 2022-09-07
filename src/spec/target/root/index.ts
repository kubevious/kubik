import { K8sApiResourceStatusLoader, NodeKind } from '@kubevious/entity-meta'
import { Scope } from '../scope'
import { K8sTarget } from './k8s-target';

export function makeRootScope(scope: Scope, k8sApiResources: K8sApiResourceStatusLoader)
{
    return {

        Logic: () => {
            return scope.descendant(NodeKind.logic);
        },

        Images: () => {
            return scope.descendant(NodeKind.images);
        },

        Gateway: () => {
            return scope.descendant(NodeKind.gateway);
        },

        Package: () => {
            return scope.descendant(NodeKind.pack);
        },

        K8s: () => {
            return scope.descendant(NodeKind.k8s);
        },

        Infra: () => {
            return scope.descendant(NodeKind.infra);
        },

        RBAC: () => {
            return scope.descendant(NodeKind.rbac);
        },

        ApiVersion: (apiVersion: string) => {
            const target = new K8sTarget(scope, k8sApiResources);
            return target.ApiVersion(apiVersion);
        },

        Api: (apiOrNone?: string) => {
            const target = new K8sTarget(scope, k8sApiResources);
            return target.Api(apiOrNone);
        },

        select: (kind: string) => {
            return scope.descendant(NodeKind.logic)
                        .descendant(kind)
        },
        
    }
}
