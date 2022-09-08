import { NodeKind } from "@kubevious/entity-meta";

export enum TopLevelQuery
{
    Logic = 'Logic',
    Images = 'Images',
    Gateway = 'Gateway',
    Package = 'Package',
    K8s = 'K8s',
    Infra = 'Infra',
    RBAC = 'RBAC',
    ApiVersion = 'ApiVersion',
    Api = 'Api',
    select = 'select'
}

export const TOP_LEVEL_GRAPH_ROOTS : Record<string, NodeKind> = {
    [TopLevelQuery.Logic]: NodeKind.logic,
    [TopLevelQuery.Images]: NodeKind.images,
    [TopLevelQuery.Gateway]: NodeKind.gateway,
    [TopLevelQuery.Package]: NodeKind.pack,
    [TopLevelQuery.K8s]: NodeKind.k8s,
    [TopLevelQuery.Infra]: NodeKind.infra,
    [TopLevelQuery.RBAC]: NodeKind.rbac,
} 
