import _ from 'the-lodash'
import { Promise, Resolvable } from 'the-promise'
import { NodeKind } from '@kubevious/entity-meta'
import { RegistryState } from '@kubevious/state-registry'
import { Compiler, CompilerScopeDict } from '../compiler'
import { ScriptItem } from '../script-item'
import { FinalItems } from '../query/fetcher'
import { TopLevelQuery } from '../../spec/target/root/types'
import { QueryableScope } from './query/scope'
import { ExecutionState } from '../execution-state'

export interface Result {
    success?: boolean
    messages?: string[]
    validation?: {
        hasErrors: boolean
        hasWarnings: boolean
        errorMsgs: {
            [name: string]: boolean
        }
        warnMsgs: {
            [name: string]: boolean
        }
        marks?: {
            [name: string]: boolean
        }
    }
    items?: (string | FinalItems)[]
}


export class ValidationProcessor {
    private _runnable: null | Resolvable<any>;
    private _src: string;
    private _executionState : ExecutionState;

    constructor(src: string, executionState : ExecutionState) {
        this._src = src;
        this._executionState = executionState;
        this._runnable = null;
    }

    prepare() {
        let result = {
            success: false,
            messages: [],
        }

        return this._loadModule()
            .then((runnable) => {
                this._runnable = runnable
            })
            .then(() => {
                this._validate()
                result.success = result.messages.length == 0
            })
            .catch((reason) => {
                result.success = false
                this._addError(result.messages, reason.message)
            })
            .then(() => result)
    }

    private _loadModule() {
        return Promise.resolve().then(() => {
            let compilerValues: CompilerScopeDict = {
                item: null,
                error: null,
                warning: null,
                mark: null,
            }

            for(const x of _.keys(TopLevelQuery))
            {
                compilerValues[x] = null;
            }

            let compiler = new Compiler(
                this._src,
                'RULE_VALIDATOR',
                compilerValues
            )
            return compiler.compile()
        })
    }

    private _validate() {}

    execute(dn: string, state: RegistryState) : Promise<Result> {
        let result: Result = {
            success: false,
            messages: [],
            validation: {
                hasErrors: false,
                hasWarnings: false,
                errorMsgs: {},
                warnMsgs: {},
            },
        }

        return Promise.resolve()
            .then(() => {
                let item = new ScriptItem(dn, state);

                let valueMap : Record<string, any> = {
                    item: item,
                    config: item.config,
                    error: (msg: string) => {
                        result.validation!.hasErrors = true
                        if (msg) {
                            result.validation!.errorMsgs[msg] = true
                        }
                    },
                    warning: (msg: string) => {
                        result.validation!.hasWarnings = true
                        if (msg) {
                            result.validation!.warnMsgs[msg] = true
                        }
                    },
                    mark: (kind: string) => {
                        if (!result.validation!.marks) {
                            result.validation!.marks = {}
                        }
                        result.validation!.marks[kind] = true
                    },
                }
                
                this._setupQueryBuilders(valueMap);

                // console.log("HEADERS: ", _.keys(valueMap))

                return this._runnable!.run(valueMap);
            })
            .then(() => {
                result.success = true
            })
            .catch((reason: Error) => {
                result.success = false
                this._addError(result.messages!, reason.message)
            })
            .then(() => result)
    }

    private _setupQueryBuilders(valueMap: Record<string, any>)
    {
        // const rootScope = makeRootScope(this._scope, this._k8sApiResources);

        valueMap[TopLevelQuery.Logic] = () => {
            const scope = new QueryableScope(this._executionState);
            return scope.descendant(NodeKind.logic);
        };

        // valueMap[TopLevelQuery.ApiVersion] = (apiVersion: string) => {
        //     const scope = new Scope();

        //     const target = new K8sTarget(scope, this._k8sApiResources);
        //     const builder = target.ApiVersion(apiVersion);

        //     (builder as any)['many'] = () => {
             
        //         scope.finalize();
        //         // scope.validate(); // TODO:: 

        //         if (scope._chain.length == 0) {
        //             return [];
        //         }

        //     }

        // };

    }

    private _addError(list: string[], msg: string) {
        list.push(msg)
    }
}
