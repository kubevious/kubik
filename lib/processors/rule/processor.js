const _ = require('the-lodash');
const Promise = require('the-promise');
const TargetProcessor = require('../target/processor');
const ValidationProcessor = require('../validator/processor');
const HashUtils = require('kubevious-helpers').HashUtils;

class RuleProcessor
{
    constructor(state, ruleObj)
    {
        this._state = state;
        this._ruleObj = ruleObj;
        this._ruleTargetSrc = ruleObj.target;
        this._ruleScriptSrc = ruleObj.script;
    }

    process()
    {
        this._executeResult =  {
            success: true,
            targetItems: [],
            messages: [],
            messageHashes: {},
            ruleItems: {}
        };

        return this._prepare()
            .then(() => {
                if (!this._hasError()) {
                    return;
                }

                return this._execute();
            })
            .catch(reason => {
                this._acceptScriptErrors('rule', 
                    { 
                        success: false, 
                        messages: [ 'Unknown error happened.' ]
                    });
            })
            .then(() => {
                return this._getExecuteResult();
            })
    }

    _prepare()
    {
        return this._prepareTargets()
            .then(() => {
                return this._prepareScript();
            })
    }

    _execute()
    {
        return this._executeTarget()
            .then(() => {
                if (!this._hasError()) {
                    return;
                }

                return this._executeValidators();
            })

    }

    _prepareTargets()
    {
        this._targetProcessor = new TargetProcessor(this._ruleTargetSrc);
        return this._targetProcessor.prepare()
          .then(result => {
              this._acceptScriptErrors('target', result);
          });
    }

    _prepareScript()
    {
        this._validationProcessor = new ValidationProcessor(this._ruleScriptSrc);
        return this._validationProcessor.prepare()
            .then(result => {
                this._acceptScriptErrors('script', result);
            });
    }

    _executeTarget()
    {
        return this._targetProcessor.execute(this._state)
            .then(result => {
                this._acceptScriptErrors('target', result);

                if (result.success) {
                    this._executeResult.targetItems = result.items;
                }
            })
            ;
    }

    _executeValidators()
    {
        return Promise.serial(this._executeResult.targetItems, x => this._executeValidator(x))
    }

    _executeValidator(item)
    {
        return this._validationProcessor.execute(item.dn, this._state)
            .then(result => {
                this._acceptScriptErrors('script', result);

                if (result.success) 
                {
                    if (result.validation.hasErrors) {
                        this._getRuleItem(item.dn).errors = {
                            present: true,
                            messages: _.keys(result.validation.errorMsgs)
                        };
                    } else if (result.validation.hasWarnings) {
                        this._getRuleItem(item.dn).warnings = {
                            present: true,
                            messages: _.keys(result.validation.warnMsgs)
                        };
                    }
                    
                    if (result.validation.marks) 
                    {
                        if (_.keys(result.validation.marks).length > 0)
                        {
                            this._getRuleItem(item.dn).marks = result.validation.marks; 
                        }
                    }
                }
            })
    }

    _getRuleItem(dn)
    {
        if (!this._executeResult.ruleItems[dn]) {
            this._executeResult.ruleItems[dn] = {
                errors: null,
                warnings: null,
                marks: {}
            }
        }
        return this._executeResult.ruleItems[dn];
    }

    _hasError()
    {
        return this._executeResult.success;
    }

    _acceptScriptErrors(source, result)
    {
        if (!result.success)
        {
            this._executeResult.success = false;
            for(var msg of result.messages)
            {
                var msgInfo = {
                    source: [source],
                    msg: msg
                }
                var hash = HashUtils.calculateObjectHashStr(msgInfo);
                if (!(hash in this._executeResult.messageHashes)) {
                    this._executeResult.messageHashes[hash] = true;
                    this._executeResult.messages.push(msgInfo);
                }
            }
        }
    }

    _getExecuteResult()
    {
        var result = this._executeResult;
        this._executeResult = null;
        delete result.messageHashes;
        return result;
    }
}

module.exports = RuleProcessor;