import { K8sTarget, K8sTargetBuilder, K8sTargetBuilderContext } from "../../../spec/target/root/k8s-target";
import { Scope } from "../../../spec/target/scope";
import { ExecutionState } from "../../execution-state";
import { ScriptItem } from "../../script-item";
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
    private _builderContext: K8sTargetBuilderContext = {};

    constructor(scope: Scope, executionState: ExecutionState, item: ScriptItem)
    {
        super(scope, executionState);

        this._builderContext.namespace = item.config?.metadata?.namespace;
    }

    protected _makeTargetBuilder()
    {
        return new QueryableK8sTargetBuilder(this._scope, this._executionState, this._builderContext);
    }
}