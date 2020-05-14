const _ = require('the-lodash');
const Promise = require('the-promise');
const TargetProcessor = require('../target/processor');
const ValidationProcessor = require('../validator/processor');

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
            messages: {},
            ruleItems: {}
        };

        return this._prepare()
            .then(() => {
                if (!this._executeResult.success) {
                    this._markExecuteFailure('Failed to validate scripts');
                    return;
                }
        
                return this._execute();
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
                if (!this._executeResult.success) {
                    this._markExecuteFailure('Failed to fetch target items');
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
              if (!result.success) {
                  this._markExecuteFailure('Error in target script.');
              }
          });
    }

    _prepareScript()
    {
        this._validationProcessor = new ValidationProcessor(this._ruleScriptSrc);
        return this._validationProcessor.prepare()
            .then(result => {
                if (!result.success) {
                    this._markExecuteFailure('Error in rule script.');
                }
            });
    }

    _executeTarget()
    {
        return this._targetProcessor.execute(this._state)
            .then(results => {
                this._executeResult.targetItems = results;
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
                if (!result.success) 
                {
                    this._markExecuteFailure('Rule script failed.');

                    for(var x of result.messages)
                    {
                        this._markExecuteFailure(x);
                    }
                }
                else
                {
                    if (result.validation.hasErrors) {
                        this._getRuleItem(item.dn).hasError = true;
                    } else if (result.validation.hasWarnings) {
                        this._getRuleItem(item.dn).hasWarning = true;
                    }
                }
            })
    }

    _getRuleItem(dn)
    {
        if (!this._executeResult.ruleItems[dn]) {
            this._executeResult.ruleItems[dn] = {}
        }
        return this._executeResult.ruleItems[dn];
    }

    _markExecuteFailure(msg)
    {
        this._executeResult.success = false;
        this._executeResult.messages[msg] = true;
    }

    _getExecuteResult()
    {
        var result = this._executeResult;
        this._executeResult = null;
        result.messages = _.keys(result.messages);
        return result;
    }
}

module.exports = RuleProcessor;