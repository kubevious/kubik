import _ from 'the-lodash'
import { Promise } from 'the-promise'
import { Compiler } from '../compiler'
import { Scope } from '../../spec/target/scope'
import { LogicItem } from '../../spec/target/logic-item'
import { RegistryState } from '@kubevious/state-registry'
import { makeRootScope } from '../../spec/target/root'
import { QueryFetcher, QueryResult } from '../query/fetcher';
import { ExecutionState } from '../execution-state'

export class TargetProcessor {
    private _src: string
    private _errorMessages: string[]
    private _scope: Scope
    private _executionState : ExecutionState;

    constructor(src: string, executionState : ExecutionState) {
        this._src = src
        this._executionState = executionState;
        this._scope = new Scope();
        this._errorMessages = []
    }

    get scope() {
        return this._scope
    }

    get k8sApiResources() {
        return this._executionState.k8sApiResources;
    }

    prepare() {
        this._errorMessages = []
        let result = {
            success: false,
            messages: this._errorMessages,
        }

        return this._loadModule()
            .then((runnable) => runnable.run())
            .then(() => {
                this._scope.finalize();
            })
            .then(() => {
                this._validate()
                result.success = result.messages.length == 0
            })
            .catch((reason) => {
                result.success = false
                this._addError(reason.message)
            })
            .then(() => result)
    }

    execute(state: RegistryState): Promise<QueryResult> {
       
        return Promise.resolve()
            .then(() => {
                const fetcher = new QueryFetcher(this._executionState, this._scope);
                const result = fetcher.execute();
                return result;
            })

    }

    private _loadModule() {
        return Promise.resolve().then(() => {
            const rootScope = makeRootScope(this._scope, this._executionState);

            let compiler = new Compiler(
                this._src,
                'RULE_TARGET',
                rootScope
            )
            return compiler.compile()
        })
    }

    private _validate() {
        if (this._scope._chain.length == 0) {
            this._addError('No target specified.')
            return
        }

        this._validateScope(this._scope)
    }

    private _validateScope(scope: Scope) {
        if (this._scope._chain.length > 1) {
            this._addError('Fanout targets are not supported.')
            return
        }

        for (let targetSelector of scope._chain) {
            this._validateTargetSelector(targetSelector)
        }
    }

    private _validateTargetSelector(targetSelector: LogicItem) {
        this._validateScope(targetSelector._scope)
    }

    private _addError(msg: string) {
        // console.log("[TARGET-PROCESSOR] ERROR: ", msg)
        this._errorMessages.push(msg)
    }
}
