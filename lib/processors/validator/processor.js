const _ = require('the-lodash');
const Promise = require('the-promise');
const Compiler = require('../compiler');
const ScriptItem = require('../script-item');

class ValidationProcessor
{
    constructor(src)
    {
        this._runnable = null;
        this._src = src;
        this._compilerMessages = [];
    }

    prepare()
    {
        this._compilerMessages = [];
        var result = {
            success: false,
            messages: this._compilerMessages
        };

        return this._loadModule()
            .then(runnable => {
                this._runnable = runnable;
            })
            .then(() => {
                this._validate();
                result.success = (result.messages.length == 0);
            })
            .catch(reason => {
                result.success = false;
                result.messages.push(reason.message);
            })
            .then(() => result)
            ;
    }

    _loadModule()
    {
        return Promise.resolve()
            .then(() => {
                var compilerValues = {
                    item: null,
                    error: null,
                    warning: null 
                };
        
                var compiler = new Compiler(this._src, 'RULE_VALIDATOR', compilerValues);
                // compiler.enableVerboseOutput();
                return compiler.compile();
            });
    }

    _validate()
    {
        
    }

    execute(dn, state)
    {
        var item = new ScriptItem(dn, state);

        var result = {
            success: false,
            messages: [],
            validation: {
                hasErrors: false,
                hasWarnings: false
            }
        }
        var valueMap = {
            item: item,
            error: (msg) => {
                result.validation.hasErrors = true;
            },
            warning: (msg) => {
                result.validation.hasWarnings = true;
            },
        }
        return this._runnable.run(valueMap)
            .then(() => {
                result.success = true;
            })
            .catch(reason => {
                result.success = false;
                result.messages.push(reason.message);
            })
            .then(() => result);
    }

}

module.exports = ValidationProcessor;