import { RegistryState } from '@kubevious/state-registry'
import _ from 'the-lodash'
import { Promise, Resolvable } from 'the-promise'
import { Compiler } from '../compiler'
import { ScriptItem } from '../script-item'
import { FinalItems } from '../target/processor'

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

export interface CompilerValues {
    item: ScriptItem | null;
    error: ((msg: string) => void) | null;
    warning: ((msg: string) => void) | null;
    mark: ((marker: string) => void) | null;
}

export class ValidationProcessor {
    private _runnable: null | Resolvable<any>
    private _src: string
    constructor(src: string) {
        this._runnable = null
        this._src = src
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
            let compilerValues: CompilerValues = {
                item: null,
                error: null,
                warning: null,
                mark: null,
            }

            let compiler = new Compiler(
                this._src,
                'RULE_VALIDATOR',
                compilerValues
            )
            // compiler.enableVerboseOutput();
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

                let valueMap = {
                    item: item,
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

    private _addError(list: string[], msg: string) {
        list.push(msg)
    }
}
