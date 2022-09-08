import { K8sTarget, K8sTargetBuilder } from "../../../spec/target/root/k8s-target";
import { executeScopeQueryCount, executeScopeQueryMany, executeScopeQuerySingle } from "./scope-executor";

export class QueryableK8sTargetBuilder extends K8sTargetBuilder
{
    many() {
        return executeScopeQueryMany(this._scope, this._executionState);
    }

    single() {
        return executeScopeQuerySingle(this._scope, this._executionState);
    }

    count() {
        return executeScopeQueryCount(this._scope, this._executionState);
    }
}

export class QueryableK8sTarget extends K8sTarget
{
    protected _makeTargetBuilder()
    {
        return new QueryableK8sTargetBuilder(this._scope, this._executionState);
    }
}