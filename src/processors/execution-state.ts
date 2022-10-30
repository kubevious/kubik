import _ from 'the-lodash'
import { RegistryAccessor } from '@kubevious/state-registry'
import { K8sApiResourceStatusConfig, K8sApiResourceStatusLoader, NodeKind, PropsId } from '@kubevious/entity-meta'

export class ExecutionState {

    private _state: RegistryAccessor;
    private _k8sApiResources: K8sApiResourceStatusLoader;

    constructor(state: RegistryAccessor) {
        this._state = state;
        this._k8sApiResources = new K8sApiResourceStatusLoader();

        const k8sInfraDn = `${NodeKind.root}/${NodeKind.infra}/${NodeKind.k8s}`;
        const k8sInfraNode = this._state.getNode(k8sInfraDn);
        if (!k8sInfraNode) {
            console.error('[ExecutionState] Node Not Present: ', k8sInfraDn);
            return;
        }

        const propsConfig = this._state.getProperties(k8sInfraDn, PropsId.config);        
        const k8sApiResourceStatusConfig = (propsConfig ?? {}).config as K8sApiResourceStatusConfig;

        try
        {
            this._k8sApiResources.load(k8sApiResourceStatusConfig);
        }
        catch(reason)
        {
            console.error('[ExecutionState] ERROR: ', reason);
        }
    }

    get state() {
        return this._state;
    }

    get k8sApiResources() {
        return this._k8sApiResources;
    }

}