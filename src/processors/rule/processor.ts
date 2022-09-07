import _ from 'the-lodash'
import { Promise } from 'the-promise'
import { calculateObjectHashStr } from '../../utils/hash-utils'
import { FinalItems, TargetProcessor } from '../target/processor'
import { Result, ValidationProcessor } from '../validator/processor'
import { RegistryState } from '@kubevious/state-registry'
import { K8sApiResourceStatusConfig, K8sApiResourceStatusLoader, NodeKind, PropsId } from '@kubevious/entity-meta'

export interface RuleObj {
    target: string
    script: string
}

export interface MessageInfo {
    msg: string;
    source: string[];
}

export interface ExecuteResult {
    success: boolean
    targetItems: FinalItems[]
    messages: MessageInfo[]
    ruleItems: {
        [name: string]: any
    }
}

export class RuleProcessor {
    private _state: RegistryState
    private _ruleTargetSrc: string
    private _ruleScriptSrc: string
    private _executeResult: ExecuteResult | null
    private _messageHashes: {
        [name: string]: boolean
    } | null = null;
    private _k8sApiResources: K8sApiResourceStatusLoader = new K8sApiResourceStatusLoader();
    private _targetProcessor?: TargetProcessor;
    private _validationProcessor?: ValidationProcessor;

    constructor(state: RegistryState, rule: RuleObj) {
        this._state = state
        this._ruleTargetSrc = rule.target
        this._ruleScriptSrc = rule.script
        this._executeResult = null
        this._messageHashes = null;
    }

    process(): Promise<ExecuteResult> {
        this._executeResult = {
            success: true,
            targetItems: [],
            messages: [],
            ruleItems: {},
        }
        this._messageHashes = {};

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
                return this._getExecuteResult();
            })
    }

    private _prepare() {
        return Promise.resolve()
            .then(() => this._prepareRegistryState())
            .then(() => this._prepareTargets())
            .then(() => this._prepareScript())
    }

    private _execute() {
        return this._executeTarget().then(() => {
            if (!this._hasError()) {
                return
            }

            return this._executeValidators()
        })
    }

    private _prepareRegistryState()
    {
        {
            const k8sInfraDn = `${NodeKind.root}/${NodeKind.infra}/${NodeKind.k8s}`;
            const k8sInfraNode = this._state.findByDn(k8sInfraDn);
            if (!k8sInfraNode) {
                console.error('[RuleProcessor] Node Not Present: ', k8sInfraDn);
                return;
            }

            const k8sApiResourceStatusConfig = k8sInfraNode.getPropertiesConfig(PropsId.config) as K8sApiResourceStatusConfig;

            try
            {
                this._k8sApiResources.load(k8sApiResourceStatusConfig);
            }
            catch(reason)
            {
                console.error('[RuleProcessor] ERROR: ', reason);
            }
        }
    }

    private _prepareTargets() {
        this._targetProcessor = new TargetProcessor(this._ruleTargetSrc, this._k8sApiResources)
        return this._targetProcessor.prepare().then((result: Result) => {
            this._acceptScriptErrors('target', result)
        })
    }

    private _prepareScript() {
        this._validationProcessor = new ValidationProcessor(this._ruleScriptSrc)
        return this._validationProcessor.prepare().then((result: Result) => {
            this._acceptScriptErrors('script', result)
        })
    }

    private _executeTarget() {
        return this._targetProcessor!.execute(this._state).then((result) => {
            this._acceptScriptErrors('target', result)
            if (result.success) {
                this._executeResult!.targetItems = result.items as FinalItems[]
            }
        })
    }

    private _executeValidators() {
        return Promise.serial(this._executeResult!.targetItems, (x) =>
            this._executeValidator(x)
        )
    }

    private _executeValidator(item: FinalItems): Promise<any> {
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

    private _getRuleItem(dn: string) {
        if (!this._executeResult!.ruleItems[dn]) {
            this._executeResult!.ruleItems[dn] = {
                errors: null,
                warnings: null,
                marks: {},
            }
        }
        return this._executeResult!.ruleItems[dn]
    }

    private _hasError() {
        return this._executeResult!.success
    }

    private _acceptScriptErrors(source: string, result: Result) {
        if (!result.success) {
            this._executeResult!.success = false
            for (let msg of result.messages!) {
                let msgInfo = {
                    source: [source],
                    msg: msg,
                }
                let hash = calculateObjectHashStr(msgInfo)
                if (!(hash in this._messageHashes!)) {
                    this._messageHashes![hash] = true
                    this._executeResult!.messages.push(msgInfo)
                }
            }
        }
    }

    private _getExecuteResult(): ExecuteResult {
        let result = this._executeResult!
        this._executeResult = null
        return result
    }
}
