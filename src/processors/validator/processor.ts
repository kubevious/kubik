import { RegistryState } from '@kubevious/helpers/dist/registry-state'
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
    item?: null
    error?: null
    warning?: null
    mark?: null
}

export class ValidationProcessor {
    private _runnable: null | Resolvable<any>
    private _src: string
    constructor(src: string) {
        this._runnable = null
        this._src = src
    }

    prepare() {
        var result = {
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

    _loadModule() {
        return Promise.resolve().then(() => {
            var compilerValues: CompilerValues = {
                item: null,
                error: null,
                warning: null,
                mark: null,
            }

            var compiler = new Compiler(
                this._src,
                'RULE_VALIDATOR',
                compilerValues
            )
            // compiler.enableVerboseOutput();
            return compiler.compile()
        })
    }

    _validate() {}

    execute(dn: string, state: RegistryState) : Promise<Result> {
        var result: Result = {
            success: false,
            messages: [],
            validation: {
                hasErrors: false,
                hasWarnings: false,
                errorMsgs: {},
                warnMsgs: {},
            },
        }

        var item = new ScriptItem(dn, state)

        var valueMap = {
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
        return this._runnable!.run(valueMap)
            .then(() => {
                result.success = true
            })
            .catch((reason: Error) => {
                result.success = false
                this._addError(result.messages!, reason.message)
            })
            .then(() => result)
    }

    _addError(list: string[], msg: string) {
        list.push(msg)
    }
}
