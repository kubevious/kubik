import { Scope } from '../scope'
import { NodeKind } from '@kubevious/entity-meta'
import { KeyValueDict } from '../types';
import { ExecutionState } from '../../../processors/execution-state';

export class K8sTargetBuilder
{
    protected _scope : Scope;
    protected _executionState: ExecutionState;

    private _data : {
        isApiVersion: boolean,
        apiVersion?: string,
        apiOrNone?: string,
        version?: string,
        kind?: string,
        namespace?: string,

        nameFilters: string[],
        labelFilters: KeyValueDict[],

    } = {
        isApiVersion: true,
        nameFilters: [],
        labelFilters: [],
    }

    constructor(scope : Scope, executionState: ExecutionState)
    {
        this._scope = scope;
        this._executionState = executionState;

        scope.registerFinalizer(this._finalize.bind(this));
    }

    ApiVersion(apiVersion: string)
    {
        this._data.isApiVersion = true;
        this._data.apiVersion = apiVersion;
        return this;
    }

    Api(apiOrNone?: string)
    {
        this._data.isApiVersion = false;
        this._data.apiOrNone = apiOrNone;
        return this;
    }

    Version(version: string)
    {
        this._data.version = version;
        return this;
    }

    Kind(kind: string)
    {
        this._data.kind = kind;
        return this;
    }

    namespace(value: string)
    {
        this._data.namespace = value;
        return this;
    }

    name(value: string)
    {
        this._data.nameFilters.push(value);
        return this;
    }

    label(key: string, value: string) {
        let filter: KeyValueDict = {};
        filter[key] = value;
        return this.labels(filter)
    }

    labels(value: KeyValueDict) {
        this._data.labelFilters.push(value)
        return this
    }

    private _finalize()
    {
        // console.log("_finalize:", this._data);

        if (!this._executionState) {
            return;
        }

        if (!this._data.kind) {
            return;
        }

        const apiVersion = this._data.isApiVersion ? this._data.apiVersion : 
            (this._data.apiOrNone ? `${this._data.apiOrNone}/${this._data.version}` : this._data.version);
        if (!apiVersion) {
            console.log("No apiVersion");
            return;
        }

        const apiResource = this._executionState.k8sApiResources.getByApiVersionAndKind(apiVersion, this._data.kind);
        if (!apiResource) {
            console.log("No ApiResource");
            return;
        }

        let currentScope = this._scope.child(NodeKind.k8s); 

        if (apiResource.isNamespaced)
        {
            currentScope = currentScope.child(NodeKind.ns);
            if (this._data.namespace)
            {
                currentScope = currentScope.name(this._data.namespace);
            }
        }
        else
        {
            currentScope = currentScope.child(NodeKind.cluster);
        }

        if (apiResource.apiName)
        {
            currentScope = currentScope.child(NodeKind.api)
            currentScope = currentScope.name(apiResource.apiName);
        }

        currentScope = currentScope.child(NodeKind.version)
        currentScope = currentScope.name(apiResource.version);

        currentScope = currentScope.child(NodeKind.kind)
        currentScope = currentScope.name(apiResource.kindName);

        currentScope = currentScope.child(NodeKind.resource);
        for(const name of this._data.nameFilters)
        {
            currentScope = currentScope.name(name);
        }
        for(const labels of this._data.labelFilters)
        {
            currentScope = currentScope.labels(labels);
        }
    }

}

export class K8sTarget
{
    protected _scope : Scope;
    protected _executionState: ExecutionState;
    
    constructor(scope: Scope, executionState: ExecutionState)
    {
        this._scope = scope;
        this._executionState = executionState;
    }

    ApiVersion(apiVersion: string)
    {
        const builder = this._makeTargetBuilder();
        builder.ApiVersion(apiVersion);
        return builder;
    }

    Api(apiOrNone?: string)
    {
        const builder = this._makeTargetBuilder();
        builder.Api(apiOrNone);
        return builder;
    }

    protected _makeTargetBuilder()
    {
        return new K8sTargetBuilder(this._scope, this._executionState);;
    }

}