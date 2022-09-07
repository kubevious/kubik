import { K8sApiResourceStatusConfig, K8sApiResourceStatusLoader, NodeKind, PropsId } from "@kubevious/entity-meta";
import { readRegistryState } from "./file-utils";

export function loadK8sApiResources()
{
    var state = readRegistryState('snapshot-items.json');

    const k8sInfraDn = `${NodeKind.root}/${NodeKind.infra}/${NodeKind.k8s}`;
    const k8sInfraNode = state.findByDn(k8sInfraDn);
    if (!k8sInfraNode) {
        throw new Error('[loadK8sApiResources] Node Not Present: ' + k8sInfraDn);
    }

    const k8sApiResourceStatusConfig = k8sInfraNode.getPropertiesConfig(PropsId.config) as K8sApiResourceStatusConfig;

    const k8sApiResources = new K8sApiResourceStatusLoader();
    k8sApiResources.load(k8sApiResourceStatusConfig);
    return k8sApiResources;
}