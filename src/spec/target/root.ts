import { Scope } from './scope'
import { NodeKind } from '@kubevious/entity-meta'

export function makeRootScope(scope: Scope)
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

        select: (kind: string) => {
            return scope.descendant(NodeKind.logic)
                        .descendant(kind)
        },
        
    }
}
