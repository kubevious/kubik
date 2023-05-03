import _ from 'the-lodash'
import { MyPromise, Resolvable } from 'the-promise'
import { RegistryAccessor } from '@kubevious/state-registry'
import { Compiler, CompilerScopeDict } from '../compiler'
import { ScriptItem } from '../script-item'
import { TopLevelQuery } from '../../spec/target/root/types'
import { ExecutionState } from '../execution-state'
import { makeValidatorRootScope } from './scope-builder'
import { RootScopeBuilder } from '../scope-builders';
import { ValidatorScopeBuilderExecutor } from '../scope-builders'

export interface ValidationProcessorResult {
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
}


export class ValidationProcessor {
    private _runnable: null | Resolvable<any>;
    private _src: string;
    private _executionState : ExecutionState;
    private _scopeBuilderExecutor : ValidatorScopeBuilderExecutor;

    constructor(src: string, executionState : ExecutionState, scopeBuilderExecutor? : ValidatorScopeBuilderExecutor) {
        this._src = src;
        this._executionState = executionState;
        this._runnable = null;
        this._scopeBuilderExecutor = scopeBuilderExecutor ?? makeValidatorRootScope;
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
                config: null,
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

    execute(dn: string, state: RegistryAccessor) : Promise<ValidationProcessorResult> {
        let result: ValidationProcessorResult = {
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
                
                this._setupQueryBuilders(valueMap, item);

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

    private _setupQueryBuilders(valueMap: Record<string, any>, item: ScriptItem)
    {
        const rootScopeBuilder : RootScopeBuilder = {
            setup: (name: string, func: any) => {
                valueMap[name] = func;
            }
        }

        this._scopeBuilderExecutor(rootScopeBuilder, item, this._executionState);
    }

    private _addError(list: string[], msg: string) {
        list.push(msg)
    }
}
