import _ from 'the-lodash'
import { Promise } from 'the-promise'
import { calculateObjectHashStr } from '@kubevious/helpers/dist/hash-utils'
import { FinalItems, TargetProcessor } from '../target/processor'
import { Result, ValidationProcessor } from '../validator/processor'
import { RegistryState } from '@kubevious/helpers/dist/registry-state'

export interface RuleObj {
    target: string
    script: string
}

export interface ExecuteResult {
    success: boolean
    targetItems: FinalItems[]
    messages: {
        [name: string]: any
    }[]
    messageHashes?: {
        [name: string]: boolean
    }
    ruleItems: {
        [name: string]: any
    }
}

export class RuleProcessor {
    private _state: RegistryState
    private _ruleObj: RuleObj
    private _ruleTargetSrc: string
    private _ruleScriptSrc: string
    private _executeResult: ExecuteResult | null
    private _targetProcessor?: TargetProcessor
    private _validationProcessor?: ValidationProcessor

    constructor(state: RegistryState, ruleObj: RuleObj) {
        this._state = state
        this._ruleObj = ruleObj
        this._ruleTargetSrc = ruleObj.target
        this._ruleScriptSrc = ruleObj.script
        this._executeResult = null
    }

    process(): Promise<any> {
        this._executeResult = {
            success: true,
            targetItems: [],
            messages: [],
            messageHashes: {},
            ruleItems: {},
        }

        return this._prepare()
            .then(() => {
                if (!this._hasError()) {
                    return
                }

                return this._execute()
            })
            .then(() => {
                return this._getExecuteResult()
            })
            .catch(() => {
                this._acceptScriptErrors('rule', {
                    success: false,
                    messages: ['Unknown error happened.'],
                })
            })
    }

    _prepare() {
        return this._prepareTargets().then(() => {
            return this._prepareScript()
        })
    }

    _execute() {
        return this._executeTarget().then(() => {
            if (!this._hasError()) {
                return
            }

            return this._executeValidators()
        })
    }

    _prepareTargets() {
        this._targetProcessor = new TargetProcessor(this._ruleTargetSrc)
        return this._targetProcessor.prepare().then((result: Result) => {
            this._acceptScriptErrors('target', result)
        })
    }

    _prepareScript() {
        this._validationProcessor = new ValidationProcessor(this._ruleScriptSrc)
        return this._validationProcessor.prepare().then((result: Result) => {
            this._acceptScriptErrors('script', result)
        })
    }

    _executeTarget() {
        return this._targetProcessor!.execute(this._state).then((result) => {
            this._acceptScriptErrors('target', result)
            if (result.success) {
                this._executeResult!.targetItems = result.items as FinalItems[]
            }
        })
    }

    _executeValidators() {
        return Promise.serial(this._executeResult!.targetItems, (x) =>
            this._executeValidator(x)
        )
    }

    _executeValidator(item: FinalItems): Promise<any> {
        return this._validationProcessor!.execute(item.dn, this._state).then(
            (result: Result) => {
                this._acceptScriptErrors('script', result)

                if (result.success) {
                    if (result.validation!.hasErrors) {
                        this._getRuleItem(item.dn).errors = {
                            present: true,
                            messages: _.keys(result.validation!.errorMsgs),
                        }
                    } else if (result.validation!.hasWarnings) {
                        this._getRuleItem(item.dn).warnings = {
                            present: true,
                            messages: _.keys(result.validation!.warnMsgs),
                        }
                    }

                    if (result.validation!.marks) {
                        if (_.keys(result.validation!.marks).length > 0) {
                            this._getRuleItem(
                                item.dn
                            ).marks = result.validation!.marks
                        }
                    }
                }
            }
        )
    }

    _getRuleItem(dn: string) {
        if (!this._executeResult!.ruleItems[dn]) {
            this._executeResult!.ruleItems[dn] = {
                errors: null,
                warnings: null,
                marks: {},
            }
        }
        return this._executeResult!.ruleItems[dn]
    }

    _hasError() {
        return this._executeResult!.success
    }

    _acceptScriptErrors(source: string, result: Result) {
        if (!result.success) {
            this._executeResult!.success = false
            for (var msg of result.messages!) {
                var msgInfo = {
                    source: [source],
                    msg: msg,
                }
                var hash = calculateObjectHashStr(msgInfo)
                if (!(hash in this._executeResult!.messageHashes!)) {
                    this._executeResult!.messageHashes![hash] = true
                    this._executeResult!.messages.push(msgInfo)
                }
            }
        }
    }

    _getExecuteResult(): ExecuteResult {
        var result = this._executeResult!
        this._executeResult = null
        delete result!.messageHashes
        return result
    }
}
