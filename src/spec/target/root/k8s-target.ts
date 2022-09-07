import { Scope } from '../scope'
import { K8sApiResourceStatusLoader, NodeKind } from '@kubevious/entity-meta'

export class K8sTargetBuilder
{
    private _scope : Scope;
    private _k8sApiResources: K8sApiResourceStatusLoader;

    private _data : {
        isApiVersion: boolean,
        apiVersion?: string,
        apiOrNone?: string,
        version?: string,
        kind?: string,
        name?: string,
        namespace?: string,
    } = {
        isApiVersion: true
    }

    constructor(scope : Scope, k8sApiResources: K8sApiResourceStatusLoader)
    {
        this._scope = scope;
        this._k8sApiResources = k8sApiResources;

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
        this._data.name = value;
        return this;
    }

    private _finalize()
    {
        // console.log("_finalize:", this._data);

        if (!this._k8sApiResources) {
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

        const apiResource = this._k8sApiResources.getByApiVersionAndKind(apiVersion, this._data.kind);
        if (!apiResource) {
            console.log("No ApiResource");
            return;
        }

        let currentScope = this._scope.descendant(NodeKind.root);
        currentScope = currentScope.child(NodeKind.k8s);

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

        currentScope = currentScope.child(NodeKind.resource)
        if (this._data.name) {
            currentScope = currentScope.name(this._data.name);
        }
    }

}

export class K8sTarget
{
    private _scope : Scope;
    private _k8sApiResources: K8sApiResourceStatusLoader;
    
    constructor(scope: Scope, k8sApiResources: K8sApiResourceStatusLoader)
    {
        this._scope = scope;
        this._k8sApiResources = k8sApiResources;
    }

    ApiVersion(apiVersion: string)
    {
        const builder = new K8sTargetBuilder(this._scope, this._k8sApiResources);
        builder.ApiVersion(apiVersion);
        return builder;
    }

    Api(apiOrNone?: string)
    {
        const builder = new K8sTargetBuilder(this._scope, this._k8sApiResources);
        builder.Api(apiOrNone);
        return builder;
    }

}