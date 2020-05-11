const _ = require('the-lodash');
const Promise = require('the-promise');
const TargetProcessor = require('../target/processor');
const ValidatorProcessor = require('../validator/processor');
const RuleItem = require('./item');

class RuleProcessor
{
    constructor(state, ruleObj)
    {
        this._state = state;
        this._ruleObj = ruleObj;
        this._ruleTargetSrc = ruleObj.target;
        this._ruleScriptSrc = ruleObj.script;
    }

    prepare()
    {
        this._prepareResult =  {
            success: false,
            messages: []
        };

        return this._prepareTargets()
            .then(() => {
                return this._prepareScript();
            })
            .then(() => {
                this._prepareResult.success = (this._prepareResult.messages.length == 0);
                return this._prepareResult;
            })
    }

    execute()
    {
        this._executeResult =  {
            success: true,
            targetItems: [],
            messages: {},
            ruleItems: {}
        };

        if (!this._prepareResult.success) {
            this._markExecuteFailure('Failed to validate scripts');
            return this._getExecuteResult();
        }

        return this._executeTarget()
            .then(() => this._executeValidators())
            .then(() => {
                return this._getExecuteResult();
            })
    }

    _getExecuteResult()
    {
        this._executeResult.messages = _.keys(this._executeResult.messages);
        return this._executeResult;
    }

    _prepareTargets()
    {
        this._targetProcessor = new TargetProcessor(this._ruleTargetSrc);
        return this._targetProcessor.prepare()
          .then(result => {
              if (!result.success) {
                  this._prepareResult.messages.push('Error in target script.');
              }
              this._prepareResult.messages = _.concat(this._prepareResult.messages, result.messages);
          });
    }

    _prepareScript()
    {
        this._validatorProcessor = new ValidatorProcessor(this._ruleScriptSrc);
        return this._validatorProcessor.prepare()
            .then(result => {
                if (!result.success) {
                    this._prepareResult.messages.push('Error in rule script.');
                }

                this._prepareResult.messages = _.concat(this._prepareResult.messages, result.messages);
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
        var ruleItem = new RuleItem(item.dn, this._state);
        // console.log(ruleItem._dn);
        // console.log(ruleItem.getProperties('props'));

        return this._validatorProcessor.execute(ruleItem)
            .then(result => {
                // console.log(result);

                if (!result.success) 
                {
                    for(var x of result.messages)
                    {
                        this._markExecuteFailure(x);
                    }
                }
                else
                {
                    if (result.hasErrors) {
                        this._getRuleItem(item.dn).hasError = true;
                    } else if (result.hasWarnings) {
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
}

module.exports = RuleProcessor;